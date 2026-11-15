import React, {useRef} from 'react';
import {CHARACTER_FIELDS, characterName} from './characters.js';
import {endpoints} from './model.js';
import {VENUE} from './venue-plan.js';
import {clamp,facingVector,MapArea,MapLabel,planProjection,SetFootprint,svgPoint} from './stage-plan.jsx';
export {svgPoint} from './stage-plan.jsx';

const HANDLE = 26;

function angleFrom(x, y) {
  return Math.round(Math.atan2(x, y) * 180 / Math.PI);
}

export function CharacterMap({model, character, preview, onSelect, onPreview, onCommit, disabled}) {
  const svg = useRef(null), drag = useRef(null);
  const projection = planProjection([character],HANDLE);
  const [x, y] = projection.point(preview);
  const [handleX, handleY] = facingVector(preview.direction, HANDLE);
  const outline = VENUE.floorOutline.map(point => projection.point(point).join(',')).join(' ');
  const [axisX, axisY] = projection.point({x:0, y:0});
  const [doorX1, doorY1] = projection.point(VENUE.door.hinge);
  const [doorX2, doorY2] = projection.point(VENUE.door.latch);

  function start(event, kind) {
    if (disabled || event.button !== 0 || drag.current) return;
    event.preventDefault();
    const point = svgPoint(svg.current, event);
    drag.current = {id:event.pointerId, kind, point, scale:projection.scale, base:character, result:null};
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event) {
    const current = drag.current;
    if (disabled || current?.id !== event.pointerId) return;
    const point = svgPoint(svg.current, event);
    const dx = point.x - current.point.x, dy = point.y - current.point.y;
    if (current.kind === 'position') {
      const {scale} = current;
      current.result = {
        x:clamp(Math.round(current.base.x + dx / scale), CHARACTER_FIELDS.x),
        y:clamp(Math.round(current.base.y - dy / scale), CHARACTER_FIELDS.y),
      };
    } else {
      const [initialX, initialY] = facingVector(current.base.direction, HANDLE);
      if (Math.hypot(initialX + dx, initialY + dy) < 3) return;
      current.result = {direction:angleFrom(initialX + dx, initialY + dy)};
    }
    onPreview(current.result);
  }

  function finish(event, commit) {
    const current = drag.current;
    if (current?.id !== event.pointerId) return;
    drag.current = null;
    if (commit && !disabled && current.result) onCommit(current.result);
    else onPreview(null);
  }

  function nudge(event, kind) {
    if (disabled) return;
    const dx = {ArrowLeft:-1,ArrowRight:1}[event.key] ?? 0;
    const dy = {ArrowDown:-1,ArrowUp:1}[event.key] ?? 0;
    if (!dx && !dy) return;
    event.preventDefault();
    if (kind === 'position') {
      const step = event.shiftKey ? 100 : 10;
      onCommit({
        x:clamp(character.x + step * dx, CHARACTER_FIELDS.x),
        y:clamp(character.y + step * dy, CHARACTER_FIELDS.y),
      });
    } else {
      const next = character.direction + (dx || dy) * (event.shiftKey ? 15 : 1);
      onCommit({direction:((next + 540) % 360) - 180});
    }
  }

  const dragProps = kind => ({
    role:'button', tabIndex:disabled ? -1 : 0, 'aria-disabled':disabled || undefined,
    onPointerDown:event=>start(event, kind), onPointerMove:move,
    onPointerUp:event=>finish(event, true), onPointerCancel:event=>finish(event, false),
    onLostPointerCapture:event=>finish(event, false), onKeyDown:event=>nudge(event, kind),
  });

  return <MapArea hint="Dot moves · Diamond turns">
    <svg ref={svg} className="blocking-map" viewBox={projection.viewBox} role="group" aria-label="Blocking stage map">
      <polygon points={outline} className="blocking-map-stage"/>
      {VENUE.wallSegments.map(({a,b}, index) => {
        const [x1,y1] = projection.point(a), [x2,y2] = projection.point(b);
        return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} className="blocking-map-wall"/>;
      })}
      <line x1={doorX1} y1={doorY1} x2={doorX2} y2={doorY2} className="blocking-map-door"><title>Stage door</title></line>
      <text x={axisX + 9} y={axisY + 13} className="blocking-map-audience">Audience A</text>
      <text transform={`translate(${axisX - 8} ${axisY - 9}) rotate(-90)`} className="blocking-map-audience">Audience B</text>
      <path className="stage-map-axis" d={`M${axisX} ${axisY-13}V${axisY}h13`} aria-hidden="true"/>
      <text className="blocking-map-audience" x={axisX+15} y={axisY+3}>X</text>
      <text className="blocking-map-audience" x={axisX-2} y={axisY-16}>Y</text>
      <g className="map-reference">
        {model.sails.map(sail => {
          const [[x1,y1],[x2,y2]] = endpoints(model,sail).map(projection.point);
          return <line key={sail.id} x1={x1} y1={y1} x2={x2} y2={y2} className="blocking-map-sail"/>;
        })}
        {model.props.map(item=><SetFootprint key={item.id} entry={{kind:'prop',item}} model={model} projection={projection}/>)}
      </g>
      {model.characters.filter(item=>item.id!==character.id).map(item => {
        const [cx,cy] = projection.point(item), [dx,dy] = facingVector(item.direction, 9);
        return <g key={item.id} transform={`translate(${cx} ${cy})`} className="blocking-map-other" role="button"
          tabIndex="0" aria-label={`Select ${characterName(item)} on map`} onClick={()=>onSelect(item.id)}
          onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect(item.id);}}}>
          <title>{characterName(item)}</title>
          <circle r="10" className="map-hit"/><path d={`M0 0L${dx} ${dy}`}/><circle r="4"/>
          <MapLabel name={characterName(item)}/>
        </g>;
      })}
      <g transform={`translate(${x} ${y})`} className="blocking-map-selected">
        <circle r={HANDLE} className="blocking-map-guide"/>
        <path d={`M0 0L${handleX} ${handleY}`} className="blocking-map-heading"/>
        <g {...dragProps('position')} className="map-position" aria-label={`Move ${characterName(character)} on map`}>
          <title>Drag to move</title><circle r="10" className="map-hit"/><circle r="5.5" className="map-pin"/>
        </g>
        <g {...dragProps('facing')} className="map-facing" transform={`translate(${handleX} ${handleY})`} aria-label="Rotate character on map">
          <title>Drag around the marker to turn</title>
          <circle r="9" className="map-hit"/><rect x="-3.4" y="-3.4" width="6.8" height="6.8" rx="1" transform="rotate(45)" className="map-diamond"/>
        </g>
      </g>
    </svg>
  </MapArea>;
}
