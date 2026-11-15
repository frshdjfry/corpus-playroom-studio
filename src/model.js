import {insideStage} from './venue-plan.js';
import {defaultLighting,validateLighting} from './lighting.js';
import {suspensionLayout} from './rigging-plan.js';
import {validateCharacters} from './characters.js';
export const STAGE = { width: 4160, depth: 5030 };
export const MAX_SAILS = 24;
export const MAX_PROPS = 32;
export const PROP_TYPES = {
  box: {label:'Box', dimensions:{width:600, depth:600, height:600}},
  cylinder: {label:'Cylinder', dimensions:{diameter:600, height:800}},
  sphere: {label:'Sphere', dimensions:{diameter:600}},
};
export const SET_PLACEMENT = {x:[-10000,10000], y:[-10000,10000], angle:[-360,360]};
export const PROP_SIZE = [50,5000];
export const PROP_ELEVATION = [0,7000];
export const SAIL_DIMENSIONS = {
  fabricWidth:[300,4000],fabricHeight:[300,5000],battenLength:[300,4500],
  tieLength:[0,1000],bagHeight:[50,500],clearance:[0,1000],
};
export const DEFAULT = {
  version: 1, lighting: defaultLighting(), characters: [], props: [],
  fabricWidth: 1500, fabricHeight: 1850, battenLength: 1600,
  tieLength: 150, bagHeight: 150, clearance: 50,
  riggingHeight: 3200, eyeHeight: 1200,
  sails: [
    { id: 1, x: 1000, y: 3160, angle: -45, closed: 0 },
    { id: 2, x: 3160, y: 3160, angle: -45, closed: 0 },
    { id: 3, x: 1000, y: 1000, angle: -45, closed: 0 },
    { id: 4, x: 3160, y: 1000, angle: -45, closed: 0 },
  ],
};
export const cloneDefault = () => structuredClone(DEFAULT);
export const emptyModel = () => ({...cloneDefault(), sails: []});
export const sailName = sail => sail.name || `Sail ${sail.id}`;
export const propName = prop => prop.name || `${PROP_TYPES[prop.type].label} ${prop.id}`;
export const sailKey = id => `sail:${id}`;
export const propKey = id => `prop:${id}`;
export function setItems(model) {
  return [
    ...model.sails.map(item=>({id:sailKey(item.id),label:sailName(item),item,kind:'sail'})),
    ...model.props.map(item=>({id:propKey(item.id),label:propName(item),item,kind:'prop'})),
  ];
}
export const sailDimensions = (model, sail) => sail.dimensions ??
  Object.fromEntries(Object.keys(SAIL_DIMENSIONS).map(key => [key, model[key]]));

function nextId(items) {
  const ids = new Set(items.map(item => item.id));
  let id = Math.max(0, ...ids) + 1;
  if (!Number.isSafeInteger(id)) {
    id = 1;
    while (ids.has(id)) id++;
  }
  return id;
}

function freeSetPosition(model) {
  const items=[...model.sails,...model.props];
  const placements = [[2080,2515], [1000,3160], [3160,3160], [1000,1000], [3160,1000], [2080,3950], [2080,1150]];
  for (let y = 750; y <= 4350; y += 600) {
    for (let x = 750; x <= 3550; x += 560) placements.push([x,y]);
  }
  const candidates = placements.map(([x,y]) => ({
    x,y,space:Math.min(Infinity,...items.map(item=>Math.hypot(item.x-x,item.y-y))),
  }));
  const {x,y} = candidates.find(item=>item.space>=750) ??
    candidates.reduce((best,item)=>item.space>best.space ? item : best);
  return {x,y};
}

export function newSail(model) {
  return {id:nextId(model.sails),...freeSetPosition(model),angle:-45,closed:0};
}

export function newProp(model,type) {
  return {id:nextId(model.props),type,...freeSetPosition(model),angle:0,elevation:0,color:'#9f8269',
    dimensions:{...PROP_TYPES[type].dimensions}};
}
export function elevations(m, closed = 0) {
  const lowerOpen = m.clearance + m.bagHeight + m.tieLength;
  const top = lowerOpen + m.fabricHeight;
  const drop = m.fabricHeight * (1 - closed) + Math.min(230, m.fabricHeight) * closed;
  const bottom = top - drop;
  return { top, bottom, drop, bagBottom: bottom - m.tieLength - m.bagHeight };
}
export function endpoints(m, s) {
  const a = s.angle * Math.PI / 180, d = (s.dimensions ?? m).battenLength / 2;
  return [-1, 1].map(sign => ({ x: s.x + sign*d*Math.cos(a), y: s.y + sign*d*Math.sin(a) }));
}
export function layoutIssues(m) {
  const out=[];
  for (const sail of m.sails) {
    const name = sailName(sail), dimensions = sail.dimensions ?? m;
    const issue=(target,message)=>out.push({id:sailKey(sail.id),tab:target==='set-placement'?'objects':'dimensions',target,message});
    if (elevations(dimensions).top + 90 > m.riggingHeight) issue('set-dimensions',`${name}: the upper pulleys need more clearance.`);
    if (endpoints(m,sail).some(p=>!insideStage(p))) issue('set-placement',`${name} extends beyond the stage boundary.`);
    const support = suspensionLayout(m,sail);
    if (!support.valid) issue('sail-suspension',`${name}: ${support.reason}`);
    if (dimensions.fabricWidth > dimensions.battenLength) issue('set-dimensions',`${name}: the fabric is wider than the battens.`);
  }
  return out;
}
export const warnings=model=>layoutIssues(model).map(issue=>issue.message);

function validateFields(raw, ranges) {
  return Object.fromEntries(Object.entries(ranges).map(([key,[lo,hi]]) => {
    const value = raw?.[key];
    if (!Number.isFinite(value) || value<lo || value>hi) throw Error(`Invalid ${key}.`);
    return [key,value];
  }));
}

function validateProps(raw=[]) {
  if (!Array.isArray(raw) || raw.length>MAX_PROPS) throw Error('Invalid set objects.');
  const ids=new Set();
  return raw.map(prop=>{
    if (!Number.isSafeInteger(prop?.id) || prop.id<1 || ids.has(prop.id) || !Object.hasOwn(PROP_TYPES,prop.type)) {
      throw Error('Invalid set object ID or type.');
    }
    if (!/^#[0-9a-f]{6}$/i.test(prop.color)) throw Error('Invalid set object colour.');
    ids.add(prop.id);
    const dimensionRanges=Object.fromEntries(Object.keys(PROP_TYPES[prop.type].dimensions).map(key=>[key,PROP_SIZE]));
    const item={id:prop.id,type:prop.type,...validateFields(prop,{...SET_PLACEMENT,elevation:PROP_ELEVATION}),
      color:prop.color,dimensions:validateFields(prop.dimensions,dimensionRanges)};
    if (typeof prop.name==='string' && prop.name.trim()) item.name=prop.name.trim().slice(0,60);
    return item;
  });
}

export function validate(raw) {
  if (!raw || raw.version !== 1 || !Array.isArray(raw.sails) || raw.sails.length > MAX_SAILS) throw Error('Invalid stage layout.');
  const m={version:1,...validateFields(raw,{...SAIL_DIMENSIONS,riggingHeight:[1000,7000],eyeHeight:[500,2200]})};
  const ids = new Set();
  m.sails=raw.sails.map((s,i)=>{
    const id = s?.id ?? i+1;
    if (!Number.isSafeInteger(id) || id<1 || ids.has(id)) throw Error('Invalid sail ID.');
    ids.add(id);
    const sail = {id,...validateFields(s,{...SET_PLACEMENT,closed:[0,1]})};
    if (typeof s.name === 'string' && s.name.trim()) sail.name = s.name.trim().slice(0,60);
    if (s.dimensions !== undefined) sail.dimensions = validateFields(s.dimensions, SAIL_DIMENSIONS);
    return sail;
  });
  m.lighting=validateLighting(raw.lighting);
  m.characters=validateCharacters(raw.characters);
  m.props=validateProps(raw.props);
  return m;
}
