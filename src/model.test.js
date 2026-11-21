import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mountAtPoint,newFixture} from './lighting.js';
import {lightingChanges,lightingTimelineCues,planLightingExport,preserveLightingGos,writeLightingAscii} from './lighting-export.js';
import {characterJoints,characterLayout,DEFAULT_CHARACTER_COLORS,movePoseJoint,neutralPose,newCharacter,POSE_PRESETS,STANDING_SPAN} from './characters.js';
import {characterChannel,sampleRehearsal,validateRehearsal as validateTimeline,compileRehearsal as compileTimeline,removeCharacterKeys,removeFixtureTargets,sailChannel,fixtureChannel,editSailTracks,setKeyframe} from './rehearsal.js';
import {SCRIPT_LINES} from './sample-script.js';
import {extendScriptClock,formatTime,parseScript,parseTime,scriptClock} from './script.js';
import {createProject,createSampleProject,exportProject,importProject,LIBRARY_KEY,loadLibrary,projectClock,replaceProjectScript,SAMPLE_PROJECT_ID,SAMPLE_PROJECT_REVISION} from './projects.js';
import {recordProjectEdit,stepProjectHistory} from './project-history.js';
import {cloneDefault,elevations,endpoints,newProp,newSail,sailDimensions,setItems,warnings,validate} from './model.js';
const clock=scriptClock(SCRIPT_LINES);
const {moments:MOMENTS,byId:MOMENT_BY_ID,duration:RUN_TIME,at:momentAt}=clock;
const validateRehearsal=(raw,model)=>validateTimeline(raw,model,clock);
const compileRehearsal=(model,rehearsal)=>compileTimeline(model,rehearsal,clock);
test('shortening the script keeps later pending keyframes reachable',()=>{
 const shortened=scriptClock([{id:'line',text:'Start.'}]);
 const pendingEnd=23.4;
 assert.equal(extendScriptClock(shortened,{},pendingEnd).snap(pendingEnd),pendingEnd);
 const saved={raise:[{time:35.2}]};
 assert.equal(extendScriptClock(shortened,saved,pendingEnd).duration,35.2);
 assert.equal(extendScriptClock(shortened,{}),shortened);
});
test('project history groups live edits and restores complete snapshots',()=>{
 const initial=createProject('Rehearsal');
 const character=newCharacter(initial.model.characters);
 const cast={...initial,model:{...initial.model,characters:[character]}};
 const first={...cast,model:{...cast.model,riggingHeight:2500}};
 const last={...cast,model:{...cast.model,riggingHeight:2600}};
 const gesture=Symbol();
 let history=recordProjectEdit(null,initial,cast);
 history=recordProjectEdit(history,cast,first,gesture);
 history=recordProjectEdit(history,first,last,gesture);
 history=stepProjectHistory(history,last,false);
 assert.equal(history.present,cast);
 history=stepProjectHistory(history,cast,false);
 assert.equal(history.present,initial);
 history=stepProjectHistory(history,initial,true);
 assert.equal(history.present,cast);
 assert.equal(stepProjectHistory(history,cast,true).present,last);

 const script=replaceProjectScript(cast,'LOLA: We can start.');
 history=recordProjectEdit(history,cast,script);
 assert.equal(stepProjectHistory(history,script,true),null);
 const external={...script,title:'Changed in another tab'};
 assert.equal(stepProjectHistory(history,external,false),null);
 const renamed={...external,title:'Revised'};
 history=recordProjectEdit(history,external,renamed);
 history=stepProjectHistory(history,renamed,false);
 assert.equal(history.present,external);
 assert.equal(stepProjectHistory(history,external,false),null);

 history=recordProjectEdit(null,cast,first,gesture);
 history=recordProjectEdit(history,first,{...cast},gesture);
 assert.equal(stepProjectHistory(history,history.present,false),null);
});
test('agreed open elevations and ground clearance',()=>{
 const m=cloneDefault();assert.deepEqual(elevations(m),{top:2200,bottom:350,drop:1850,bagBottom:50});
 assert.equal(elevations(m,1).top,2200);assert.ok(elevations(m,1).bagBottom>1500);
});
test('plan stick endpoints match source coordinates',()=>{
 const m=cloneDefault();const p=endpoints(m,m.sails[0]);
 assert.ok(Math.abs(p[0].x-434.314575)<.001);assert.ok(Math.abs(p[0].y-3725.685425)<.001);
 for(const s of m.sails) assert.ok(Math.abs(Math.hypot(...[endpoints(m,s)[0].x-endpoints(m,s)[1].x,endpoints(m,s)[0].y-endpoints(m,s)[1].y])-1600)<1e-6);
 assert.deepEqual(warnings(m),[]);
});
test('imports validate values and detect height conflicts',()=>{
 const m=cloneDefault();assert.deepEqual(validate(m),m);
 assert.throws(()=>validate({...m,fabricHeight:null}));
 assert.deepEqual(validate({...m,sails:[]}).sails,[]);
 m.fabricHeight=4000;assert.ok(warnings(m).length);
});

test('set primitives coexist with sails and round-trip through project files',()=>{
 const show=createProject('Workshop');
 const model={...show.model,sails:[newSail(show.model)]};
 const box={...newProp(model,'box'),dimensions:{width:900,depth:450,height:550},elevation:100,angle:35};
 model.props=[box];
 const cylinder=newProp(model,'cylinder');
 model.props.push(cylinder);
 model.props.push(newProp(model,'sphere'));
 assert.equal(box.id,model.sails[0].id);
 assert.notDeepEqual([box.x,box.y],[model.sails[0].x,model.sails[0].y]);
 assert.equal(new Set(setItems(model).map(item=>item.id)).size,4);
 assert.deepEqual(importProject(exportProject({...show,model})).model.props,model.props);
 const {props,...olderModel}=model;
 assert.deepEqual(validate(olderModel).props,[]);
 assert.throws(()=>validate({...model,props:[{...box,dimensions:{...box.dimensions,depth:0}}]}));
});

test('fixture placement snaps to a nearby finite bar and otherwise stays on its bar',async()=>{
 const {RIGGING}=await import('./rigging-plan.js');
 const [current,other]=RIGGING.bars;
 const midpoint={x:(other.a.x+other.b.x)/2,y:(other.a.y+other.b.y)/2};
 assert.deepEqual(mountAtPoint(midpoint,current.id,80),{bar:other.id,position:.5});
 assert.equal(mountAtPoint({x:midpoint.x+300,y:midpoint.y},current.id,80).bar,current.id);
 assert.deepEqual(mountAtPoint({x:current.a.x,y:current.a.y-200},current.id,80),{bar:current.id,position:0});
});

test('lighting plan has seven runs and only existing overhead patches',async()=>{
 const {RIGGING}=await import('./rigging-plan.js');
 assert.equal(RIGGING.bars.length,7);
 assert.equal(RIGGING.rearWallHeight,2600);
 assert.equal(RIGGING.barHeight,null);
 assert.equal(RIGGING.patches.length,40);
 assert.deepEqual(RIGGING.patches.map(p=>p.circuit),Array.from({length:42},(_,i)=>i+1).filter(i=>i!==21&&i!==22));
 const stageBars=RIGGING.bars.filter(b=>['13-18','19-24','25-30'].includes(b.id));
 for(const [i,b] of stageBars.entries())assert.ok(Math.abs(b.a.x-[1700,2502,3805][i])<1);
 const front=RIGGING.bars.find(b=>b.id==='31-36');assert.ok(Math.abs(front.a.y-199)<1);
});
test('proposed ties meet actual finite bars and preserve sail positions',async()=>{
 const {RIGGING,suspensionAnchors}=await import('./rigging-plan.js');const m=cloneDefault();
 for(const angle of [-45,0,30])for(const s of m.sails){
  const sail={...s,angle};const a=suspensionAnchors(m,sail);assert.equal(a.length,2);
  for(const tie of a){const b=RIGGING.bars.find(b=>b.id===tie.to.bar);assert.ok(tie.to.t>=0&&tie.to.t<=1);
   assert.ok(Math.abs(tie.to.x-(b.a.x+tie.to.t*(b.b.x-b.a.x)))<1e-8);
   assert.ok(Math.abs(tie.to.y-(b.a.y+tie.to.t*(b.b.y-b.a.y)))<1e-8);
   const r=angle*Math.PI/180,c=Math.cos(r),sin=Math.sin(r);
   assert.ok(Math.abs(s.x+c*tie.anchorLocalX+sin*tie.anchorLocalZ-tie.to.x)<1e-8);
   assert.ok(Math.abs(s.y+sin*tie.anchorLocalX-c*tie.anchorLocalZ-tie.to.y)<1e-8);
  }
 }
});

test('mapped door sits in the angled wall and floor follows its outline',async()=>{
 const {VENUE,insideStage}=await import('./venue-plan.js');const door=VENUE.door;
 assert.ok(Math.abs(door.centre.x-4322)<2&&Math.abs(door.centre.y-3941)<2);
 assert.ok(Math.abs(door.width-734)<2);assert.equal(door.heightIsEstimated,true);
 const wall=VENUE.wallSegments[door.wallSegment];
 for(const p of [door.hinge,door.latch]){
  const dx=wall.b.x-wall.a.x,dy=wall.b.y-wall.a.y;
  assert.ok(Math.abs((p.x-wall.a.x)*dy-(p.y-wall.a.y)*dx)/Math.hypot(dx,dy)<.01);
 }
 assert.ok(insideStage({x:4500,y:2000}));
 assert.ok(!insideStage({x:4800,y:2000}));
 assert.ok(insideStage({x:2000,y:2000}));
});

test('two suspension ropes balance the centred load and moment',async()=>{
 const {suspensionLayout}=await import('./rigging-plan.js');const m=cloneDefault();
 for(const angle of [-45,0,30,135])for(const original of m.sails){
  const sail={...original,angle},layout=suspensionLayout(m,sail);
  assert.equal(layout.valid,true);assert.equal(layout.bars.length,2);assert.equal(layout.ties.length,2);
  const total=[0,0,0],moment=[0,0,0];
  for(const t of layout.ties){
   const f=[(t.to.x-t.from.x)/t.length*t.tensionRatio,(t.to.y-t.from.y)/t.length*t.tensionRatio,t.rise/t.length*t.tensionRatio];
   f.forEach((v,i)=>total[i]+=v);
   const rx=t.from.x-sail.x,ry=t.from.y-sail.y;
   moment[0]+=ry*f[2];moment[1]-=rx*f[2];moment[2]+=rx*f[1]-ry*f[0];
   assert.ok(t.tensionRatio>0);assert.ok(Math.abs(t.localX)<=m.battenLength*.4+.001);
   assert.ok(t.angleFromHorizontal>0&&t.angleFromHorizontal<90);
  }
  assert.ok(layout.ties[0].localX<0&&layout.ties[1].localX>0);
  assert.ok(Math.abs(total[0])<1e-10&&Math.abs(total[1])<1e-10&&Math.abs(total[2]-1)<1e-10);
  assert.ok(moment.every(v=>Math.abs(v)<1e-7));
 }
});
test('unsupported geometry reports a failure instead of inventing anchors',async()=>{
 const {suspensionLayout}=await import('./rigging-plan.js');const m=cloneDefault();
 assert.equal(suspensionLayout(m,m.sails[0],[]).valid,false);
 m.riggingHeight=2200;assert.equal(suspensionLayout(m,m.sails[0]).valid,false);
 m.riggingHeight=3200;assert.equal(suspensionLayout(m,{...m.sails[0],x:9000}).valid,false);
});

test('45-degree rest layout opposes small yaw deviations with fixed anchors',async()=>{
 const {suspensionLayout}=await import('./rigging-plan.js');const m=cloneDefault();
 for(const sail of m.sails)for(const delta of [-.001,.001]){
  const layout=suspensionLayout(m,sail),angle=sail.angle*Math.PI/180+delta;
  let moment=0;
  for(const tie of layout.ties){
   const rx=tie.localX*Math.cos(angle),ry=tie.localX*Math.sin(angle);
   const dx=tie.to.x-sail.x-rx,dy=tie.to.y-sail.y-ry,length=Math.hypot(dx,dy,tie.rise);
   moment+=(rx*dy-ry*dx)*tie.tensionRatio/length;
  }
  assert.ok(moment*delta<0,'positive pretension must give a restoring yaw moment');
 }
});
test('moving a sail selects the new adjacent surrounding pair',async()=>{
 const {suspensionLayout}=await import('./rigging-plan.js');const m=cloneDefault();
 assert.deepEqual([...suspensionLayout(m,m.sails[0]).bars].sort(),['13-18','7-12']);
 assert.deepEqual([...suspensionLayout(m,{...m.sails[0],x:3000}).bars].sort(),['19-24','25-30']);
});

test('legacy scene imports gain neutral lighting without changing dimensions',async()=>{
 const m=cloneDefault();delete m.lighting;const migrated=validate(m);
 assert.equal(migrated.lighting.mode,'neutral');assert.equal(migrated.lighting.fixtures.length,0);
 assert.equal(migrated.fabricHeight,1850);assert.deepEqual(migrated.sails,m.sails);
});
test('light mounting follows bars and full beam angle is converted correctly',async()=>{
 const {lightMount,beamGeometry,aimFromAngles}=await import('./lighting.js');const m=cloneDefault(),f=newFixture(m);
 const {RIGGING}=await import('./rigging-plan.js');const bar=RIGGING.bars.find(b=>b.id===f.bar),origin=lightMount(m,f);
 assert.ok(Math.abs(origin.x-(bar.a.x+(bar.b.x-bar.a.x)*f.position))<1e-8);
 assert.equal(origin.height,m.riggingHeight-220);
 f.beam=40;const b=beamGeometry(m,f);assert.ok(Math.abs(b.halfAngle-Math.PI/9)<1e-10);
 const down=aimFromAngles(m,f,0,90);assert.ok(Math.abs(down.x-origin.x)<1e-6&&Math.abs(down.y-origin.y)<1e-6);assert.ok(down.height<origin.height);
 m.riggingHeight=4000;assert.equal(lightMount(m,f).height,3780);
});
test('lighting import round-trips and rejects invalid values',()=>{
const m=cloneDefault();m.lighting.fixtures.push(newFixture(m));m.lighting.mode='theatre';
 assert.deepEqual(validate(JSON.parse(JSON.stringify(m))),m);
 const bad=structuredClone(m);bad.lighting.fixtures[0].color='url(javascript:bad)';assert.throws(()=>validate(bad));
 const duplicate=structuredClone(m);duplicate.lighting.fixtures.push({...duplicate.lighting.fixtures[0]});assert.throws(()=>validate(duplicate));
 const range=structuredClone(m);range.lighting.fixtures[0].beam=170;assert.throws(()=>validate(range));
});

test('script lines share a continuous clock and keep the original change anchors',()=>{
 assert.equal(MOMENT_BY_ID.get('lift').start,71.2);
 assert.equal(MOMENT_BY_ID.get('passage').start,79);
 assert.equal(RUN_TIME,146.2);
 for(const [index,moment] of MOMENTS.entries()){
  assert.equal(momentAt(moment.start),moment);
  assert.ok(moment.duration>0);
  const end=MOMENTS[index+1]?.start ?? RUN_TIME;
  assert.ok(Math.abs(end-moment.start-moment.duration)<1e-8);
  assert.equal(momentAt(end-.01),moment);
 }
});

test('optional scene markers survive import without changing track timings',()=>{
 const model=cloneDefault(),rehearsal=sampleRehearsal(model);
 const {scenes,...legacy}=rehearsal;
 assert.deepEqual(scenes,[]);
 assert.deepEqual(validateRehearsal(legacy,model),rehearsal);
 const titled={...rehearsal,scenes:[{moment:'door',title:'Sam arrives'},{moment:'passage',title:'The passage'}]};
 const imported=validateRehearsal(JSON.parse(JSON.stringify(titled)),model);
 assert.deepEqual(imported,titled);
 assert.deepEqual(compileRehearsal(model,imported).set(79),compileRehearsal(model,legacy).set(79));
 assert.throws(()=>validateRehearsal({...titled,scenes:[titled.scenes[0],titled.scenes[0]]},model),/scene marker/);
});

test('timeline samples independently of seek order and overlapping movements',()=>{
 const model=cloneDefault(),rehearsal=sampleRehearsal(model);
 const lift=MOMENT_BY_ID.get('lift').start;
 let track=compileRehearsal(model,rehearsal).set;
 assert.deepEqual(track(lift+6),[1,1,0,0]);
 assert.deepEqual(track(lift+2.5),[.5,.5,0,0]);
 assert.deepEqual(track(lift),[0,0,0,0]);
 rehearsal.tracks.set[1].duration=10;
 rehearsal.tracks.set.push({moment:'passage',label:'Stop the lift',duration:2,target:[0,0,0,0]});
 track=compileRehearsal(model,rehearsal).set;
 assert.ok(Math.abs(track(lift+8.8)[0]-.39)<1e-8);
 assert.equal(model.sails[0].closed,0);
});

test('rehearsal round trips, blends lighting and drops removed fixture targets',()=>{
 const model=cloneDefault();
 model.lighting.fixtures.push(newFixture(model));
 const rehearsal=sampleRehearsal(model);
 const roundTrip=validateRehearsal(JSON.parse(JSON.stringify(rehearsal)),model);
 assert.deepEqual(roundTrip,rehearsal);
 const track=compileRehearsal(model,roundTrip).lighting;
 const passage=MOMENT_BY_ID.get('passage').start;
 const middle=track(passage+1.5);
 assert.equal(middle.mix,.5);
 assert.ok(Math.abs(middle.fixtures[1].level-53.625)<1e-8);
 assert.equal(track(RUN_TIME).fixtures[1].level,0);
 assert.equal(track(RUN_TIME).ambient,0);
 const cleaned=removeFixtureTargets(roundTrip,new Set());
 assert.deepEqual(cleaned.tracks.lighting[1].target.fixtures,{});
 assert.throws(()=>validateRehearsal({...rehearsal,tracks:{...rehearsal.tracks,set:[rehearsal.tracks.set[0],rehearsal.tracks.set[0]]}},model),/marker/);
});

test('lighting export starts with the edited opening and combines three lights into one stage cue',()=>{
 const model=cloneDefault();
 for (const type of ['prelude','acclaim','acclaim','par']) model.lighting.fixtures.push(newFixture(model,type));
 const levels = (id,points) => [fixtureChannel(id,'level'), points.map(([time,value,curve='linear'])=>({time,value,curve}))];
 const rehearsal={...sampleRehearsal(model),lightingCues:[{time:8,label:'Orphan marker'},{time:10,label:'Lola crosses'}],
  lightingPatch:{1:{channel:11,address:1},2:{channel:12,address:2},3:{channel:13,address:3},4:{channel:14,address:75}},
  keyframes:Object.fromEntries([
   levels(1,[[0,0],[10,0,'hold'],[13,100]]),
   levels(2,[[0,20],[10,20,'hold'],[13,50]]),
   levels(3,[[0,100],[10,100,'hold'],[15,0]]),
   levels(4,[[0,0],[10,0,'hold'],[13,100]]),
  ])};
 const loaded=validateRehearsal(JSON.parse(JSON.stringify(rehearsal)),model);
 assert.deepEqual(loaded,rehearsal);
 const track=compileRehearsal(model,loaded);
 assert.equal(track.lighting(0).fixtures[2].level,20);
 assert.equal(track.lighting(.03).fixtures[2].level,20);
 const cues=planLightingExport(model.lighting.fixtures,track,loaded.lightingCues);
 assert.equal(lightingTimelineCues(lightingChanges(model.lighting.fixtures,track),loaded.lightingCues,cues,new Map())[0].label,'Lola crosses');
 assert.deepEqual(cues.map(({time,up,down,issues})=>({time,up,down,issues})),[
  {time:0,up:0,down:0,issues:[]},{time:10,up:3,down:5,issues:[]},
 ]);
 assert.deepEqual(cues[1].levels,{1:100,2:50,3:0,4:100});
 const file=writeLightingAscii(cues.map((cue,index)=>({...cue,number:index+1})),loaded.lightingPatch,model.lighting.fixtures);
 assert.match(file,/^Ident 3:0\r\n/);
 assert.match(file,/Patch 1 11<1@HFF 12<2@HFF 13<3@HFF 14<401@HFF\r\n/);
 assert.match(file,/! Desk 14: L4, ColorSource PAR Deep Blue, venue DMX 75 instead of temporary 401\./);
 assert.match(file,/Cue 2\r\nText Lola crosses\r\nUp 3\r\nDown 5\r\nChan 11 @ HFF 12 @ H80 13 @ H00 14 @ HFF\r\n/);
 assert.ok(file.endsWith('Enddata\r\n'));
 assert.deepEqual(removeFixtureTargets(loaded,new Set([3])).lightingPatch,{3:{channel:13,address:3}});

 // An overlapping snap and two different up fades cannot share the same basic GO.
 const other=loaded.keyframes[fixtureChannel(2,'level')];
 other[2].time=15;
 const differentFades=planLightingExport(model.lighting.fixtures,compileRehearsal(model,loaded),loaded.lightingCues);
 assert.deepEqual(differentFades[1].sharedFadeChoices,{up:[3,5]});
 loaded.keyframes[fixtureChannel(1,'level')].push({time:14,value:80,curve:'hold'});
 const changed=planLightingExport(model.lighting.fixtures,compileRehearsal(model,loaded),loaded.lightingCues);
 assert.match(changed[1].issues.join(' '),/different fade times/);
 assert.match(changed[1].issues.join(' '),/next GO \(00:14.0\)/);
 assert.deepEqual(changed[1].sharedFadeChoices,{});
 assert.equal(changed[2].time,14);
});

test('older LED keys get timeline cues and deleting a dimmer key preserves its GO',()=>{
 const project=createProject('Older show');
 const {model,rehearsal}=project;
 const fixtures=model.lighting.fixtures;
 fixtures.push(newFixture(model,'acclaim'));
 fixtures.push(newFixture(model,'par'));
 const dimmer=fixtureChannel(1,'level'), colour=fixtureChannel(2,'color');
 rehearsal.keyframes[dimmer]=[{time:7,value:65,curve:'hold'},{time:10,value:85,curve:'linear'}];
 rehearsal.keyframes[colour]=[{time:12,value:'#ff8000',curve:'hold'}];
 function getCues(timeline){
  const compiled=compileTimeline(model,timeline,projectClock({...project,rehearsal:timeline}));
  const saved=timeline.lightingCues??[];
  const labels=new Map();
  const changes=lightingChanges(fixtures,compiled);
  const plan=planLightingExport(fixtures,compiled,saved,labels,changes);
  return {compiled,changes,plan,cues:lightingTimelineCues(changes,saved,plan,labels)};
 }
 const before=getCues(rehearsal);
 assert.deepEqual(before.cues.map(cue=>[cue.time,cue.number]),[[7,2],[12,undefined]]);
 assert.equal(before.compiled.value(dimmer,8.5),75);
 const kept=preserveLightingGos([],before.cues,before.changes,dimmer,10);
 const after=validateRehearsal({...rehearsal,keyframes:{...rehearsal.keyframes,[dimmer]:rehearsal.keyframes[dimmer].slice(0,1)},lightingCues:kept},model);
 assert.deepEqual(getCues(after).cues.map(cue=>cue.time),[7,12]);
 assert.equal(getCues(after).plan[1].levels[1],65);
 const removed=validateRehearsal({...rehearsal,lightingCues:[{time:7,label:'Lighting change',removed:true}]},model);
 assert.deepEqual(getCues(removed).cues.map(cue=>cue.time),[12]);
 assert.equal(getCues(removed).plan.length,1);
 assert.equal(getCues(removed).compiled.value(dimmer,8.5),75);
});

test('a ColorSource-only intensity change is an export cue, and colour stays in preview',()=>{
 const project=createProject('LED levels');
 const {model,rehearsal}=project;
 const fixture=newFixture(model,'spotjr');
 model.lighting.fixtures.push(fixture);
 rehearsal.keyframes[fixtureChannel(fixture.id,'level')]=[{time:3,value:30,curve:'hold'}];
 rehearsal.keyframes[fixtureChannel(fixture.id,'color')]=[{time:7,value:'#ff8000',curve:'hold'}];
 const tracks=compileTimeline(model,rehearsal,projectClock(project));
 const cues=planLightingExport([fixture],tracks,[]);
 assert.deepEqual(cues.map(cue=>[cue.time,cue.levels[fixture.id]]),[[0,65],[3,30]]);
 const file=writeLightingAscii(cues.map((cue,index)=>({...cue,number:index+1})),{[fixture.id]:{channel:2,address:57}},[fixture]);
 assert.match(file,/Patch 1 2<401@HFF/);
 assert.match(file,/Chan 2 @ H4D/);
 assert.doesNotMatch(file,/#ff8000/i);
});

test('muted fixtures retain programmed keys and stay at zero in playback and export',()=>{
 const project=createProject('Fixture mute');
 const {model,rehearsal}=project;
 const fixture=newFixture(model);
 model.lighting.fixtures.push(fixture);
 const channel=fixtureChannel(fixture.id,'level');
 rehearsal.keyframes[channel]=[{time:0,value:75,curve:'hold'},{time:5,value:25,curve:'linear'}];
 fixture.enabled=false;
 const muted=compileTimeline(model,rehearsal,projectClock(project));
 assert.equal(muted.lighting(2.5,new Map([[channel,100]])).fixtures[fixture.id].level,0);
 assert.deepEqual(muted.keys(channel),rehearsal.keyframes[channel]);
 assert.deepEqual(planLightingExport([fixture],muted,[]).map(cue=>cue.levels[fixture.id]),[0]);
 fixture.enabled=true;
 const enabled=compileTimeline(model,rehearsal,projectClock(project));
 assert.equal(enabled.lighting(2.5).fixtures[fixture.id].level,50);
 assert.deepEqual(planLightingExport([fixture],enabled,[]).map(cue=>cue.levels[fixture.id]),[75,25]);
});

test('export blocks a fade whose starting level depended on a removed GO',()=>{
 const project=createProject('Removed blackout');
 const {model,rehearsal}=project;
 const fixture=newFixture(model);
 model.lighting.fixtures.push(fixture);
 const channel=fixtureChannel(fixture.id,'level');
 rehearsal.keyframes[channel]=[
  {time:0,value:100,curve:'hold'},{time:5,value:0,curve:'hold'},
  {time:10,value:0,curve:'hold'},{time:12,value:70,curve:'linear'},
 ];
 const tracks=compileTimeline(model,rehearsal,projectClock(project));
 const skipped=planLightingExport([fixture],tracks,[{time:5,label:'Blackout',removed:true}]);
 assert.equal(tracks.lighting(10).fixtures[fixture.id].level,0);
 assert.deepEqual(skipped.map(cue=>cue.time),[0,10]);
 assert.match(skipped[1].issues.join(' '),/100% in the export and 0% in the timeline.*00:05\.0/);
 assert.deepEqual(skipped[1].sharedFadeChoices,{});
 const restored=planLightingExport([fixture],tracks,[{time:5,label:'Blackout'}]);
 assert.deepEqual(restored.map(({time,up,down,issues})=>[time,up,down,issues]),[[0,0,0,[]],[5,0,0,[]],[10,2,0,[]]]);
});

test('custom cue numbers round-trip and match the timeline and ASCII export',()=>{
 const project=createProject('Numbered cues');
 const fixture=newFixture(project.model);
 project.model.lighting.fixtures.push(fixture);
 project.rehearsal.keyframes[fixtureChannel(fixture.id,'level')]=[
  {time:0,value:0,curve:'hold'},{time:2,value:50,curve:'hold'},{time:4,value:80,curve:'hold'},
 ];
 project.rehearsal.lightingCueNumbers={opening:1,'go:4':10.25};
 const loaded=importProject(exportProject(project));
 assert.deepEqual(loaded.rehearsal.lightingCueNumbers,project.rehearsal.lightingCueNumbers);
 const tracks=compileTimeline(loaded.model,loaded.rehearsal,projectClock(loaded));
 const changes=lightingChanges([fixture],tracks);
 const cues=planLightingExport([fixture],tracks,[],new Map(),changes,loaded.rehearsal.lightingCueNumbers);
 assert.deepEqual(cues.map(cue=>cue.number),[1,2,10.25]);
 assert.deepEqual(lightingTimelineCues(changes,[],cues,new Map()).map(cue=>cue.number),[2,10.25]);
 assert.match(writeLightingAscii(cues,{[fixture.id]:{channel:1,address:1}},[fixture]),/\r\nCue 10\.25\r\n/);
 assert.deepEqual(planLightingExport([fixture],tracks,[],new Map(),changes,{opening:1,'go:4':2})
  .map(cue=>cue.number),[1,1.01,2]);
});

test('the lighting export suggests GO times at the start of legacy fades',()=>{
 const model=cloneDefault();
 model.lighting.fixtures.push(newFixture(model));
 const rehearsal=sampleRehearsal(model);
 const legacy=compileRehearsal(model,rehearsal);
 const cues=planLightingExport(model.lighting.fixtures,legacy,[]);
 assert.deepEqual(cues.map(({time,up,down,issues})=>[time,up,down,issues]),[
  [0,0,0,[]],[MOMENT_BY_ID.get('passage').start,0,3,[]],[MOMENT_BY_ID.get('end').start,0,4,[]],
 ]);
});

test('property keys interpolate independently and survive project round trips',()=>{
 const model=cloneDefault();
 model.lighting.fixtures.push(newFixture(model));
 const rehearsal=sampleRehearsal(model);
 const raise=sailChannel(1), colour=fixtureChannel(1,'color');
 rehearsal.keyframes={
  [raise]:[{time:10,value:0,curve:'hold'},{time:20,value:1,curve:'linear'},{time:30,value:0,curve:'hold'}],
  [colour]:[{time:10,value:'#000000',curve:'hold'},{time:20,value:'#ffffff',curve:'linear'}],
 };
 const loaded=validateRehearsal(JSON.parse(JSON.stringify(rehearsal)),model);
 const compiled=compileRehearsal(model,loaded);
 assert.deepEqual(loaded,rehearsal);
 assert.equal(compiled.set(15)[0],.5);
 assert.equal(compiled.set(29)[0],1);
 assert.equal(compiled.set(30)[0],0);
 assert.equal(compiled.set(80)[1],1);
 assert.equal(compiled.set(15,new Map([[raise,.8]]))[0],.8);
 assert.equal(compiled.lighting(15).fixtures[1].color,'#808080');
 assert.deepEqual(removeFixtureTargets(loaded,new Set()).keyframes,{[raise]:rehearsal.keyframes[raise]});
});

test('legacy projected keys retain a moving sail before an overlapping cut',()=>{
 const model=cloneDefault(),rehearsal=sampleRehearsal(model);
 const channel=sailChannel(1);
 const lift=MOMENT_BY_ID.get('lift').start;
 rehearsal.tracks.set[1].duration=10;
 rehearsal.tracks.set.push({moment:'passage',label:'Cut',duration:0,target:[0,0,0,0]});
 const legacy=compileRehearsal(model,rehearsal);
 const projected=legacy.keys(channel);
 assert.ok(projected.some(key=>key.before!==undefined));
 const edited=compileRehearsal(model,{...rehearsal,keyframes:{[channel]:projected}});
 for(const time of [0,lift,lift+5,78.9,79,80]){
  assert.ok(Math.abs(edited.set(time)[0]-legacy.set(time)[0])<1e-8);
 }
});

test('project library carries the existing LOLA design and can open an independent new show',()=>{
 const model=cloneDefault();
 model.sails[0].x=1230;
 const legacy={...model,rehearsal:sampleRehearsal(model)};
 legacy.rehearsal.scenes=[{moment:'door',title:'Entrance'}];
 const storage=new Map([['lola-stage-study-v1',JSON.stringify(legacy)]]);
 const load=()=>loadLibrary({getItem:key=>storage.get(key)??null});
 const library=load(),lola=library.projects[0],newShow=createProject(' A new show ');
 assert.equal(lola.title,'LOLA');
 assert.equal(lola.model.sails[0].x,1230);
 assert.deepEqual(lola.rehearsal.scenes,legacy.rehearsal.scenes);
 assert.equal(newShow.title,'A new show');
 assert.deepEqual(newShow.model.sails,[]);
 assert.deepEqual(newShow.script.lines,[]);
 assert.equal(projectClock(newShow).duration,60);
 storage.set(LIBRARY_KEY,JSON.stringify({...library,projects:[lola,newShow],activeId:newShow.id}));
 assert.equal(load().activeId,newShow.id);
 assert.equal(load().projects[0].model.sails[0].x,1230);
 const imported=importProject(exportProject(newShow));
 assert.notEqual(imported.id,newShow.id);
 assert.deepEqual(exportProject(imported),exportProject(newShow));
});

test('first visits open an independent nine-fixture presentation sample',()=>{
 const browser={getItem:()=>null};
 const {activeId,projects:[sample]}=loadLibrary(browser);
 assert.equal(sample.id,activeId);
 assert.equal(sample.title,'Sample Project');
 assert.deepEqual(sample.rehearsal.scenes.map(scene=>scene.title),[
  'Island — Arrival','Island — The first sleep',
 ]);
 assert.equal(sample.script.lines.length,173);
 assert.equal(projectClock(sample).duration,604.3);
 assert.deepEqual([sample.model.sails.length,sample.model.props.length,sample.model.lighting.fixtures.length,sample.model.characters.length],[4,1,9,4]);
 assert.deepEqual(sample.model.lighting.fixtures.map(f=>f.type),['spotjr','par','spotjr','spotjr','par','prelude','prelude','prelude','acclaim']);
 sample.rehearsal.keyframes[sailChannel(2)].length=0;
 assert.equal(loadLibrary(browser).projects[0].rehearsal.keyframes[sailChannel(2)].length,4);
});

test('returning visitors get the latest sample while older edits and other projects survive',()=>{
 const older=createSampleProject();
 delete older.sampleRevision;
 older.model.lighting.fixtures[0].color='#123456';
 older.model.sails[0].x=3200;
 const own=createProject('LOLA');
 let stored=JSON.stringify({version:1,projects:[older,own],activeId:SAMPLE_PROJECT_ID});
 const storage={getItem:key=>key===LIBRARY_KEY?stored:null};
 const updated=loadLibrary(storage);
 const current=updated.projects.find(p=>p.id===SAMPLE_PROJECT_ID);
 assert.deepEqual(current,createSampleProject());
 assert.equal(current.sampleRevision,SAMPLE_PROJECT_REVISION);
 assert.equal(updated.activeId,SAMPLE_PROJECT_ID);
 assert.deepEqual(updated.projects.find(p=>p.id===own.id),own);
 const copy=updated.projects.find(p=>p.id!==SAMPLE_PROJECT_ID&&p.id!==own.id);
 assert.ok(copy.id);
 assert.equal(copy.title,'Sample Project (saved copy)');
 assert.deepEqual(exportProject({...copy,title:older.title}),exportProject(older));
 assert.equal(copy.sampleRevision,undefined);
 stored=JSON.stringify(updated);
 assert.deepEqual(loadLibrary(storage),updated);
 assert.equal(loadLibrary(storage).projects.length,3);
 // The same upgrade leaves the user's own active show selected.
 stored=JSON.stringify({version:1,projects:[older,own],activeId:own.id});
 assert.equal(loadLibrary(storage).activeId,own.id);
});

test('sample revision handling avoids duplicate copies and preserves current edits and imported shows',()=>{
 const current=createSampleProject();
 const unversioned=structuredClone(current);
 delete unversioned.sampleRevision;
 const read=projects=>loadLibrary({getItem:key=>key===LIBRARY_KEY?JSON.stringify({version:1,projects,activeId:projects[0].id}):null});
 const upgraded=read([unversioned]);
 assert.equal(upgraded.projects.length,1);
 assert.deepEqual(upgraded.projects[0],current);
 const edited=structuredClone(current);
 edited.model.sails[0].x=3300;
 assert.deepEqual(read([edited]).projects,[edited]);
 // A future revision is never replaced by an older app tab.
 const newer={...edited,sampleRevision:SAMPLE_PROJECT_REVISION+1};
 assert.deepEqual(read([newer]).projects,[newer]);
 const imported=importProject(exportProject(edited));
 assert.equal(imported.sampleRevision,undefined);
 assert.notEqual(imported.id,SAMPLE_PROJECT_ID);
 assert.deepEqual(read([imported]).projects,[imported]);
 assert.equal(exportProject(current).sampleRevision,undefined);
});

test('sample runs the five lighting looks with clean three-second transitions',()=>{
 const sample=createSampleProject();
 const fixtures=sample.model.lighting.fixtures;
 const compiled=compileTimeline(sample.model,sample.rehearsal,projectClock(sample));
 const lit=time=>Object.fromEntries(Object.entries(compiled.lighting(time).fixtures)
  .filter(([,fixture])=>fixture.level>0).map(([id,fixture])=>[id,fixture.level]));
 assert.deepEqual(lit(0),{13:65});
 assert.deepEqual(lit(23),{8:50,9:50,13:32.5});
 assert.deepEqual(lit(25),{8:100,9:100});
 assert.deepEqual(lit(458),{5:100,7:48,10:17.1});
 assert.deepEqual(lit(477),{7:48,10:17.1,11:100});
 assert.deepEqual(lit(491),{12:65});
 assert.deepEqual(lit(604.3),{12:65});
 assert.deepEqual(compiled.set(0),[0,0,0,0]);
 assert.deepEqual(compiled.set(250),[0,1,1,1]);
 assert.deepEqual(compiled.set(487.9),[0,0,0,0]);
 const changes=lightingChanges(fixtures,compiled);
 const labels=new Map([sample.rehearsal.tracks.lighting[0]].map(cue=>[0,cue.label]));
 const plan=planLightingExport(fixtures,compiled,sample.rehearsal.lightingCues,labels);
 const cues=lightingTimelineCues(changes,sample.rehearsal.lightingCues,plan,labels);
 assert.deepEqual(plan.map(c=>[c.time,c.label]),[
  [0,'Back sails Fresnel'],
  [21.5,'Blue and yellow PARs'],
  [451.9,'Two spots + orange centre'],
  [468.2,'Two spots + blue centre'],
  [487.9,'West upstage Prelude - sails down'],
 ]);
 assert.deepEqual(cues.map(c=>c.time),plan.slice(1).map(c=>c.time));
 assert.ok(plan.slice(1).every(c=>c.issues.length===0&&c.up===3&&c.down===3));
});

test('sample gathers the cast around the centre Preludes, then stands them with the blue look',()=>{
 const sample=createSampleProject();
 const compiled=compileTimeline(sample.model,sample.rehearsal,projectClock(sample));
 const centre=sample.model.lighting.fixtures.find(f=>f.name==='Centre Prelude · Orange gel').aim;
 const kneeling=POSE_PRESETS.find(p=>p.id==='kneeling').pose;
 const standing=POSE_PRESETS.find(p=>p.id==='standing').pose;
 const before=compiled.blocking(451.9);
 assert.notDeepEqual(compiled.blocking(453.4).map(c=>[c.x,c.y]),before.map(c=>[c.x,c.y]));
 for(const actor of compiled.blocking(458)){
  const dx=centre.x-actor.x,dy=centre.y-actor.y;
  const angle=actor.direction*Math.PI/180;
  assert.ok(Math.abs(Math.hypot(dx,dy)-700)<1e-7);
  assert.ok(Math.abs(Math.sin(angle)-dx/700)<1e-7);
  assert.ok(Math.abs(-Math.cos(angle)-dy/700)<1e-7);
  assert.equal(actor.elevation,0);
  assert.deepEqual(actor.pose,kneeling);
 }
 assert.equal(compiled.value(sailChannel(3),448.9),0);
 assert.ok(Math.abs(compiled.value(sailChannel(3),450.4)-.5)<1e-9);
 assert.equal(compiled.value(sailChannel(3),451.9),1);
 assert.deepEqual(compiled.blocking(468.2).map(c=>c.pose),Array(4).fill(kneeling));
 const risen=compiled.blocking(471.2);
 assert.deepEqual(risen.map(c=>c.pose),Array(4).fill(standing));
 assert.deepEqual(risen.map(c=>[c.x,c.y,c.direction,c.elevation]),compiled.blocking(458).map(c=>[c.x,c.y,c.direction,c.elevation]));
 assert.notDeepEqual(compiled.blocking(469.7)[0].pose,kneeling);
 assert.notDeepEqual(compiled.blocking(469.7)[0].pose,standing);
 assert.deepEqual([7,10,11].map(id=>compiled.lighting(471.2).fixtures[id].color),Array(3).fill('#719cff'));
});

test('pasted lines keep matching scene anchors and existing keyframe times',()=>{
 const model=cloneDefault();
 const lola=loadLibrary({getItem:key=>key==='lola-stage-study-v1'?JSON.stringify({...model,rehearsal:sampleRehearsal(model)}):null}).projects[0];
 const {raw,lines}=lola.script;
 lola.rehearsal.scenes=[{moment:'door',title:'Entrance'}];
 lola.rehearsal.keyframes[sailChannel(1)]=[{time:95,value:1,curve:'linear'}];
 const edited=replaceProjectScript(lola,'  NEW ACTOR: Hello.\r\n\r\n'+raw.split('\n')[2]);
 assert.equal(edited.script.lines.length,2);
 assert.equal(edited.script.lines[0].text,'  NEW ACTOR: Hello.');
 assert.equal(edited.script.lines[0].speaker,undefined);
 assert.equal(edited.script.lines[1].id,lines[2].id);
 assert.equal(edited.rehearsal.scenes[0].moment,'door');
 assert.equal(edited.rehearsal.keyframes[sailChannel(1)][0].time,95);
 assert.ok(projectClock(edited).duration>=95);
 assert.equal(compileTimeline(edited.model,edited.rehearsal,projectClock(edited)).set(79)[1],1);
 assert.equal(parseScript('A door closes.\n\n A lamp goes out.').lines.length,2);
 const appended=replaceProjectScript(lola,`${raw}\nNora — Shut the door.`);
 assert.deepEqual(appended.script.lines.slice(0,-1),lines);
 assert.equal(projectClock(appended).byId.get('wait').duration,projectClock(lola).byId.get('wait').duration);
 assert.deepEqual(exportProject(importProject(exportProject(edited))),exportProject(edited));
 const rewritten='The door swings open.\nA new cue.';
 const preview=replaceProjectScript(lola,rewritten);
 assert.deepEqual(preview.rehearsal.scenes,[]);
 const target=preview.script.lines[0].id;
 const reattached=replaceProjectScript(lola,rewritten,{door:target});
 assert.deepEqual(reattached.rehearsal.scenes,[{moment:target,title:'Entrance'}]);
 assert.throws(()=>replaceProjectScript(lola,rewritten,{door:'missing-line'}),/different line/);
});

test('key edits keep legacy transition data and accept timeline time labels',()=>{
 const legacy=[{time:15,value:0,curve:'hold',before:.5}];
 const updated=setKeyframe(legacy,parseTime('00:15.0'),.8);
 assert.deepEqual(updated,[{time:15,value:.8,curve:'hold',before:.5}]);
 assert.deepEqual(setKeyframe(updated,8,0).map(key=>key.time),[8,15]);
 assert.equal(formatTime(parseTime('1:05.2')),'01:05.2');
 assert.equal(parseTime('65.2'),65.2);
 assert.ok(Number.isNaN(parseTime('1:99')));
});

test('per-object dimensions and sail deletion keep surviving animation on stable IDs',()=>{
 const model=cloneDefault(),rehearsal=sampleRehearsal(model);
 model.sails[1].dimensions={...sailDimensions(model,model.sails[1]),battenLength:1200};
 model.sails[1].name='Rear sail';
 rehearsal.keyframes[sailChannel(1)]=[{time:10,value:1,curve:'linear'}];
 const sails=model.sails.slice(1);
 const edited=editSailTracks(rehearsal,model.sails,sails);
 const loaded=validate({...model,sails});
 assert.equal(loaded.sails[0].id,2);
 assert.equal(loaded.sails[0].name,'Rear sail');
 assert.ok(Math.abs(Math.hypot(...endpoints(loaded,loaded.sails[0]).map((point,index,points)=>
  index===0 ? points[1].x-point.x : point.y-points[0].y))-1200)<1e-8);
 assert.equal(edited.keyframes[sailChannel(1)],undefined);
 assert.deepEqual(edited.tracks.set[1].target,[1,0,0]);
 assert.equal(newSail(loaded).id,5);
 assert.equal(newFixture(createProject('Empty').model).aim.x,2080);
});

test('characters persist independently and older project files start without characters',()=>{
 const project=createProject('Blocking study');
 const legacy=exportProject(project);
 delete legacy.model.characters;
 assert.deepEqual(importProject(legacy).model.characters,[]);
 const character={...newCharacter([]),name:'Lola',height:1680,direction:45,elevation:160,bodyColor:'#8a2c36',jointColor:'#b4c0dc'};
 character.pose=movePoseJoint(character.pose,'left-wrist','front',.21,.29);
 project.model.characters=[character,newCharacter([character])];
 const restored=importProject(JSON.parse(JSON.stringify(exportProject(project))));
 assert.deepEqual(restored.model.characters,project.model.characters);
 assert.notDeepEqual(restored.model.characters[0].pose,restored.model.characters[1].pose);
 const {bodyColor,jointColor,...withoutColors}=character;
 const [legacyCharacter]=validate({...project.model,characters:[withoutColors]}).characters;
 assert.equal(legacyCharacter.bodyColor,DEFAULT_CHARACTER_COLORS.bodyColor);
 assert.equal(legacyCharacter.jointColor,DEFAULT_CHARACTER_COLORS.jointColor);
 assert.throws(()=>validate({...project.model,characters:[{...character,height:0}]}),/character height/);
});

test('mannequin joint drags preserve bone lengths and the standing-height reference',()=>{
 const pose=neutralPose();
 const before=characterJoints(pose);
 const lifted=movePoseJoint(pose,'left-wrist','front',.22,.31);
 const reached=movePoseJoint(lifted,'left-wrist','side',.16,.27);
 const after=characterJoints(reached);
 const distance=(joints,a,b)=>Math.hypot(...joints[a].map((value,i)=>value-joints[b][i]));
 for(const [a,b] of [['left-shoulder','left-elbow'],['left-elbow','left-wrist'],['right-hip','right-knee'],['right-knee','right-ankle']]){
  assert.ok(Math.abs(distance(before,a,b)-distance(after,a,b))<1e-8);
 }
 assert.notDeepEqual(before['left-wrist'],after['left-wrist']);
 assert.deepEqual(before['right-wrist'],after['right-wrist']);
 const rest=characterLayout(pose);
 assert.ok(rest.floor<0 && rest.top>0);
 assert.equal((rest.top-rest.floor)/STANDING_SPAN*1750,1750);
 const extended=movePoseJoint(pose,'left-ankle','side',100,-100);
 assert.ok(characterLayout(extended).parts.every(part=>part.center.every(Number.isFinite)));
});

test('blocking keyframes interpolate and round-trip independently by character',()=>{
 const project=createProject('Blocking animation');
 const actor=newCharacter([]), other=newCharacter([actor]);
 const channel=property=>characterChannel(actor.id,property);
 const raised=movePoseJoint(actor.pose,'left-wrist','front',.22,.32);
 const keys=(first,last,curve='linear')=>[{time:0,value:first,curve:'linear'},{time:10,value:last,curve}];
 project.model.characters=[actor,other];
 project.rehearsal.keyframes={
  [channel('position')]:keys({x:1000,y:1800},{x:3000,y:2200}),
  [channel('direction')]:keys(170,-170),
  [channel('elevation')]:keys(0,400,'hold'),
  [channel('pose')]:keys(actor.pose,raised),
  [characterChannel(other.id,'elevation')]:keys(0,120),
 };
 const loaded=importProject(JSON.parse(JSON.stringify(exportProject(project))));
 assert.deepEqual(loaded.rehearsal.keyframes,project.rehearsal.keyframes);
 const playback=compileTimeline(loaded.model,loaded.rehearsal,projectClock(loaded));
 const [middle,second]=playback.blocking(5);
 assert.equal(middle.x,2000);
 assert.equal(middle.y,2000);
 assert.equal(Math.abs(middle.direction),180);
 assert.equal(middle.elevation,0);
 assert.equal(second.elevation,60);
 assert.equal(second.x,other.x);
 assert.notDeepEqual(middle.pose,actor.pose);
 assert.notDeepEqual(middle.pose,raised);
 assert.ok(Object.values(middle.pose).every(bone=>Math.abs(Math.hypot(...bone)-1)<1e-8));
 assert.equal(playback.blocking(10)[0].elevation,400);
 assert.deepEqual(playback.blocking(10)[0].pose,raised);
 const draft=playback.blocking(5,new Map([[channel('position'),{x:412,y:123}],[channel('elevation'),420]]));
 assert.equal(draft[0].x,412);
 assert.equal(draft[0].elevation,420);
 assert.deepEqual(Object.keys(removeCharacterKeys(loaded.rehearsal,actor.id).keyframes),[characterChannel(other.id,'elevation')]);
});
