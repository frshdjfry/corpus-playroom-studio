import {RIGGING} from './rigging-plan.js';
export const MAX_LIGHTS=8;
export const STOCK_URL='https://www.adctheatre.com/media/5833/230817-playroomtechspec.pdf';
export const FIXTURE_TYPES={
 prelude:{label:'Prelude 28/40 profile',stock:6,minBeam:28,maxBeam:40,beam:32,softness:.08,length:.34,radius:.065,kind:'profile',note:'650 W tungsten profile · hard edge · colour previews a gel.'},
 acclaim:{label:'Selecon Acclaim Fresnel',stock:10,minBeam:6,maxBeam:60,beam:36,softness:.8,length:.23,radius:.085,kind:'fresnel',note:'650 W tungsten Fresnel · soft wash · colour previews a gel.'},
 spotjr:{label:'ColorSource Spot Jr · Deep Blue',stock:4,minBeam:25,maxBeam:50,beam:32,softness:.12,length:.30,radius:.075,kind:'profile',note:'LED profile · 25–50° zoom. Venue lists these in fixed front-cover positions.'},
 par:{label:'ColorSource PAR · Deep Blue',stock:2,minBeam:15,maxBeam:60,beam:40,softness:.55,length:.18,radius:.10,kind:'par',note:'LED wash · installed lens unspecified. Spread is an editable circular approximation; venue lists fixed front cover.'},
};
export const defaultLighting=()=>({mode:'neutral',showCones:true,ambient:.035,fixtures:[]});
export function lightMount(model,fixture){
 const b=RIGGING.bars.find(b=>b.id===fixture.bar);
 return {x:b.a.x+(b.b.x-b.a.x)*fixture.position,y:b.a.y+(b.b.y-b.a.y)*fixture.position,height:model.riggingHeight-220};
}

export function mountAtPoint(point,currentBar,snapDistance){
 const candidates=RIGGING.bars.map(({id,a,b})=>{
  const dx=b.x-a.x,dy=b.y-a.y;
  const ratio=((point.x-a.x)*dx+(point.y-a.y)*dy)/(dx*dx+dy*dy);
  const position=Math.max(0,Math.min(1,ratio));
  return {bar:id,position,distance:Math.hypot(point.x-a.x-dx*position,point.y-a.y-dy*position)};
 });
 const current=candidates.find(candidate=>candidate.bar===currentBar);
 const nearest=candidates.reduce((best,candidate)=>candidate.distance<best.distance ? candidate : best,current);
 const {bar,position}=nearest.distance<=snapDistance ? nearest : current;
 return {bar,position};
}
export const planToWorld=p=>[(p.x-2080)/1000,p.height/1000,(2515-p.y)/1000];
export const worldToPlan=p=>({x:Math.round(p.x*1000+2080),y:Math.round(2515-p.z*1000),height:Math.round(p.y*1000)});
export function beamGeometry(model,fixture){
 const origin=lightMount(model,fixture),dx=fixture.aim.x-origin.x,dy=fixture.aim.y-origin.y,dz=fixture.aim.height-origin.height;
 const distance=Math.max(1,Math.hypot(dx,dy,dz));
 const pan=Math.atan2(dx,dy)*180/Math.PI,tilt=Math.atan2(-dz,Math.hypot(dx,dy))*180/Math.PI;
 return {origin,worldOrigin:planToWorld(origin),worldTarget:planToWorld(fixture.aim),distance,pan,tilt,halfAngle:fixture.beam*Math.PI/360,radius:distance*Math.tan(fixture.beam*Math.PI/360)};
}
export function aimFromAngles(model,fixture,pan,tilt){
 const pose=beamGeometry(model,fixture),origin=pose.origin,distance=Math.min(pose.distance,20000),p=pan*Math.PI/180,t=tilt*Math.PI/180;
 return {x:origin.x+distance*Math.sin(p)*Math.cos(t),y:origin.y+distance*Math.cos(p)*Math.cos(t),height:origin.height-distance*Math.sin(t)};
}
export function newFixture(model,type='acclaim',selectedSail=1){
 const id=Math.max(0,...model.lighting.fixtures.map(f=>f.id))+1;
 const sail=model.sails.find(s=>s.id===selectedSail)||model.sails[0];
 return {id,name:`L${id}`,type,bar:'31-36',position:.15+((id-1)%8)*.1,enabled:true,intensity:65,color:'#fff1d6',beam:FIXTURE_TYPES[type].beam,softness:FIXTURE_TYPES[type].softness,shadows:true,aim:{x:sail?.x ?? 2080,y:sail?.y ?? 2515,height:1200}};
}
export function validateLighting(raw){
 if(raw===undefined)return defaultLighting();
 if(!raw||!['neutral','theatre'].includes(raw.mode)||!Array.isArray(raw.fixtures)||raw.fixtures.length>MAX_LIGHTS)throw Error('Invalid lighting setup (maximum 8 fixtures).');
 if(typeof raw.ambient!=='number'||!Number.isFinite(raw.ambient)||raw.ambient<0||raw.ambient>.3)throw Error('Invalid theatre ambient fill.');
 const ids=new Set();
 const fixtures=raw.fixtures.map(f=>{
  if(!Number.isInteger(f.id)||f.id<1||ids.has(f.id)||!FIXTURE_TYPES[f.type])throw Error('Invalid fixture ID or type.');ids.add(f.id);
  if(!RIGGING.bars.some(b=>b.id===f.bar)||typeof f.color!=='string'||!/^#[0-9a-f]{6}$/i.test(f.color))throw Error('Invalid fixture bar or colour.');
  const spec=FIXTURE_TYPES[f.type],ranges={position:[0,1],intensity:[0,100],beam:[spec.minBeam,spec.maxBeam],softness:[0,1]};
  for(const [k,[lo,hi]] of Object.entries(ranges))if(typeof f[k]!=='number'||!Number.isFinite(f[k])||f[k]<lo||f[k]>hi)throw Error(`Invalid fixture ${k}.`);
  if(!f.aim||['x','y','height'].some(k=>typeof f.aim[k]!=='number'||!Number.isFinite(f.aim[k])||Math.abs(f.aim[k])>30000))throw Error('Invalid light aim.');
  if(typeof f.enabled!=='boolean'||typeof f.shadows!=='boolean')throw Error('Invalid light switch.');
  return {id:f.id,name:typeof f.name==='string'?f.name.slice(0,40):`L${f.id}`,type:f.type,bar:f.bar,position:f.position,enabled:f.enabled,intensity:f.intensity,color:f.color,beam:f.beam,softness:f.softness,shadows:f.shadows,aim:{...f.aim}};
 });
 return {mode:raw.mode,showCones:raw.showCones!==false,ambient:raw.ambient,fixtures};
}
