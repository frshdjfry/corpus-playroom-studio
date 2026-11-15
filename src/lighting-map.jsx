import React from 'react';
import {characterName} from './characters.js';
import {NumberField} from './controls.jsx';
import {aimFromAngles,beamGeometry,lightMount,mountAtPoint} from './lighting.js';
import {setItems} from './model.js';
import {RIGGING} from './rigging-plan.js';
import {clamp,facingVector,MapArea,MapLabel,planProjection,SetFootprint,StagePlan,usePlanDrag} from './stage-plan.jsx';

const TARGET_RANGE=[-30000,30000];

function TiltDial({model,fixture,shown,onPreview,onCommit,disabled}) {
  const pose=beamGeometry(model,shown),base=beamGeometry(model,fixture);
  const radius=19, centreX=15,centreY=28;
  const vector=angle=>[radius*Math.cos(angle*Math.PI/180),radius*Math.sin(angle*Math.PI/180)];
  const [dx,dy]=vector(pose.tilt),[startX,startY]=vector(base.tilt);
  const setTilt=angle=>({aim:aimFromAngles(model,fixture,base.pan,clamp(angle,[-90,90]))});
  const drag=usePlanDrag({onPreview,onCommit,disabled});
  const handle=drag('Adjust fixture tilt on dial',(x,y,shift)=>{
    if(Math.hypot(startX+x,startY+y)<3)return null;
    const step=shift?5:1;
    return setTilt(Math.round(Math.atan2(startY+y,Math.max(0,startX+x))*180/Math.PI/step)*step);
  },(x,y,shift)=>setTilt(base.tilt+(x||-y)*(shift?5:1)));

  return <svg className="tilt-dial" viewBox="0 0 93 56" role="group" aria-label="Fixture tilt dial">
    <path className="stage-map-line stage-map-guide" d={`M${centreX} ${centreY-radius}a${radius} ${radius} 0 0 1 0 ${2*radius}`}/>
    <circle className="stage-map-light" cx={centreX} cy={centreY} r="4"/>
    <path className="stage-map-line" d={`M${centreX} ${centreY}l${dx} ${dy}`}/>
    <g {...handle} className="stage-map-drag" transform={`translate(${centreX+dx} ${centreY+dy})`}>
      <title>Drag to tilt the fixture</title><circle className="stage-map-hit" r="10"/>
      <circle className="stage-map-mark stage-map-target" r="4"/>
    </g>
    <text x="48" y="24">Tilt</text><text x="48" y="38">{Math.round(pose.tilt)}°</text>
  </svg>;
}

export function LightingMap({model,characters,fixture,shown,onSelect,onPreview,onCommit,disabled}) {
  const origin=lightMount(model,fixture),shownOrigin=lightMount(model,shown);
  const projection=planProjection([...RIGGING.bars.flatMap(bar=>[bar.a,bar.b]),fixture.aim,...characters]);
  const [mx,my]=projection.point(shownOrigin),[tx,ty]=projection.point(shown.aim);
  const close=Math.hypot(mx-tx,my-ty)<26;
  const targetX=close ? mx+(mx>220?-24:24) : tx;
  const targetY=close ? my+(my<24?14:-14) : ty;
  const drag=usePlanDrag({onPreview,onCommit,disabled});
  const aim=(x,y)=>({aim:{...fixture.aim,x:clamp(Math.round(fixture.aim.x+x),TARGET_RANGE),y:clamp(Math.round(fixture.aim.y+y),TARGET_RANGE)}});
  const mountDrag=drag('Move fixture on bars',(dx,dy)=>mountAtPoint({x:origin.x+dx/projection.scale,y:origin.y-dy/projection.scale},
    fixture.bar,11/projection.scale),(dx,dy,shift)=>({position:clamp(fixture.position+(dx||dy)*(shift?.1:.01),[0,1])}));
  const aimDrag=drag('Move beam target on map',(dx,dy)=>aim(dx/projection.scale,-dy/projection.scale),
    (dx,dy,shift)=>aim(dx*(shift?100:10),dy*(shift?100:10)));

  return <>
    <MapArea hint="Dot mounts · Crosshair aims">
      <StagePlan projection={projection} label="Lighting placement and aim map">
        <g className="map-reference">
          {setItems(model).map(entry=><SetFootprint key={entry.id} entry={entry} model={model} projection={projection}/>)}
          {RIGGING.bars.map(({id,a,b})=>{
            const [x1,y1]=projection.point(a),[x2,y2]=projection.point(b);
            return <line className="stage-map-bar" key={id} data-active={id===shown.bar} x1={x1} y1={y1} x2={x2} y2={y2}><title>Bar {id}</title></line>;
          })}
        </g>
        {RIGGING.bars.filter(bar=>bar.id===shown.bar).map(bar=>{
          const [x,y]=projection.point(bar.a);
          return <circle key={bar.id} className="bar-origin" cx={x} cy={y} r="3"><title>Start of bar {bar.id}</title></circle>;
        })}
        {characters.map(character=>{
          const [x,y]=projection.point(character),[dx,dy]=facingVector(character.direction,9);
          const name=characterName(character);
          return <g key={character.id} className="stage-map-character map-reference" transform={`translate(${x} ${y})`}
            role="img" tabIndex={0} aria-label={`${name} on lighting map`} onClick={event=>event.currentTarget.focus()}>
            <title>{name}</title><path d={`M0 0L${dx} ${dy}`}/><circle r="4.5"/><MapLabel name={name}/>
          </g>;
        })}
        {model.lighting.fixtures.filter(light=>light.id!==fixture.id).map(light=>{
          const [x,y]=projection.point(lightMount(model,light));
          return <g key={light.id} className="stage-plan-item" role="button" tabIndex="0" aria-label={`Select ${light.name} on map`}
            onClick={()=>onSelect(light.id)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect(light.id);}}}>
            <title>{light.name}</title><circle className="stage-map-hit" cx={x} cy={y} r="8"/>
            <circle className="stage-map-light" cx={x} cy={y} r="4"/>
            <MapLabel name={light.name||`L${light.id}`} x={x} y={y}/>
          </g>;
        })}
        <path className="stage-map-beam" d={`M${mx} ${my}L${tx} ${ty}${close?`L${targetX} ${targetY}`:''}`}/>
        <g {...mountDrag} className="stage-map-drag" transform={`translate(${mx} ${my})`}>
          <title>Drag along a bar or drop onto another</title><circle className="stage-map-hit" r="10"/><circle className="stage-map-mark" r="5.5"/>
        </g>
        <g {...aimDrag} className="stage-map-drag" transform={`translate(${targetX} ${targetY})`}>
          <title>Drag to aim the beam</title><circle className="stage-map-hit" r="9"/>
          <circle className="stage-map-mark stage-map-target" r="5"/>
          <path className="beam-target-cross" d="M-7 0h14M0-7v14"/>
        </g>
      </StagePlan>
    </MapArea>
    <div className="lighting-aim-fields">
      <NumberField label="Target height above stage" value={shown.aim.height} min={TARGET_RANGE[0]} max={TARGET_RANGE[1]} disabled={disabled}
        onChange={height=>onCommit({aim:{...fixture.aim,height}})}/>
      <TiltDial model={model} fixture={fixture} shown={shown} onPreview={onPreview} onCommit={onCommit} disabled={disabled}/>
    </div>
  </>;
}
