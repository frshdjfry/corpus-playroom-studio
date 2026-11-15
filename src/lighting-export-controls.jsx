import React, {useLayoutEffect,useRef,useState} from 'react';
import {FIXTURE_TYPES} from './lighting.js';
import {formatTime} from './script.js';
import {PLAYROOM_LED_PATCH,writeLightingAscii} from './lighting-export.js';
import {isLightingCueNumber} from './rehearsal.js';
import './lighting-export.css';

function describeCue(row, previous) {
  if (!previous) return 'Preset';
  const entries=Object.entries(row.levels);
  const increases=entries.some(([id,level])=>level>previous.levels[id]);
  const decreases=entries.some(([id,level])=>level<previous.levels[id]);
  if (!increases&&!decreases) return 'Hold';
  if (increases&&decreases&&row.up===row.down) return row.up===0?'Instant change':`${row.up} s crossfade`;
  return [increases&&(row.up===0?'Brighten instantly':`Brighten over ${row.up} s`),
    decreases&&(row.down===0?'Dim instantly':`Dim over ${row.down} s`)].filter(Boolean).join(' · ');
}

export function LightingExportDialog({fixtures,savedPatch,cues,omitted,onClose,onReview,onRestoreGo,onDownload}) {
  const dialog = useRef(null);
  const [patch,setPatch] = useState(savedPatch ?? {});
  const [edits,setEdits] = useState({});
  const hasLed = fixtures.some(fixture=>PLAYROOM_LED_PATCH[fixture.type]);
  const rows = cues.map(cue => {
    const edit=edits[cue.id];
    const choices=Object.entries(cue.sharedFadeChoices??{});
    const unresolved=cue.issues.length>0&&(!choices.length||choices.some(([direction,options])=>!options.includes(edit?.[direction])));
    return {...cue,number:String(cue.number),...edit,choices,unresolved};
  });
  const completePatch = Object.fromEntries(fixtures.map(({id}) => [id,{
    channel:Number(patch[id]?.channel),address:Number(patch[id]?.address),
  }]));
  const mapping = Object.values(completePatch);
  const validPatch = fixtures.length > 0 && fixtures.every(({id,type}) => {
    const {channel,address} = completePatch[id];
    const addresses = PLAYROOM_LED_PATCH[type];
    return Number.isInteger(channel) && channel >= 1 && channel <= 9999 &&
      (addresses ? addresses.includes(address) : Number.isInteger(address) && address >= 1 && address <= 12);
  });
  const overlap = new Set(mapping.map(entry=>entry.channel)).size !== mapping.length ||
    new Set(mapping.map(entry=>entry.address)).size !== mapping.length;
  const validNumbers = rows.every((row,index) => /^(?:\d{1,4})(?:\.\d{1,2})?$/.test(row.number) &&
    isLightingCueNumber(Number(row.number)) && (index === 0 || Number(row.number)>Number(rows[index-1].number)));
  const conflicts = rows.some(row=>row.unresolved);
  const canExport = validPatch && !overlap && validNumbers && !conflicts;

  useLayoutEffect(()=>{dialog.current.showModal();},[]);

  function updatePatch(id,field,value) {
    setPatch(current=>({...current,[id]:{...current[id],[field]:value}}));
  }
  function updateCue(id,field,value) {
    setEdits(current=>({...current,[id]:{...current[id],[field]:value}}));
  }
  function download(event) {
    event.preventDefault();
    if (!canExport) return;
    const ready = rows.map(row => ({...row,number:Number(row.number)}));
    const numbers = Object.fromEntries(ready.map(({id,number})=>[id,number]));
    onDownload(writeLightingAscii(ready,completePatch,fixtures),completePatch,numbers);
  }

  return <dialog className="lighting-export-dialog" ref={dialog} aria-labelledby="lighting-export-title"
    onCancel={event=>{event.preventDefault();onClose();}}>
    <form onSubmit={download}>
      <header><h2 id="lighting-export-title">Export lighting</h2><button type="button" onClick={onClose}>Close</button></header>
      <div className="lighting-export-body">
        <p>Each row is one manual GO. Match each fixture to its desk channel and venue DMX address.</p>
        <h3>Fixture patch</h3>
        {fixtures.length===0 && <p>Add a fixture to export lighting cues.</p>}
        {fixtures.length>0 && <div className="lighting-patch-fields">
          <span>Fixture</span><span>Desk channel</span><span>Venue DMX</span>
          {fixtures.map(fixture=>{
            const name=fixture.name.trim()||`L${fixture.id}`;
            const addresses=PLAYROOM_LED_PATCH[fixture.type];
            const address=patch[fixture.id]?.address??'';
            return <React.Fragment key={fixture.id}>
              <div><strong>{name}</strong><small>{FIXTURE_TYPES[fixture.type].label}</small></div>
              <input type="number" aria-label={`${name} desk channel`} min={1} max={9999} step={1} required
                value={patch[fixture.id]?.channel??''} onChange={event=>updatePatch(fixture.id,'channel',event.target.value)}/>
              {addresses ? <select aria-label={`${name} DMX address`} required value={addresses.includes(Number(address))?address:''}
                onChange={event=>updatePatch(fixture.id,'address',event.target.value)}>
                <option value="" disabled>Choose</option>
                {addresses.map(value=><option key={value} value={value}>{value}</option>)}
              </select> : <input type="number" aria-label={`${name} DMX address`} min={1} max={12} step={1} required
                value={address} onChange={event=>updatePatch(fixture.id,'address',event.target.value)}/>}
            </React.Fragment>;
          })}
        </div>}
        {validPatch&&overlap&&<p className="field-error" role="alert">Use a different channel and DMX address for each fixture.</p>}
        <h3>Cue preview</h3>
        <div className="lighting-export-table" tabIndex={0} aria-label="Cue preview">
          <table>
            <thead><tr><th>GO time</th><th>Cue</th><th>Label</th><th>Transition</th><th>Intensity</th></tr></thead>
            <tbody>{rows.map((row,index)=><React.Fragment key={row.id}>
              <tr>
                <td>{index===0 ? 'Opening' : formatTime(row.time)}</td>
                <td><input aria-label={`Cue number, row ${index+1}`} inputMode="decimal" value={row.number} required
                  onChange={event=>updateCue(row.id,'number',event.target.value)}/></td>
                <td>{row.label}</td>
                <td>{row.unresolved?'Needs review':describeCue(row,rows[index-1])}</td>
                <td>{fixtures.map(({id,name})=><span key={id}>{name.trim()||`L${id}`} {Math.round(row.levels[id])}%</span>)}</td>
              </tr>
              {row.issues.length>0 && <tr><td colSpan={5}>
                <p className={row.unresolved?'field-error':undefined}>{row.issues.join(' ')}</p>
                {row.choices.map(([direction,options])=><label className="shared-export-fades" key={direction}>
                  <span>{direction==='up'?'Lights getting brighter':'Lights getting dimmer'}</span>
                  <select required aria-label={`${direction==='up'?'Shared brighten time':'Shared dim time'} for cue ${row.number}`}
                    value={edits[row.id]?.[direction]??''} onChange={event=>updateCue(row.id,direction,Number(event.target.value))}>
                    <option value="" disabled>Choose an export time</option>
                    {options.map(value=><option key={value} value={value}>{value===0?'Instant':`${value} seconds`}</option>)}
                  </select>
                </label>)}
                {row.choices.length>0&&<p className="small-note">This choice applies to this export.</p>}
                <button type="button" onClick={()=>onReview(row.time)}>Review in timeline</button>
              </td></tr>}
            </React.Fragment>)}</tbody>
          </table>
        </div>
        {!validNumbers&&<p className="field-error" role="alert">Use ascending cue numbers with up to two decimal places.</p>}
        {conflicts&&<p className="field-error" role="alert">Resolve the flagged cue timings before exporting.</p>}
        {omitted.length>0&&<section>
          <h3>Removed GOs</h3>
          <p>These dimmer changes are omitted from the export.</p>
          {omitted.map(time=><button key={time} type="button" onClick={()=>onRestoreGo(time)}>Restore GO at {formatTime(time)}</button>)}
        </section>}
        <p className="small-note">Downloading saves cue numbers and patch assignments to the project.</p>
        <p>ASCII uses the programmed dimmer levels independently of the room’s Theatre blend. Colour, aim and effects stay in the project.</p>
        {hasLed ? <p><strong>ColorSource setup.</strong> Import the file in Phantom ZerOS. In Fixture Schedule, swap each temporary channel to its ColorSource profile and venue mode, set the venue address, then check the cues before saving a <code>.zos</code> file. The ASCII file lists the channel and address assignments.</p>
          : <p>Load the file in Phantom ZerOS to review it. Loading a show on the desk replaces its active show.</p>}
      </div>
      <footer><button className="primary" type="submit" disabled={!canExport}>Download ASCII (.asc)</button></footer>
    </form>
  </dialog>;
}
