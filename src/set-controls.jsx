import React from 'react';
import {KeyframeField,NumberField,RangeField} from './controls.jsx';
import {InspectorSection} from './inspector.jsx';
import {elevations,MAX_PROPS,MAX_SAILS,PROP_ELEVATION,PROP_SIZE,PROP_TYPES,SET_PLACEMENT,sailDimensions} from './model.js';
import {clamp,MapArea,MapLabel,planProjection,SetFootprint,StagePlan,usePlanDrag} from './stage-plan.jsx';

function SetPlacement({model,items,entry,preview,onSelect,onPreview,onCommit,disabled}) {
  const {item}=entry;
  const projection=planProjection([item],24);
  const displayed={...entry,item:preview};
  const [x,y]=projection.point(preview);
  const handle=28;
  const arm=angle=>[handle*Math.cos(angle*Math.PI/180),-handle*Math.sin(angle*Math.PI/180)];
  const [dx,dy]=arm(preview.angle),[baseX,baseY]=arm(item.angle);
  const position=(dx,dy)=>({x:clamp(Math.round(item.x+dx),SET_PLACEMENT.x),y:clamp(Math.round(item.y+dy),SET_PLACEMENT.y)});
  const drag=usePlanDrag({onPreview,onCommit,disabled});
  const move=drag(`Move ${entry.label} on map`,(dx,dy)=>position(dx/projection.scale,-dy/projection.scale),
    (dx,dy,shift)=>position(dx*(shift?100:10),dy*(shift?100:10)));
  const rotate=drag(`Rotate ${entry.label} on map`,(dx,dy,shift)=>{
    if (Math.hypot(baseX+dx,baseY+dy)<4) return null;
    const step=shift?15:1;
    return {angle:Math.round(Math.atan2(-baseY-dy,baseX+dx)*180/Math.PI/step)*step};
  },(dx,dy,shift)=>({angle:((item.angle+(dx||dy)*(shift?15:1)+540)%360)-180}));

  return <MapArea hint="Dot moves · Diamond rotates">
    <StagePlan projection={projection} label="Set placement map">
      {items.filter(other=>other.id!==entry.id).map(other=>{
        const [x,y]=projection.point(other.item);
        return <g key={other.id} className="stage-plan-item" role="button" tabIndex="0"
          aria-label={`Select ${other.label} on map`} onClick={()=>onSelect(other.id)}
          onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect(other.id);}}}>
          <title>{other.label}</title><SetFootprint entry={other} model={model} projection={projection}/>
          <circle className="stage-map-hit" cx={x} cy={y} r="8"/>
          <MapLabel name={other.label} x={x} y={y}/>
        </g>;
      })}
      <SetFootprint entry={displayed} model={model} projection={projection} selected/>
      <g transform={`translate(${x} ${y})`}>
        <circle className="stage-map-line stage-map-guide" r={handle}/>
        <path className="stage-map-line" d={`M0 0L${dx} ${dy}`}/>
        <g {...move} className="stage-map-drag">
          <title>Drag to move</title><circle className="stage-map-hit" r="10"/><circle className="stage-map-mark" r="5.5"/>
        </g>
        <g {...rotate} className="stage-map-drag" transform={`translate(${dx} ${dy})`}>
          <title>Drag to rotate</title><circle className="stage-map-hit" r="10"/>
          <rect className="stage-map-mark stage-map-rotation" x="-4" y="-4" width="8" height="8" rx="1" transform="rotate(45)"/>
        </g>
      </g>
    </StagePlan>
  </MapArea>;
}

function SailDimensions({dimensions,onChange}) {
  const {clearance,bagHeight,tieLength}=dimensions;
  const support=clearance+bagHeight+tieLength;
  return <div className="fields">
    <NumberField label="Fabric width" value={dimensions.fabricWidth} onChange={v=>onChange('fabricWidth',v)} min={300} max={4000}/>
    <NumberField label="Fabric height" value={dimensions.fabricHeight} onChange={v=>onChange('fabricHeight',v)} min={300} max={5000}/>
    <NumberField label="Batten length" value={dimensions.battenLength} onChange={v=>onChange('battenLength',v)} min={300} max={4500}/>
    <NumberField label="Upper batten height" value={elevations(dimensions).top} onChange={v=>onChange('fabricHeight',v-support)} min={support+300} max={support+5000}/>
    <NumberField label="Tie length" value={tieLength} onChange={v=>onChange('tieLength',v)} min={0} max={1000}/>
    <NumberField label="Sandbag height" value={bagHeight} onChange={v=>onChange('bagHeight',v)} min={50} max={500}/>
    <NumberField label="Open bag clearance" value={clearance} onChange={v=>onChange('clearance',v)} min={0} max={1000}/>
  </div>;
}

export function SetAdd({model,onAdd}) {
  return <select className="entity-add" aria-label="Add set object" value=""
    disabled={model.props.length>=MAX_PROPS && model.sails.length>=MAX_SAILS} onChange={event=>onAdd(event.target.value)}>
    <option value="" disabled>+ Add object</option>
    {Object.entries(PROP_TYPES).map(([type,{label}])=><option key={type} value={type} disabled={model.props.length>=MAX_PROPS}>{label}</option>)}
    <option value="sail" disabled={model.sails.length>=MAX_SAILS}>Sail</option>
  </select>;
}

export function SetControls({section,model,items,entry,preview,closed,raise,onSelect,onEdit,onPreview,disabled,support}) {
  const editingPlacement=section==='objects';
  const item=entry?.item;
  const sail=entry?.kind==='sail';
  const dimensions=item && (sail?sailDimensions(model,item):item.dimensions);
  const heights=sail && elevations(dimensions,closed);
  const resize=(key,value)=>onEdit({dimensions:{...dimensions,[key]:value}});
  if(!item)return <p className="panel-empty">Add a sail or a shape to start placing scenery.</p>;
  return <>
      {editingPlacement ? <>
        {sail&&<InspectorSection title="Operation">
          <KeyframeField label="raise" animation={raise}>
            <RangeField label="Raise" value={raise.value*100} onChange={value=>raise.change(value/100)} min={0} max={100} suffix="%" disabled={raise.disabled}/>
          </KeyframeField>
          <div className="readout">
            <span>Lower batten <strong>{Math.round(heights.bottom)} mm</strong></span>
            <span>Sandbag clearance <strong>{Math.round(heights.bagBottom)} mm</strong></span>
          </div>
        </InspectorSection>}
        <InspectorSection title="Placement" id="set-placement">
          <SetPlacement key={entry.id} model={model} items={items} entry={entry} preview={preview} disabled={disabled}
            onSelect={onSelect} onPreview={onPreview} onCommit={onEdit}/>
          <details className="light-advanced"><summary>Exact placement</summary><div className="fields">
            <NumberField label="X · from left" value={preview.x} onChange={x=>onEdit({x})} min={SET_PLACEMENT.x[0]} max={SET_PLACEMENT.x[1]} disabled={disabled}/>
            <NumberField label="Y · from front" value={preview.y} onChange={y=>onEdit({y})} min={SET_PLACEMENT.y[0]} max={SET_PLACEMENT.y[1]} disabled={disabled}/>
            <NumberField label="Rotation" value={preview.angle} onChange={angle=>onEdit({angle})} min={SET_PLACEMENT.angle[0]} max={SET_PLACEMENT.angle[1]} step={1} suffix="°" disabled={disabled}/>
            {!sail&&<NumberField label="Elevation above stage" value={item.elevation} onChange={elevation=>onEdit({elevation})} min={PROP_ELEVATION[0]} max={PROP_ELEVATION[1]} disabled={disabled}/>}
          </div><p className="small-note">0° points along positive X.</p></details>
        </InspectorSection>
        <InspectorSection title={sail?'Sail':PROP_TYPES[item.type].label}>
          <div className="set-appearance">
            <label className="select-field">Name<input className="text-field" key={entry.id} maxLength={60}
              value={item.name??entry.label} onChange={event=>onEdit({name:event.target.value})}/></label>
            {!sail&&<label>Colour<input type="color" value={item.color} onChange={event=>onEdit({color:event.target.value})}/></label>}
          </div>
        </InspectorSection>
      </> : <><InspectorSection title="Dimensions" id="set-dimensions">
        {sail ? <SailDimensions dimensions={dimensions} onChange={resize}/> : <div className="fields">
          {Object.entries(dimensions).map(([key,value])=><NumberField key={key} label={key[0].toUpperCase()+key.slice(1)}
            value={value} min={PROP_SIZE[0]} max={PROP_SIZE[1]} onChange={next=>resize(key,next)}/>)}
        </div>}
        {sail&&<p className="small-note">Upper batten height and fabric height are linked.</p>}
      </InspectorSection>
      {support&&<InspectorSection title="Suspension" id="sail-suspension">
        {support.valid?<div className="suspension-list">{support.ties.map(tie=><div key={tie.pickup}>
          <span>Pickup {tie.pickup+1} · Bar {tie.to.bar}</span><strong>{Math.round(tie.length)} mm · {tie.angleFromHorizontal.toFixed(1)}°</strong>
        </div>)}</div>:<p className="support-error" role="status">{support.reason}</p>}
        <p className="small-note">Angles are above horizontal. Bar height is estimated. Confirm proposed fixing points with the venue.</p>
      </InspectorSection>}</>}
  </>;
}
