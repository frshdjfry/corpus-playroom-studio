import React,{useEffect,useState} from 'react';
import {KeyframeField,NumberField,RangeField} from './controls.jsx';
import {InspectorSection} from './inspector.jsx';
import {FIXTURE_TYPES,MAX_LIGHTS,STOCK_URL,beamGeometry,aimFromAngles} from './lighting.js';
import {RIGGING} from './rigging-plan.js';
import {elevations,sailName} from './model.js';
import {AMBIENT_CHANNEL,fixtureChannel,THEATRE_CHANNEL} from './rehearsal.js';
import {LightingMap} from './lighting-map.jsx';

const gels=[['#fff1d6','Warm white'],['#ffc36b','Amber'],['#719cff','Blue'],['#78e4e1','Cyan'],['#ed7bc3','Pink']];

function FixtureTypes(){
 return Object.entries(FIXTURE_TYPES).map(([key,spec])=><option key={key} value={key}>{spec.label}</option>);
}

export function LightAdd({count,onAdd}){
 return <select className="entity-add" aria-label="Add light" value="" disabled={count>=MAX_LIGHTS} onChange={event=>onAdd(event.target.value)}>
  <option value="" disabled>+ Add light</option><FixtureTypes/>
 </select>;
}

function FixtureColour({animation}){
 const [hex,setHex]=useState(animation.value);
 const [error,setError]=useState(false);
 useEffect(()=>{setHex(animation.value);setError(false);},[animation.value]);
 function commit(){
  if(!/^#[0-9a-f]{6}$/i.test(hex)){setError(true);return;}
  if(hex.toLowerCase()!==animation.value.toLowerCase())animation.change(hex.toLowerCase());
 }
 return <KeyframeField label="colour" animation={animation}>
  <div className="colour-control">
   <label>Colour<input type="color" aria-label="Light colour" value={animation.value} onChange={e=>animation.change(e.target.value)} disabled={animation.disabled}/></label>
   <div className="colour-swatches">{gels.map(([color,label])=><button key={color} style={{background:color}} aria-label={label}
    aria-pressed={color===animation.value} onClick={()=>animation.change(color)} disabled={animation.disabled}/>)}</div>
  </div>
  <details className="light-advanced"><summary>Hex value</summary>
   <label className="select-field">Colour hex<input className="text-field" value={hex} disabled={animation.disabled} aria-invalid={error}
    onChange={event=>{setHex(event.target.value);setError(false);}} onBlur={commit}
    onKeyDown={event=>{if(event.key==='Enter')event.currentTarget.blur();}}/></label>
   {error&&<span className="field-error" role="alert">Enter a value like #aabbcc.</span>}
  </details>
 </KeyframeField>;
}

export function LightingControls({model,characters,stageSails,onChange,selected,onSelect,onAimClick,aiming,section,animate,draft,onPreview,disabled,timelinePreview,opening}){
 const [target,setTarget]=useState('');
 const {lighting}=model,{fixtures}=lighting;
 const f=fixtures.find(light=>light.id===selected)??fixtures[0];
 const set=patch=>onChange(current=>({...current,...patch}));
 const edit=patch=>onChange(current=>({...current,fixtures:current.fixtures.map(light=>light.id===f.id?{...light,...patch}:light)}));

 if(section==='room'){
  const blend=animate(THEATRE_CHANNEL,Number(lighting.mode==='theatre'));
  const ambient=animate(AMBIENT_CHANNEL,lighting.ambient,value=>set({ambient:value}));
  return <InspectorSection title="Room lighting" meta={opening?'Opening look':timelinePreview?'Timeline':'Setup'}>
   {!timelinePreview&&<div className="mode-toggle" role="group" aria-label="Setup lighting">
    <button aria-pressed={lighting.mode==='neutral'} onClick={()=>set({mode:'neutral'})}>Neutral</button>
    <button aria-pressed={lighting.mode==='theatre'} onClick={()=>set({mode:'theatre'})}>Theatre</button>
   </div>}
   {timelinePreview&&<KeyframeField label="theatre blend" animation={blend}>
    <RangeField label="Theatre blend" value={blend.value*100} onChange={value=>blend.change(value/100)}
     min={0} max={100} suffix="%" disabled={blend.disabled}/>
    <div className="slider-ends" aria-hidden="true"><span>Neutral</span><span>Theatre</span></div>
   </KeyframeField>}
   <KeyframeField label="ambient fill" animation={ambient}>
    <RangeField label="Ambient fill" value={ambient.value*100} onChange={value=>ambient.change(value/100)}
     min={0} max={30} step={.5} suffix="%" digits={1} disabled={ambient.disabled}/>
   </KeyframeField>
  </InspectorSection>;
 }

 if(!f)return <p className="panel-empty">Add a fixture to place and aim a light.</p>;
 const spec=FIXTURE_TYPES[f.type];
 if(section==='output'){
  const dimmer=animate(fixtureChannel(f.id,'level'),f.intensity,value=>edit({intensity:value}));
  const colour=animate(fixtureChannel(f.id,'color'),f.color,value=>edit({color:value}));
  return <InspectorSection title="Fixture output" meta={opening?'Opening look':undefined}>
   <KeyframeField label="dimmer" animation={dimmer}>
    <RangeField label="Dimmer" value={dimmer.value} min={0} max={100} suffix="%" onChange={dimmer.change} disabled={dimmer.disabled}/>
    {!f.enabled&&<p className="small-note">Fixture muted. Dimmer keys are retained.</p>}
   </KeyframeField>
   <label className="checkbox-row"><input type="checkbox" checked={f.shadows} onChange={e=>edit({shadows:e.target.checked})}/>Cast shadows <small className="fixture-scope">Whole show</small></label>
   <FixtureColour key={f.id} animation={colour}/>
   <div className="light-advanced">
    <h3>Beam setup</h3>
    <RangeField label="Beam angle" value={f.beam} min={spec.minBeam} max={spec.maxBeam} step={.5} suffix="°" digits={1} onChange={v=>edit({beam:v})}/>
    <RangeField label="Edge softness" value={f.softness*100} min={0} max={100} suffix="%" onChange={v=>edit({softness:v/100})}/>
    <p className="small-note">Beam angle measures the full cone.</p>
   </div>
  </InspectorSection>;
 }

 const shown=draft?.id===f.id ? {...f,...draft.patch} : f;
 const pose=beamGeometry(model,shown);
 const used=fixtures.filter(light=>light.type===f.type).length;
 const sail=stageSails.find(item=>String(item.id)===target);
 function aimAtSail(){
  const heights=elevations(sail.dimensions??model,sail.closed);
  edit({aim:{x:sail.x,y:sail.y,height:(heights.top+heights.bottom)/2}});
 }
 return <>
  <InspectorSection title="Aim" meta={`Bar ${shown.bar}`}>
   <div className="aim-buttons">
    <button id="aim-in-viewport" className="primary" disabled={disabled} aria-pressed={aiming} onClick={onAimClick}>{aiming?'Cancel aim':'Aim in viewport'}</button>
   </div>
   {stageSails.length>0&&<div className="aim-sail">
    <select aria-label="Sail target" value={sail?target:''} disabled={disabled} onChange={event=>setTarget(event.target.value)}>
     <option value="" disabled>Choose a sail</option>
     {stageSails.map(item=><option key={item.id} value={item.id}>{sailName(item)}</option>)}
    </select>
    <button disabled={!sail||disabled} onClick={aimAtSail}>Aim at sail</button>
   </div>}
   <LightingMap key={f.id} model={model} characters={characters} fixture={f} shown={shown} onSelect={onSelect} disabled={disabled}
    onPreview={patch=>onPreview(f.id,patch)} onCommit={edit}/>
   <details className="light-advanced">
    <summary>Exact placement</summary>
    <label className="select-field">Mounting bar<select value={shown.bar} disabled={disabled} onChange={e=>edit({bar:e.target.value})}>
     {RIGGING.bars.map(bar=><option key={bar.id} value={bar.id}>Bar {bar.id}</option>)}
    </select></label>
    <RangeField label="Position along bar" value={shown.position*100} min={0} max={100} suffix="%" disabled={disabled} onChange={v=>edit({position:v/100})}/>
    <div className="fields">
     <NumberField label="Pan" value={pose.pan} min={-180} max={180} step={1} suffix="°" disabled={disabled} onChange={v=>edit({aim:aimFromAngles(model,f,v,pose.tilt)})}/>
     <NumberField label="Tilt" value={pose.tilt} min={-90} max={90} step={1} suffix="°" disabled={disabled} onChange={v=>edit({aim:aimFromAngles(model,f,pose.pan,v)})}/>
     <NumberField label="Target X" value={shown.aim.x} min={-30000} max={30000} disabled={disabled} onChange={v=>edit({aim:{...f.aim,x:v}})}/>
     <NumberField label="Target Y" value={shown.aim.y} min={-30000} max={30000} disabled={disabled} onChange={v=>edit({aim:{...f.aim,y:v}})}/>
    </div>
    <p className="small-note">Pan 0° points upstage. Positive tilt points down. The ring marks the start of the bar.</p>
   </details>
  </InspectorSection>
  <InspectorSection title="Fixture setup">
   <div className="light-title">
    <label>Name<input type="text" maxLength={40} value={f.name} onChange={e=>edit({name:e.target.value})}/></label>
    <label className="light-switch"><input aria-label="Fixture enabled" type="checkbox" checked={f.enabled} onChange={e=>edit({enabled:e.target.checked})}/>Enabled</label>
   </div>
   <label className="select-field">Fixture type<select value={f.type} onChange={e=>{
    const type=e.target.value,s=FIXTURE_TYPES[type];edit({type,beam:s.beam,softness:s.softness});
   }}><FixtureTypes/></select></label>
   {used>spec.stock&&<p className="support-error">More of this type than the published stock list.</p>}
   <details className="light-advanced">
    <summary>Fixture details</summary>
    <p className="small-note">{spec.note}</p>
    <p className="small-note">{used} used / {spec.stock} listed. Beam and colour are approximate.</p>
    <a className="plan-source" href={STOCK_URL} target="_blank" rel="noreferrer">Venue fixture stock ↗</a>
   </details>
  </InspectorSection>
 </>;
}
