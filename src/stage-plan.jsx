import React, {useRef, useState} from 'react';
import {endpoints} from './model.js';
import {VENUE} from './venue-plan.js';
import './stage-plan.css';

const WIDTH=248, MAX_HEIGHT=310;
export const clamp=(value,[min,max])=>Math.max(min,Math.min(max,value));

export function facingVector(direction,radius) {
  const angle=direction*Math.PI/180;
  return [radius*Math.sin(angle),radius*Math.cos(angle)];
}

export function svgPoint(svg,event) {
  const point=svg.createSVGPoint();
  point.x=event.clientX;
  point.y=event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

export function planProjection(points=[],gutter=14) {
  const left=Math.min(-250,...points.map(point=>point.x-300));
  const right=Math.max(4975,...points.map(point=>point.x+300));
  const bottom=Math.min(-300,...points.map(point=>point.y-300));
  const top=Math.max(5450,...points.map(point=>point.y+300));
  const scale=Math.min((WIDTH-2*gutter)/(right-left),(MAX_HEIGHT-2*gutter)/(top-bottom));
  const height=Math.ceil((top-bottom)*scale)+2*gutter;
  const cx=(left+right)/2,cy=(top+bottom)/2;
  return {viewBox:`0 0 ${WIDTH} ${height}`,scale,point:({x,y})=>[WIDTH/2+(x-cx)*scale,height/2-(y-cy)*scale]};
}

export function StagePlan({projection,label,children}) {
  const {point}=projection;
  const [dx1,dy1]=point(VENUE.door.hinge),[dx2,dy2]=point(VENUE.door.latch);
  const [ax,ay]=point({x:0,y:0});
  return <svg className="stage-plan" viewBox={projection.viewBox} role="group" aria-label={label}>
    <polygon className="plan-floor" points={VENUE.floorOutline.map(p=>point(p).join(',')).join(' ')}/>
    {VENUE.wallSegments.map(({a,b},i)=>{
      const [x1,y1]=point(a),[x2,y2]=point(b);
      return <line key={i} className="plan-wall" x1={x1} y1={y1} x2={x2} y2={y2}/>;
    })}
    <line className="stage-plan-door" x1={dx1} y1={dy1} x2={dx2} y2={dy2}><title>Stage door</title></line>
    <text className="stage-plan-label" x={ax+6} y={ay+12}>Audience A</text>
    <text className="stage-plan-label" transform={`translate(${ax-7} ${ay-5}) rotate(-90)`}>Audience B</text>
    <path className="stage-map-axis" d={`M${ax} ${ay-13}V${ay}h13`} aria-hidden="true"/>
    <text className="stage-plan-label" x={ax+15} y={ay+3}>X</text>
    <text className="stage-plan-label" x={ax-2} y={ay-16}>Y</text>
    {children}
  </svg>;
}

export function MapArea({children,hint}) {
  const [expanded,setExpanded]=useState(false);
  return <div className="map-area" data-expanded={expanded}>
    <div className="map-area-tools"><span>{hint}</span>
      <button type="button" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}>{expanded?'Compact map':'Expand map'}</button>
    </div>
    {children}
  </div>;
}

export function MapLabel({name,x=0,y=0}) {
  const label=name.length>20?`${name.slice(0,19)}…`:name;
  return <text className="map-item-label" x={x} y={y-10} textAnchor="middle" aria-hidden="true">{label}</text>;
}

export function SetFootprint({entry,model,projection,selected=false}) {
  const {item,kind}=entry;
  if (kind==='sail') {
    const [[x1,y1],[x2,y2]]=endpoints(model,item).map(projection.point);
    return <line className="set-footprint sail-footprint" data-selected={selected} x1={x1} y1={y1} x2={x2} y2={y2}/>;
  }
  const {width,depth,diameter}=item.dimensions;
  const [x,y]=projection.point(item);
  const w=(width??diameter)*projection.scale,h=(depth??diameter)*projection.scale;
  return item.type==='box'
    ? <rect className="set-footprint" data-selected={selected} x={-w/2} y={-h/2} width={w} height={h}
        transform={`translate(${x} ${y}) rotate(${-item.angle})`}/>
    : <circle className="set-footprint" data-selected={selected} cx={x} cy={y} r={w/2}/>;
}

export function usePlanDrag({onPreview,onCommit,disabled=false}) {
  const drag=useRef(null);
  function finish(event,commit) {
    const current=drag.current;
    if (current?.id!==event.pointerId) return;
    drag.current=null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (commit && !disabled && current.value) onCommit(current.value);
    onPreview(null);
  }
  return (label,project,nudge)=>({
    role:'button', tabIndex:disabled?-1:0, 'aria-label':label, 'aria-disabled':disabled||undefined,
    onPointerDown:event=>{
      if (disabled || event.button!==0 || drag.current) return;
      event.preventDefault();
      const svg=event.currentTarget.ownerSVGElement;
      drag.current={id:event.pointerId,svg,start:svgPoint(svg,event),project,value:null};
      event.currentTarget.focus();
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove:event=>{
      const current=drag.current;
      if (disabled || current?.id!==event.pointerId) return;
      const point=svgPoint(current.svg,event);
      const value=current.project(point.x-current.start.x,point.y-current.start.y,event.shiftKey);
      if (value) {current.value=value;onPreview(value);}
    },
    onPointerUp:event=>finish(event,true), onPointerCancel:event=>finish(event,false),
    onLostPointerCapture:event=>finish(event,false),
    onKeyDown:event=>{
      if (disabled) return;
      if (event.key==='Escape' && drag.current) {
        finish({currentTarget:event.currentTarget,pointerId:drag.current.id},false);
        return;
      }
      const dx={ArrowLeft:-1,ArrowRight:1}[event.key]??0;
      const dy={ArrowDown:-1,ArrowUp:1}[event.key]??0;
      if (!dx&&!dy) return;
      event.preventDefault();
      const value=nudge(dx,dy,event.shiftKey);
      if (value) onCommit(value);
    },
  });
}
