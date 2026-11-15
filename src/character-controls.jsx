import React, {useMemo, useRef, useState} from 'react';
import {KeyframeField, NumberField} from './controls.jsx';
import {InspectorSection} from './inspector.jsx';
import {characterLayout, CHARACTER_FIELDS, movePoseJoint, POSE_HANDLES, POSE_PRESETS, STANDING_SPAN} from './characters.js';
import {CharacterMap, svgPoint} from './character-map.jsx';
import './characters.css';

function CharacterNumber({character, field, label, suffix, onEdit, disabled}) {
  return <NumberField label={label} value={character[field]} min={CHARACTER_FIELDS[field][0]} max={CHARACTER_FIELDS[field][1]}
    suffix={suffix} step={field === 'direction' ? 1 : 10} disabled={disabled} onChange={value => onEdit({[field]:value})}/>;
}

export function CharacterControls({model, character, placement, preview, animations, onSelect, onEdit, onPreview, onCommit}) {
  const placementArea=useRef(null), poseArea=useRef(null);
  const jump=ref=>{ref.current?.focus({preventScroll:true});ref.current?.scrollIntoView({block:'start'});};
  if(!character)return <p className="panel-empty">Add a character to start blocking the scene.</p>;
  return <>
    <div className="blocking-jumps"><button onClick={()=>jump(placementArea)}>Placement</button><button onClick={()=>jump(poseArea)}>Pose</button></div>
    <div ref={placementArea} tabIndex={-1} className="inspector-section character-placement">
        <div className="blocking-key-controls">
          {[['position','Position'], ['direction','Facing']].map(([id,label]) => <KeyframeField key={id}
            label={label.toLowerCase()} animation={animations[id]}>
            <button type="button" className="blocking-track-button" aria-pressed={animations[id].focused}
              onClick={animations[id].focus}>{label}</button>
          </KeyframeField>)}
        </div>
        <CharacterMap key={character.id} model={model} character={placement} preview={preview}
          onSelect={onSelect} onPreview={onPreview} onCommit={onCommit} disabled={animations.position.disabled}/>
        <details className="light-advanced character-coordinates">
          <summary>Exact placement</summary>
          <div className="fields">
            <CharacterNumber character={preview} field="x" label="X · from left" onEdit={onCommit} disabled={animations.position.disabled}/>
            <CharacterNumber character={preview} field="y" label="Y · from front" onEdit={onCommit} disabled={animations.position.disabled}/>
            <CharacterNumber character={preview} field="direction" label="Facing" suffix="°" onEdit={onCommit} disabled={animations.direction.disabled}/>
          </div>
          <p className="small-note">0° faces Audience A.</p>
        </details>
    </div>
    <div ref={poseArea} tabIndex={-1}><CharacterPose key={character.id} character={preview} animations={animations} onPreview={onPreview} onCommit={onCommit}/></div>
    <InspectorSection title="Character setup">
        <div className="fields character-fields">
          <label className="character-name">Name
            <input className="text-field" value={character.name} maxLength={60} onChange={event => onEdit({name:event.target.value})}/>
          </label>
          <CharacterNumber character={character} field="height" label="Standing height" onEdit={onEdit}/>
        </div>
        <div className="fields character-colours">
          <label>Body colour
            <input type="color" value={character.bodyColor} onInput={event => onEdit({bodyColor:event.currentTarget.value})}/>
          </label>
          <label>Joint colour
            <input type="color" value={character.jointColor} onInput={event => onEdit({jointColor:event.currentTarget.value})}/>
          </label>
        </div>
    </InspectorSection>
  </>;
}

const VIEWS = [['left', 'Left'], ['front', 'Front'], ['right', 'Right']];
const WIDTH = 156, HEIGHT = 202, FLOOR = 182;
const horizontal = (point, view) => view === 'front' ? point[0] : view === 'left' ? -point[2] : point[2];

function poseProjection(layout, character) {
  const scale = character.height / STANDING_SPAN;
  const lift = displayLift(character.elevation, scale);
  const zoom = Math.min(126, (FLOOR - 12) / (layout.top - layout.floor + lift));
  const pelvis = FLOOR + (layout.floor - lift) * zoom;
  return {scale, zoom, pelvis};
}

// Compress the upper part of the elevation range to leave the joints usable
// even when a figure is several metres above the floor.
const FREE_LIFT = 0.28, MAX_DISPLAY_LIFT = 0.58;
function liftRatio(scale) {
  return (MAX_DISPLAY_LIFT - FREE_LIFT) / (CHARACTER_FIELDS.elevation[1] / scale - FREE_LIFT);
}
function displayLift(elevation, scale) {
  const lift = elevation / scale;
  return lift <= FREE_LIFT ? lift : FREE_LIFT + (lift - FREE_LIFT) * liftRatio(scale);
}
function elevationAt(lift, scale) {
  const actual = lift <= FREE_LIFT ? lift : FREE_LIFT + (lift - FREE_LIFT) / liftRatio(scale);
  return limitElevation(actual * scale);
}

function project(point, view, {zoom, pelvis}) {
  return [WIDTH / 2 + zoom * horizontal(point, view), pelvis - zoom * point[1]];
}

function BodyPart({part, view, projection}) {
  const [cx, cy] = project(part.center, view, projection);
  const across = horizontal(part.axis, view);
  const vertical = part.axis[1];
  const angle = Math.atan2(across, vertical) * 180 / Math.PI;
  const visibleAxis = Math.min(1, Math.hypot(across, vertical));
  const radius = part.radii[view === 'front' ? 0 : 2];
  const rx = radius * projection.zoom;
  const ry = Math.hypot(part.radii[1] * visibleAxis, radius * Math.sqrt(1 - visibleAxis ** 2)) * projection.zoom;
  const farSide = view !== 'front' && part.side && part.side !== view;
  return <ellipse className={`pose-body ${part.tone}${farSide ? ' far' : ''}`} cx={cx} cy={cy} rx={rx} ry={ry}
    transform={`rotate(${angle} ${cx} ${cy})`}/>;
}

function CharacterPose({character, animations, onPreview, onCommit}) {
  const [active, setActive] = useState(null);
  const [expanded,setExpanded]=useState('');
  const drag = useRef(null);
  const layout = useMemo(() => characterLayout(character.pose), [character.pose]);
  const projection = poseProjection(layout, character);
  const selectedPreset = POSE_PRESETS.find(({pose}) => Object.entries(pose).every(([bone, direction]) =>
    direction.every((value, axis) => Math.abs(value - character.pose[bone][axis]) < 1e-8)));
  const disabled = animations.pose.disabled;

  function moveJoint(pose, joint, view, x, y) {
    return movePoseJoint(pose, joint, view === 'front' ? 'front' : 'side', view === 'left' ? -x : x, y);
  }

  function start(event, view, joint) {
    if (disabled || event.button !== 0 || drag.current) return;
    event.preventDefault();
    const svg = event.currentTarget.ownerSVGElement;
    const point = svgPoint(svg, event);
    drag.current = {
      pointer:event.pointerId, joint, view, svg, point, projection,
      base:character, joints:layout.joints, result:null,
    };
    setActive(`${view}-${joint ?? 'lift'}`);
    animations[joint ? 'pose' : 'elevation'].focus();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event) {
    const current = drag.current;
    if (disabled || current?.pointer !== event.pointerId) return;
    const point = svgPoint(current.svg, event), {zoom,scale} = current.projection;
    const dx = (point.x - current.point.x) / zoom, dy = (current.point.y - point.y) / zoom;
    if (current.joint) {
      const joint = current.joints[current.joint];
      current.result = {pose:moveJoint(current.base.pose, current.joint, current.view, horizontal(joint, current.view) + dx, joint[1] + dy)};
    } else {
      current.result = {elevation:elevationAt(displayLift(current.base.elevation, scale) + dy, scale)};
    }
    onPreview(current.result);
  }

  function finish(event, commit) {
    const current = drag.current;
    if (current?.pointer !== event.pointerId) return;
    drag.current = null;
    if (commit && !disabled && current.result) onCommit(current.result);
    else onPreview(null);
  }

  function nudge(event, view, joint) {
    if (disabled) return;
    if(event.key==='PageDown'||event.key==='PageUp'){
      const controls=[...event.currentTarget.ownerSVGElement.querySelectorAll('[data-pose-control]')];
      const index=controls.indexOf(event.currentTarget);
      const next=(index+(event.key==='PageDown'?1:controls.length-1))%controls.length;
      event.preventDefault();controls[next].focus();return;
    }
    const direction = {ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,1], ArrowDown:[0,-1]}[event.key];
    if (!direction || (!joint && !direction[1])) return;
    event.preventDefault();
    if (!joint) {
      onCommit({elevation:limitElevation(character.elevation + direction[1] * (event.shiftKey ? 100 : 10))});
      return;
    }
    const point = layout.joints[joint], step = event.shiftKey ? 0.04 : 0.012;
    onCommit({pose:moveJoint(character.pose, joint, view, horizontal(point, view) + direction[0] * step, point[1] + direction[1] * step)});
  }

  function handleProps(view, joint) {
    const id=`${view}-${joint??'lift'}`;
    const tabStop=active?.startsWith(`${view}-`) ? active===id : !joint;
    return {
      role:'button', tabIndex:disabled || !tabStop ? -1 : 0, 'aria-disabled':disabled || undefined,'data-pose-control':true,
      onPointerDown:event=>start(event, view, joint), onPointerMove:move,
      onPointerUp:event=>finish(event, true), onPointerCancel:event=>finish(event, false),
      onLostPointerCapture:event=>finish(event, false), onKeyDown:event=>nudge(event, view, joint),
      onFocus:()=>{
        setActive(`${view}-${joint ?? 'lift'}`);
        animations[joint ? 'pose' : 'elevation'].focus();
      },
    };
  }

  return <InspectorSection title="Pose">
    <div className="pose-settings">
      <KeyframeField label="pose" animation={animations.pose}>
        <label className="select-field">Pose preset
          <select value={selectedPreset?.id ?? ''} disabled={disabled} onChange={event => {
            const preset = POSE_PRESETS.find(item => item.id === event.target.value);
            if (preset) onCommit({pose:structuredClone(preset.pose)});
            setActive(null);
          }}>
            <option value="" disabled>Custom</option>
            {POSE_PRESETS.map(({id,label}) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
      </KeyframeField>
      <KeyframeField label="elevation" animation={animations.elevation}>
        <CharacterNumber character={character} field="elevation" label="Elevation above stage" onEdit={onCommit} disabled={disabled}/>
      </KeyframeField>
    </div>
    <label className="select-field pose-expand">Pose view<select value={expanded} onChange={event=>setExpanded(event.target.value)}>
      <option value="">Three views</option>{VIEWS.map(([view,label])=><option key={view} value={view}>Enlarge {label.toLowerCase()}</option>)}
    </select></label>
    <div className="pose-triptych" data-expanded={Boolean(expanded)} style={{'--pose-body-colour':character.bodyColor,'--pose-joint-colour':character.jointColor}}>
      {VIEWS.map(([view,label]) => {
        const handles = POSE_HANDLES.filter(item => view === 'front' || !item.id.includes('-') || item.id.startsWith(view));
        const depth = part => view === 'front' ? part.center[2] : view === 'left' ? part.center[0] : -part.center[0];
        const parts = [...layout.parts].sort((a,b) => depth(a) - depth(b));
        const liftY = Math.max(15, Math.min(FLOOR - 13, projection.pelvis - 4));
        return <div key={view} className="pose-view" data-enlarged={view===expanded}>
          <span className="pose-view-title">{label}</span>
          <svg className="pose-editor" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="group" aria-label={`${label} pose view`}>
            <path d={`M${WIDTH / 2} 10V${FLOOR} M9 ${FLOOR}H${WIDTH - 9}`} className="pose-axis" aria-hidden="true"/>
            <g {...handleProps(view)} className="pose-lift" aria-label={`Adjust elevation in ${label.toLowerCase()} view`}>
              <title>Drag the body up or down</title>
              {parts.map((part, index) => <BodyPart key={index} part={part} view={view} projection={projection}/>)}
              <g transform={`translate(${WIDTH - 17} ${liftY})`}>
                <rect x="-10" y="-14" width="20" height="28" rx="4" className="pose-lift-hit"/>
                <path d="M0 -8V8 M-3 -5L0 -8L3 -5 M-3 5L0 8L3 5" className="pose-lift-arrow"/>
              </g>
            </g>
            {handles.map(({id,label:jointLabel}) => {
              const [x,y] = project(layout.joints[id], view, projection);
              return <g key={id} {...handleProps(view, id)}
                className={`pose-handle${active === `${view}-${id}` ? ' active' : ''}`}
                transform={`translate(${x} ${y})`} aria-label={`Move ${jointLabel.toLowerCase()} in ${label.toLowerCase()} view`}>
                <title>{jointLabel}</title><circle className="pose-hit" r="10"/><circle className="pose-dot" r="4.2"/>
              </g>;
            })}
          </svg>
        </div>;
      })}
    </div>
    <p className="small-note pose-help">Drag joints to pose. Use arrows to nudge and Page Up or Down to switch joints.</p>
  </InspectorSection>;
}

function limitElevation(value) {
  return Math.round(Math.max(CHARACTER_FIELDS.elevation[0], Math.min(CHARACTER_FIELDS.elevation[1], value)));
}
