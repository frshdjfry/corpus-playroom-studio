import React, {useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {ControlIcon, NumberField} from './controls.jsx';
import {InspectorSection, TabList} from './inspector.jsx';
import {BLOCKING_PROPERTIES, MAX_SCENE_TITLE} from './rehearsal.js';
import {formatTime, MAX_KEY_TIME, parseTime, scriptSourceLines} from './script.js';
import './rehearsal.css';

export const DEPARTMENTS = [
  {id: 'set', label: 'Set', tabs: [
    {id: 'objects', label: 'Placement'}, {id: 'dimensions', label: 'Dimensions'},
  ]},
  {id: 'lighting', label: 'Lighting', tabs: [
    {id: 'fixtures', label: 'Aim'}, {id: 'output', label: 'Output'},
  ]},
  {id: 'blocking', label: 'Blocking', tabs: [{id: 'characters', label: 'Characters'}]},
  {id: 'audio', label: 'Audio', tabs: [{id: 'clips', label: 'Cues'}]},
];

export function useTransport({duration, snap}) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [preview, setPreview] = useState(false);
  const position = useRef(0);

  function move(value) {
    position.current = value;
    setTime(value);
  }

  function seek(value) {
    setPlaying(false);
    setPreview(true);
    move(value);
  }

  function togglePlay() {
    if (playing) {
      move(snap(position.current));
      setPlaying(false);
      return;
    }
    if (position.current >= duration) move(0);
    setPreview(true);
    setPlaying(true);
  }

  function baseLook() {
    setPlaying(false);
    setPreview(false);
  }

  useEffect(() => {
    if (!playing) return;
    const start = performance.now() - position.current * 1000;
    let frame, lastUpdate = -Infinity;
    const tick = now => {
      const elapsed = Math.min(duration, (now - start) / 1000);
      if (elapsed === duration || now - lastUpdate >= 32) {
        move(elapsed);
        lastUpdate = now;
      }
      if (elapsed < duration) frame = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration]);

  useEffect(() => {
    if (position.current > duration) move(duration);
  }, [duration]);

  return {time, playing, preview, seek, togglePlay, baseLook};
}

function scriptSections(moments, script, titles) {
  const source = scriptSourceLines(script);
  const sections = [];
  let section = {lines:[]};
  sections.push(section);
  moments.forEach((item, index) => {
    const title = titles.get(item.id);
    if (title) {
      section = {title, start:item, lines:[]};
      sections.push(section);
    }
    section.lines.push({item, text:source[index]});
  });
  return sections;
}

export function ScriptPanel({script, clock, moment, sceneTitles, playing, active, onSeek, onSceneChange, onScriptChange, onScriptPreview}) {
  const {moments} = clock;
  const sections = useMemo(() => scriptSections(moments, script, sceneTitles), [moments, script, sceneTitles]);
  const [text, setText] = useState(null);
  const [error, setError] = useState('');
  const [review,setReview]=useState(null);
  const [reattach,setReattach]=useState({});
  const [follow,setFollow]=useState(true);
  const [collapsedScenes, setCollapsedScenes] = useState(() => new Set());
  function applyScript(event) {
    event.preventDefault();
    try {
      if(!review){
        const result=onScriptPreview(text);
        if(result.affected.length){setReview(result);setReattach({});setError('');return;}
      }
      onScriptChange(text,reattach);
      setText(null);
      setReview(null);
      setReattach({});
      setError('');
    } catch (err) { setError(err.message); }
  }
  const currentLine = useRef(null);
  const scrollBox = useRef(null);
  const editButton = useRef(null);
  const [draft, setDraft] = useState(null);
  const editing = draft !== null;
  const title = sceneTitles.get(moment?.id);

  function closeEditor() {
    setDraft(null);
    editButton.current?.focus();
  }

  function saveScene(event) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    onSceneChange(draft.moment, draft.title.trim());
    closeEditor();
  }

  function toggleScene(id) {
    setCollapsedScenes(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderLine({item, text}) {
    const current = item.id === moment?.id;
    return <button key={item.id} type="button" className="script-line" aria-current={current ? 'step' : undefined}
      ref={current ? currentLine : null} onClick={() => onSeek(item.start)}>{text}</button>;
  }

  useEffect(() => {
    const line = currentLine.current, box = scrollBox.current;
    if (!active || !follow || !line || !box) return;
    const outer = box.getBoundingClientRect(), inner = line.getBoundingClientRect();
    if (inner.top < outer.top || inner.bottom > outer.bottom) {
      box.scrollTop += inner.top - outer.top - (box.clientHeight - inner.height) / 2;
    }
  }, [moment?.id, sceneTitles, editing, active,follow]);

  return <section className="script-panel" aria-labelledby="script-heading">
    <div>
      <header className="script-header">
        <h2 id="script-heading" className="script-heading">Script</h2>
        <button type="button" className="scene-edit-button"
          onClick={() => {setDraft(null);setText(script.raw);setError('');setReview(null);setReattach({});}}>
          {moments.length ? 'Edit script' : 'Paste script'}
        </button>
        {text===null&&moments.length>0&&<button type="button" className="scene-edit-button" aria-pressed={follow}
          onClick={()=>setFollow(value=>!value)}>{follow?'Following':'Follow playhead'}</button>}
        {moment && !title && text === null && <button ref={editButton} type="button" className="scene-edit-button"
          aria-expanded={editing} disabled={playing} onClick={() => setDraft({moment: moment.id, title:''})}>
          Start scene here
        </button>}
      </header>
      {draft && <form className="scene-editor" onSubmit={saveScene} onKeyDown={event => {
        if (event.key === 'Escape') closeEditor();
      }}>
        <label>Scene title
          <input value={draft.title} maxLength={MAX_SCENE_TITLE} autoFocus required
            onChange={event => setDraft({...draft, title: event.target.value})}/>
        </label>
        <div className="scene-editor-actions">
          <button className="primary" disabled={!draft.title.trim()}>Save</button>
          <button type="button" onClick={closeEditor}>Cancel</button>
          {sceneTitles.has(draft.moment) && <button type="button" onClick={() => {
            onSceneChange(draft.moment, null);
            closeEditor();
          }}>Remove marker</button>}
        </div>
      </form>}
    </div>
    {text !== null ? <form className="script-edit" onSubmit={applyScript}>
      <label>Script text<textarea value={text} onChange={event => {setText(event.target.value);setReview(null);setReattach({});}} autoFocus
        placeholder="Paste your script here"/></label>
      <p className="small-note">Each nonblank line becomes a timeline entry.</p>
      {moments.length > 0 && <p className="small-note">Keyframe times stay fixed. Scene markers follow matching lines.</p>}
      {review&&<div className="script-review">
        <strong>Scene starts changed</strong>
        {review.affected.map(marker=><label key={marker.moment}>{marker.title}
          <select value={reattach[marker.moment]??''} onChange={event=>setReattach(current=>({...current,[marker.moment]:event.target.value}))}>
            <option value="">Remove marker</option>
            {review.lines.map(line=><option key={line.id} value={line.id} disabled={review.affected.some(other=>other!==marker&&reattach[other.moment]===line.id)}>
              {(line.speaker?`${line.speaker}: ${line.text}`:line.text).trim().slice(0,100)}
            </option>)}
          </select></label>)}
        <button type="button" onClick={()=>{setReview(null);setReattach({});}}>Keep editing</button>
      </div>}
      {error && <p role="alert" className="support-error">{error}</p>}
      <div className="scene-editor-actions"><button className="primary">{review?'Apply changes':'Apply script'}</button>
        <button type="button" onClick={() => {setText(null);setError('');}}>Cancel</button></div>
    </form> : <div className="script-lines" ref={scrollBox} tabIndex={0}
      onWheel={()=>setFollow(false)} onTouchMove={()=>setFollow(false)}
      onPointerDown={event=>{if(event.currentTarget===event.target)setFollow(false);}}
      onKeyDown={event=>{if(['PageUp','PageDown','Home','End'].includes(event.key))setFollow(false);}}>
      {!moments.length && <p className="script-empty">Paste dialogue and stage directions to add entries to the timeline.</p>}
      {sections.map(({title, start, lines}, index) => {
        if (!start) return <React.Fragment key="unmarked">{lines.map(renderLine)}</React.Fragment>;
        const collapsed = collapsedScenes.has(start.id);
        const current = lines.some(({item}) => item.id === moment?.id);
        const bodyId = `script-scene-body-${index}`;
        return <section className="script-scene" key={`scene:${start.id}`} style={{'--scene-hue':start.hue}}>
          <div className="script-scene-header" ref={collapsed && current ? currentLine : null}>
            <h3 className="script-scene-title">
              <button type="button" onClick={() => onSeek(start.start)} aria-current={current ? 'location' : undefined}>{title}</button>
            </h3>
            <button type="button" className="script-scene-toggle" aria-expanded={!collapsed} aria-controls={bodyId}
              aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${title}`} onClick={() => toggleScene(start.id)}>
              <ControlIcon kind="chevron"/>
            </button>
            <details className="scene-menu"><summary aria-label={`Actions for ${title}`}><ControlIcon kind="more"/></summary><div>
              <button disabled={playing} onClick={event=>{
                event.currentTarget.closest('details').open=false;
                setDraft({moment:start.id,title});
              }}>Rename scene</button>
              <button disabled={playing} onClick={()=>onSceneChange(start.id,null)}>Remove scene marker</button>
            </div></details>
          </div>
          <div id={bodyId} hidden={collapsed}>{!collapsed && lines.map(renderLine)}</div>
        </section>;
      })}
    </div>}
  </section>;
}

function tickStep(duration) {
  const step = duration / 10;
  const magnitude = 10 ** Math.floor(Math.log10(step));
  return ([1, 2, 5, 10].find(value => value * magnitude >= step) ?? 10) * magnitude;
}

export function Timeline({department, onDepartment, markers, onMarker, animation, sceneTitles, transport, moment, clock,
  rows, selectedRow, channels, onChannel, blockingProperty, onBlockingProperty, lighting, pending, resolution, onCancelResolution, onResolve,
  onSavePending, onDiscardPending, pendingLabel, onPendingJump}) {
  const {time, playing, preview, seek, togglePlay, baseLook} = transport;
  const toggleFromKeyboard = useEffectEvent(togglePlay);
  useEffect(() => {
    let keyboardFocus = false;
    function trackFocus(event) {
      // Space can itself make :focus-visible match a control clicked with the pointer.
      keyboardFocus = event.type === 'focusin' && event.target.matches(':focus-visible');
    }
    function handleSpace(event) {
      if (event.key !== ' ' || event.defaultPrevented || event.isComposing ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target;
      if (target instanceof Element && (target.isContentEditable ||
        target.closest('input:not([type="range"]), textarea, select, dialog[open]'))) return;
      if (keyboardFocus && target instanceof Element &&
        target.closest('button:not(.play-button), [role="tab"], summary')) return;
      event.preventDefault();
      if (!event.repeat) toggleFromKeyboard();
    }
    window.addEventListener('focusin', trackFocus);
    window.addEventListener('pointerdown', trackFocus);
    window.addEventListener('keydown', handleSpace);
    return () => {
      window.removeEventListener('focusin', trackFocus);
      window.removeEventListener('pointerdown', trackFocus);
      window.removeEventListener('keydown', handleSpace);
    };
  }, []);
  const {moments, byId, duration, snap} = clock;
  const [zoom,setZoom]=useState(1);
  const [offset,setOffset]=useState(0);
  const [snapToCues,setSnapToCues]=useState(true);
  const span=Math.min(duration,Math.max(.8,Math.round(duration/zoom*10)/10));
  const clampOffset=value=>Math.max(0,Math.min(duration-span,Math.round(value*10)/10));
  const start=clampOffset(offset), end=start+span;
  const percent = value => `${(value-start) / span * 100}%`;
  const visible = value=>value>=start-1e-7 && value<=end+1e-7;
  const step = tickStep(span);
  const firstTick=Math.ceil(start/step-1e-8)*step;
  const majorTicks = Array.from({length:Math.max(0,Math.ceil((end-firstTick)/step))}, (_,index)=>firstTick+index*step);
  useEffect(()=>{
    setOffset(current=>{
      const left=clampOffset(current);
      return time<left||time>left+span ? clampOffset(time-span/2) : left;
    });
  },[time,span,duration]);
  function changeZoom(factor){
    const next=Math.max(1,Math.min(duration/.8,zoom*factor));
    setZoom(next);
    setOffset(time-duration/next/2);
  }
  const index = moments.indexOf(moment);
  const previous = moment && moments[time - moment.start > 0.5 ? index : index - 1];
  const next = moments[index + 1];
  const title = DEPARTMENTS.find(item => item.id === department).label;
  const ordered = markers.slice().sort((a, b) => byId.get(a.moment).start - byId.get(b.moment).start);
  const sceneStarts = moments.filter(item => sceneTitles.has(item.id));
  const activeScene = sceneStarts.findLast(item => item.start <= time);
  const stackedRows = lighting && animation && !rows.some(row=>row.id===animation.id) ? [...rows,animation] : rows;
  const trackOptions = department==='set' ? rows.map(row=>[row.id,row]) : channels;
  const trackList = useRef(null);
  useLayoutEffect(()=>{
    const list=trackList.current;
    const active=list?.querySelector('[data-active="true"]');
    if(!active)return;
    const row=active.getBoundingClientRect(), bounds=list.getBoundingClientRect();
    if(row.top<bounds.top)list.scrollTop+=row.top-bounds.top;
    else if(row.bottom>bounds.bottom)list.scrollTop+=row.bottom-bounds.bottom;
  },[selectedRow,department]);
  const playhead=visible(time)&&<span className="timeline-playhead" style={{left:percent(time)}} aria-hidden="true"/>;
  const cueTime=snap(time);
  const lightingCue=lighting?.cues.find(cue=>cue.time===time);
  const editableCue=playing ? undefined : lightingCue;
  const canRecord=lighting?.pendingCount>0&&!playing&&cueTime>0&&cueTime<=MAX_KEY_TIME;
  function alignTime(value,width){
    if(!lighting || !snapToCues)return snap(value);
    const nearest=lighting.cues.reduce((best,cue)=>Math.abs(cue.time-value)<Math.abs(best-value)?cue.time:best,0);
    return Math.abs(nearest-value)*width/span<=8 ? nearest : snap(value);
  }

  function scrubFromPointer(event) {
    if (event.target.closest('button')) return;
    const {left, width} = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - left) / width));
    seek(alignTime(start+ratio*span,width));
  }

  return <section className="timeline" data-department={department} aria-label="Rehearsal timeline">
    <div className="timeline-toolbar">
      <div className="transport-controls" role="group" aria-label="Playback controls">
        <button onClick={() => seek(previous.start)} disabled={!previous} aria-label="Previous script line" title="Previous script line"><ControlIcon kind="previous"/></button>
        <button className="play-button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}
          aria-keyshortcuts="Space" title={playing ? 'Pause (Space)' : 'Play (Space)'}>
          <ControlIcon kind={playing?'pause':'play'}/> {playing ? 'Pause' : 'Play'}
        </button>
        <button onClick={() => seek(next.start)} disabled={!next} aria-label="Next script line" title="Next script line"><ControlIcon kind="next"/></button>
        <span className="timeline-time"><strong>{formatTime(time)}</strong><span> / {formatTime(duration)}</span></span>
      </div>
      <div className="timeline-status" role="group" aria-label="Editing mode">
        <button aria-pressed={!preview} onClick={baseLook}>Setup</button>
        <button aria-pressed={preview} onClick={()=>seek(time)}>Timeline</button>
      </div>
    </div>
    {lighting&&<div className="lighting-timeline-actions">
      <div className="lighting-timeline-tools">
        <button type="button" onClick={lighting.onOpening} disabled={playing} title={`LX ${lighting.openingNumber} · Opening look`}>Opening look</button>
        <button type="button" onClick={lighting.onRecord} disabled={!canRecord}
          title="Save pending dimmer changes at the playhead">Record lighting cue</button>
        <label><input type="checkbox" checked={snapToCues} onChange={event=>setSnapToCues(event.target.checked)}/>Snap to GO</label>
      </div>
      <form key={editableCue ? `${editableCue.time}:${editableCue.label}` : 'unselected'} className="lighting-go-edit" onSubmit={event=>{
        event.preventDefault();
        if(editableCue)lighting.onRename(editableCue,new FormData(event.currentTarget).get('label'));
      }}>
        <label><span>Cue label</span><input name="label" aria-label="Cue label" defaultValue={editableCue?.label??''}
          placeholder="Select a GO" maxLength={60} disabled={!editableCue}/></label>
        <button type="submit" disabled={!editableCue}>Save label</button>
        <button type="button" className="remove-lighting-go" disabled={!editableCue} onClick={()=>lighting.onRemove(editableCue)}
          title="Remove the GO and keep its keyframes">Remove GO marker</button>
      </form>
    </div>}
    <div className="timeline-options">
      {department==='blocking'&&rows.length>0&&<label>Property <select value={blockingProperty} onChange={event=>onBlockingProperty(event.target.value)}>
        {BLOCKING_PROPERTIES.map(({id,label})=><option key={id} value={id}>{label}</option>)}
      </select></label>}
      {(lighting||department==='set')&&trackOptions.length>0&&<label>Track <select aria-label="Timeline track" value={selectedRow??''} onChange={event=>onChannel(event.target.value)}>
        {trackOptions.map(([id,channel])=><option key={id} value={id}>{channel.label}</option>)}
      </select></label>}
      <div className="timeline-zoom" role="group" aria-label="Timeline zoom">
        <button disabled={zoom===1} onClick={()=>changeZoom(.5)} aria-label="Zoom out">−</button>
        <button onClick={()=>{setZoom(1);setOffset(0);}}>Fit</button>
        <button disabled={span<=.8} onClick={()=>changeZoom(2)} aria-label="Zoom in">+</button>
      </div>
      {span<duration&&<input className="timeline-pan" type="range" aria-label="Pan timeline" min="0" max={duration-span} step="0.1"
        value={start} onChange={event=>setOffset(Number(event.target.value))}/>}
    </div>
    <div className="timeline-body">
      <div className="timeline-grid timeline-head">
        {sceneStarts.length > 0 && <div className="scene-track-label">Scenes</div>}
        <div className="timeline-lanes">
          <div className="timeline-ruler" onClick={scrubFromPointer}>
            {majorTicks.map(tick => <span key={tick} style={{left: percent(tick)}}>{step < 1 ? formatTime(tick) : formatTime(tick).slice(0, -2)}</span>)}
          </div>
          {sceneStarts.length > 0 && <div className="timeline-scenes" role="group" aria-label="Scene markers" onClick={scrubFromPointer}>
            {sceneStarts.map((item, index) => {
              const sceneTitle = sceneTitles.get(item.id);
              const sceneEnd = sceneStarts[index + 1]?.start ?? duration;
              const from=Math.max(start,item.start), to=Math.min(end,sceneEnd);
              if(to<=from)return null;
              return <button type="button" className="scene-marker" key={item.id} onClick={() => seek(item.start)}
                style={{left: percent(from), width: `${(to-from)/span*100}%`, '--scene-hue': item.hue}}
                aria-label={`${sceneTitle} at ${formatTime(item.start)}`} title={sceneTitle}
                aria-current={activeScene === item ? 'true' : undefined}><span>{sceneTitle}</span></button>;
            })}
          </div>}
          {playhead}
        </div>
      </div>
      <div className="timeline-rows" key={department} ref={trackList} aria-label={`${title} tracks`} role="region" tabIndex={stackedRows ? 0 : undefined}>
        {lighting && <div className="timeline-grid">
          <div className="track-label"><strong>GO cues</strong></div>
          <div className="timeline-track lighting-cue-lane" role="group" aria-label="Lighting GO cues" onClick={scrubFromPointer}>
            {lighting.cues.map(cue=>{
              if(!visible(cue.time))return null;
              const name=cue.number ? `LX ${cue.number} · ${cue.label}` : `${cue.label} · Preview only`;
              return <div className="timeline-event" key={cue.time} style={{left:percent(cue.time)}}>
                <button type="button" className="event-marker lighting-go-marker" onClick={()=>seek(cue.time)}
                  aria-current={cue===lightingCue?'step':undefined} data-conflict={cue.issues.length>0} data-preview={!cue.number}
                  aria-label={`${name} · GO at ${formatTime(cue.time)}${cue.issues.length?' · Timing conflict':''}`}
                  title={`${name} · ${formatTime(cue.time)}. ${cue.issues.join(' ')}`}><i/></button>
              </div>;
            })}
            {!lighting.cues.length&&<span className="track-empty">GO cues appear where saved lighting changes start.</span>}
            {playhead}
          </div>
        </div>}
        {stackedRows?.map(row=><div className="timeline-grid" key={row.id} data-active={row.id===selectedRow}>
          <button type="button" className="timeline-lane-label" title={row.label} aria-pressed={row.id===selectedRow}
            onClick={()=>onChannel(row.id)}>{row.name??row.label}</button>
          <div className="timeline-track" role="group" aria-label={row.static ? `${row.label} static` : `${row.label} keyframes`} onClick={scrubFromPointer}>
            {lighting?.cues.filter(cue=>visible(cue.time)).map(cue=><span className="lighting-go-guide" key={cue.time}
              style={{left:percent(cue.time)}} aria-hidden="true"/>)}
            {row.static ? <span className="track-empty">Static</span> : <KeyframeLane animation={row} transport={transport}
              clock={clock} percent={percent} visible={visible} span={span} alignTime={lighting ? alignTime : undefined}/>}
            {playhead}
          </div>
        </div>)}
        {!stackedRows?.length&&!lighting&&<div className="timeline-grid">
          <div className="track-label"><strong>{title}</strong>
            {markers.length>0&&<span>{markers.length} {markers.length===1?'cue':'cues'}</span>}</div>
          <div className="timeline-track" role="group" aria-label={title} onClick={scrubFromPointer}>
            {ordered.map((marker, index) => {
              const markerStart = byId.get(marker.moment).start;
              if(!visible(markerStart))return null;
              const following = byId.get(ordered[index + 1]?.moment)?.start ?? duration;
              const remaining = end - markerStart || 1;
              const width = seconds => `${Math.min(seconds, remaining) / remaining * 100}%`;
              return <div className="timeline-event" key={marker.moment} style={{left: percent(markerStart), '--event-room': width(following - markerStart)}}>
                <span className="event-duration" style={{width: width(marker.duration)}} aria-hidden="true"/>
                <button className="event-marker" onClick={() => onMarker(marker)} aria-current={moment?.id === marker.moment ? 'step' : undefined}
                  aria-label={`${marker.label || 'Untitled cue'} at ${formatTime(markerStart)}`} title={marker.label || 'Untitled cue'}><i/></button>
                <span className="event-name" title={marker.label}>{marker.label}</span>
              </div>;
            })}
            {stackedRows&&<span className="track-empty">{department==='set'?'Add a set object to see its track.':'Add a character to see its track.'}</span>}
            {playhead}
          </div>
        </div>}
      </div>
      <div className="timeline-grid timeline-scrub-row">
        <input className="timeline-scrub" aria-label="Timeline position" aria-valuetext={formatTime(time)} type="range"
          min={start} max={end} step="0.1" value={Math.min(end,Math.max(start,time))} onChange={event => seek(Number(event.target.value))}/>
      </div>
    </div>
    <KeyframeToolbar animation={animation} playing={playing} clock={clock} time={time}/>
    <PendingKeyframes {...{pending,resolution,onCancelResolution,onResolve,onSavePending,onDiscardPending,pendingLabel,onPendingJump}}/>
    <TabList className="department-tabs" tabs={DEPARTMENTS} active={department} onChange={onDepartment}
      prefix="department" label="Departments" controls={() => 'department-inspector'}/>
  </section>;
}

function PendingKeyframes({pending,resolution,onCancelResolution,onResolve,onSavePending,onDiscardPending,pendingLabel,onPendingJump}){
  const dialog=useRef(null);
  useEffect(()=>{if(resolution)dialog.current.showModal();},[resolution]);
  return <>
    {pending.length>0&&<details className="pending-keys"><summary>{pending.length} unsaved {pending.length===1?'keyframe':'keyframes'}</summary>
      <ul>{pending.map(item=><li key={JSON.stringify([item.id,item.time])}>
        <button onClick={()=>onPendingJump(item)}>{pendingLabel(item.id)} · {formatTime(item.time)}</button>
        <button onClick={()=>onSavePending(item)}>Save keyframe</button><button onClick={()=>onDiscardPending(item)}>Discard</button>
      </li>)}</ul>
    </details>}
    {resolution&&<dialog className="pending-dialog" ref={dialog} aria-labelledby="pending-dialog-heading" onCancel={event=>{event.preventDefault();onCancelResolution();}}>
      <h2 id="pending-dialog-heading">Unsaved keyframes</h2>
      <p>Save or discard {resolution.entries.length} pending {resolution.entries.length===1?'edit':'edits'} to continue with “{resolution.label}”.</p>
      <div><button autoFocus onClick={onCancelResolution}>Cancel</button>
        <button onClick={()=>onResolve(false)}>Discard and continue</button>
        <button className="primary" onClick={()=>onResolve(true)}>Save and continue</button></div>
    </dialog>}
  </>;
}

function KeyframeLane({animation, transport, clock, percent, visible, span, alignTime}) {
  const drag = useRef(null);
  const focusTime=useRef(null);
  const controls=useRef(new Map());
  const [moving, setMoving] = useState(null);
  useLayoutEffect(()=>{
    const button=controls.current.get(focusTime.current);
    if(button){button.focus({preventScroll:true});focusTime.current=null;}
  });
  function startDrag(event, time) {
    if (event.button !== 0 || transport.playing) return;
    drag.current = {
      time, x: event.clientX, width: event.currentTarget.closest('.timeline-track').clientWidth,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function dragTime(event) {
    const current = drag.current;
    if (current?.pointerId !== event.pointerId || Math.abs(event.clientX - current.x) < 4) return null;
    const time=current.time + (event.clientX - current.x) * span / current.width;
    return alignTime ? alignTime(time,current.width) : clock.snap(time);
  }
  function endDrag(event, time) {
    if (drag.current?.pointerId !== event.pointerId) return;
    const newTime = dragTime(event);
    drag.current = null;
    setMoving(null);
    if (newTime === null) animation.select(time);
    else animation.move(time, newTime);
  }
  return <>
    {animation.keys.filter(key=>visible(key.time)).map(key => <div className="timeline-event" key={key.time}
      style={{left: percent(moving?.from === key.time ? moving.to : key.time)}}>
      <button type="button" className="event-marker property-key"
        ref={node=>{if(node)controls.current.set(key.time,node);else controls.current.delete(key.time);}}
        aria-label={`Keyframe at ${formatTime(key.time)}`} title={`${animation.label} · ${formatTime(key.time)}`}
        aria-current={animation.selected?.time === key.time ? 'step' : undefined}
        data-at-playhead={Math.abs(transport.time-key.time)<1e-7}
        onPointerDown={event => startDrag(event, key.time)}
        onPointerMove={event => {
          const to = dragTime(event);
          if (drag.current) setMoving(to === null ? null : {from: key.time, to});
        }}
        onPointerUp={event => endDrag(event, key.time)}
        onPointerCancel={() => {drag.current = null;setMoving(null);}}
        onClick={event => {if (event.detail === 0 || transport.playing) animation.select(key.time);}}
        onKeyDown={event=>{
          if(transport.playing||!['ArrowLeft','ArrowRight'].includes(event.key))return;
          event.preventDefault();
          const time=clock.snap(key.time+(event.key==='ArrowLeft'?-1:1)*(event.shiftKey?1:.1));
          if(time===key.time)return;
          focusTime.current=time;
          if(animation.move(key.time,time))focusTime.current=null;
        }}>
        <i/>
      </button>
    </div>)}
  </>;
}

function KeyframeToolbar({animation, playing, clock, time}) {
  const key = animation?.selected;
  const previous=animation?.keys.findLast(item=>item.time<time-1e-7);
  const next=animation?.keys.find(item=>item.time>time+1e-7);
  return <div className="keyframe-toolbar">
    {animation&&<div className="key-navigation" role="group" aria-label="Navigate keyframes">
      <button disabled={!previous} onClick={()=>animation.select(previous.time)} aria-label="Previous keyframe"><ControlIcon kind="previous"/></button>
      <button disabled={!next} onClick={()=>animation.select(next.time)} aria-label="Next keyframe"><ControlIcon kind="next"/></button>
    </div>}
    {key && !playing ? <>
      <NumberField key={key.time} label="Key time" value={key.time} onChange={time => {
        if (Math.abs(time - key.time) > 0.005) return animation.move(key.time, clock.snap(time));
      }}
        min={0} max={clock.duration} step={0.1} suffix="" format={formatTime} parse={parseTime}/>
      <label title="Transition into the selected key">Transition <select aria-label="Key interpolation" value={key.curve} onChange={event => animation.curve(event.target.value)}>
        <option value="linear">Linear</option><option value="hold">Hold</option>
      </select></label>
      <button onClick={animation.remove}>Remove keyframe</button>
    </> : animation?.keys.length > 0 && <span>{playing ? 'Pause to edit keyframes.' : 'Select a keyframe to edit it.'}</span>}
    {animation?.notice&&<span className="key-notice" role="alert">{animation.notice}</span>}
  </div>;
}

export function AudioClips({markers, clock, moment, onSeek}) {
  const {byId} = clock;
  const selected = markers.find(item => item.moment === moment?.id);
  return <>
    <InspectorSection title="Audio cues" meta={markers.length ? 'Read-only example' : undefined}>
      <p className="small-note">{markers.length
        ? 'Script references from the example project.'
        : 'Audio cue editing is planned.'}</p>
      <div className="placeholder-marks">
        {markers.map(item => <button key={item.moment} aria-current={item === selected ? 'step' : undefined} onClick={() => onSeek(byId.get(item.moment).start)}>
          <span>{item.label}</span><time>{formatTime(byId.get(item.moment).start)}</time>
        </button>)}
      </div>
    </InspectorSection>
    {selected && <InspectorSection title={selected.label} meta={selected.duration ? `${selected.duration} s` : 'At line'}>
      <p className="small-note">{selected.detail}</p>
    </InspectorSection>}
  </>;
}
