import React,{useState,useRef,useMemo,useEffect,useEffectEvent} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useThree,useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {MAX_PROPS,MAX_SAILS,elevations,layoutIssues,newProp,newSail,propKey,sailDimensions,sailKey,setItems} from './model.js';
import {makeSail,makeRoom,disposeGroup} from './scene.js';
import {RIGGING,suspensionLayout} from './rigging-plan.js';
import {ControlIcon,NumberField} from './controls.jsx';
import {EntityActions,EntityPicker,GlobalPanel,Inspector,InspectorSection} from './inspector.jsx';
import {LightingScene} from './lighting-scene.jsx';
import {LightAdd,LightingControls} from './lighting-controls.jsx';
import {LightingExportDialog} from './lighting-export-controls.jsx';
import {lightingChanges,lightingTimelineCues,planLightingExport,preserveLightingGos} from './lighting-export.js';
import {MAX_LIGHTS,newFixture,planToWorld,worldToPlan} from './lighting.js';
import {AudioClips,DEPARTMENTS,ScriptPanel,Timeline,useTransport} from './rehearsal-controls.jsx';
import {animationChannels,characterChannel,compileRehearsal,editSailTracks,fixtureChannel,removeCharacterKeys,removeFixtureTargets,sailChannel,setKeyframe,THEATRE_CHANNEL} from './rehearsal.js';
import {copyProjectScript,createProject,createSampleProject,exportProject,importProject,LIBRARY_KEY,loadLibrary,replaceProjectScript,SAMPLE_PROJECT_ID} from './projects.js';
import {recordProjectEdit,sameProject,stepProjectHistory} from './project-history.js';
import {ProjectControls} from './project-controls.jsx';
import {extendScriptClock,scriptClock} from './script.js';
import {SAMPLE_AUDIO} from './sample-script.js';
import {characterName, MAX_CHARACTERS, newCharacter} from './characters.js';
import {CharacterObject} from './character-scene.jsx';
import {CharacterControls} from './character-controls.jsx';
import {HOVER_COLOUR,hoverOutline,ignoreStageRay,stageEvents,StageSelection} from './stage-selection.jsx';
import {SetAdd,SetControls} from './set-controls.jsx';
import './style.css';
import './workspace-ui.css';
const CAMERA_VIEWS=[['overview','Orbit'],['audienceA','Audience A'],['audienceB','Audience B'],['corner','Corner'],['top','Top']];
function download(name,data,type){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function Rig({view,eyeHeight,api}){
 const {camera,gl}=useThree();
 const controls=useMemo(()=>new OrbitControls(camera,gl.domElement),[camera,gl]);
 useEffect(()=>{controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=.35;controls.maxDistance=25;controls.maxPolarAngle=Math.PI*.495;controls.target.set(0,1.1,0);return ()=>controls.dispose();},[controls]);
 useEffect(()=>{
  const eye=eyeHeight/1000;
  const presets={overview:{p:[-6.5,4.5,7.8],t:[0,1.1,0]},audienceA:{p:[0,eye+.32,4.715],t:[0,1.35,0]},audienceB:{p:[-4.28,eye+.32,0],t:[0,1.35,0]},corner:{p:[-4.6,eye,5.5],t:[0,1.35,0]},top:{p:[-.85,14,.5],t:[-.85,0,.499]}};
  const v=view.custom||presets[view.name]||presets.overview;camera.position.set(...v.p);controls.target.set(...v.t);camera.fov=view.name==='top'?38:['audienceA','audienceB','corner'].includes(view.name)?65:45;camera.updateProjectionMatrix();controls.update();
 },[view,eyeHeight,controls,camera]);
 useEffect(()=>{api.current={camera:()=>({p:camera.position.toArray(),t:controls.target.toArray()})};return()=>{api.current=null;};},[api,camera,controls]);
 useFrame(()=>controls.update());
 return null;
}
function SailObject({model,sail,selected,hovered,display}){
 const object=useMemo(()=>makeSail(model,sail,selected,display.labels,display.dimensions),[
  model.fabricWidth,model.fabricHeight,model.battenLength,model.tieLength,model.bagHeight,model.clearance,
  model.riggingHeight,sail.id,sail.name,sail.dimensions,sail.x,sail.y,sail.angle,sail.closed,selected,display.labels,display.dimensions,
 ]);
 useEffect(()=>()=>disposeGroup(object),[object]);
 const dimensions=sailDimensions(model,sail);
 const {top,bottom}=elevations(dimensions,sail.closed);
 const width=dimensions.fabricWidth/1000, height=(top-bottom)/1000;
 return <group userData={{stageEntity:{department:'set',id:sailKey(sail.id)}}}>
  <primitive object={object}/>
  {hovered&&<group position={object.position} quaternion={object.quaternion}>
   {[top/1000+.016,bottom/1000-.016].map(y=><mesh key={y} position={[0,y,0]} raycast={ignoreStageRay}>
    <boxGeometry args={[width,.012,.012]}/><meshBasicMaterial color={HOVER_COLOUR} toneMapped={false}/>
   </mesh>)}
   {[-width/2,width/2].map(x=><mesh key={x} position={[x,(top+bottom)/2000,0]} raycast={ignoreStageRay}>
    <boxGeometry args={[.012,height+.032,.012]}/><meshBasicMaterial color={HOVER_COLOUR} toneMapped={false}/>
   </mesh>)}
  </group>}
 </group>;
}
function PropObject({prop,hovered}){
 const {width,depth,height,diameter}=prop.dimensions;
 const geometry=useMemo(()=>{
  if(prop.type==='box')return new THREE.BoxGeometry(width/1000,height/1000,depth/1000);
  if(prop.type==='sphere')return new THREE.SphereGeometry(diameter/2000,24,16);
  return new THREE.CylinderGeometry(diameter/2000,diameter/2000,height/1000,32);
 },[prop.type,width,depth,height,diameter]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 const position=planToWorld({x:prop.x,y:prop.y,height:prop.elevation+(height??diameter)/2});
 return <mesh geometry={geometry} position={position} rotation={[0,prop.angle*Math.PI/180,0]}
  userData={{stageEntity:{department:'set',id:propKey(prop.id)}}} castShadow receiveShadow>
  <meshStandardMaterial color={prop.color} roughness={.75}/>
  {hovered&&<mesh geometry={geometry} material={hoverOutline} raycast={ignoreStageRay}/>}
 </mesh>;
}
function Objects({model,selected,display,characterId,characterDraft,department,hovered}){
 const room=useMemo(()=>makeRoom(model,display),[model.riggingHeight,display]);
 useEffect(()=>()=>disposeGroup(room),[room]);
 return <>
  <primitive object={room}/>
  {model.sails.map(sail=><SailObject key={sailKey(sail.id)} model={model} sail={sail} selected={sailKey(sail.id)===selected} display={display}
   hovered={department==='set'&&sailKey(sail.id)===hovered}/>)}
  {model.props.map(prop=><PropObject key={propKey(prop.id)} prop={prop} hovered={department==='set'&&propKey(prop.id)===hovered}/>)}
  {model.characters.map(character=><CharacterObject key={character.id}
   character={characterDraft?.id===character.id ? {...character,...characterDraft.patch} : character}
   selected={character.id===characterId} hovered={department==='blocking'&&character.id===hovered}/>)}
 </>;
}
function Workspace({project,projects,editProject,onHistory,undoTarget,redoTarget,onSelect,onCreate,onImport,saveError}){
 const canUndo=Boolean(undoTarget);
 const {model,rehearsal,script,views:savedViews}=project;
 const projectMenu=useRef(null);
 const stageViewport=useRef(null);
 const fullscreenButton=useRef(null);
 const [stageMode,setStageMode]=useState(null);

 useEffect(()=>{
  function syncFullscreen(){
   const fullscreen=document.fullscreenElement===stageViewport.current;
   setStageMode(mode=>fullscreen?'fullscreen':mode==='fullscreen'?null:mode);
  }
  document.addEventListener('fullscreenchange',syncFullscreen);
  return ()=>document.removeEventListener('fullscreenchange',syncFullscreen);
 },[]);

 async function toggleStageFullscreen(){
  const stage=stageViewport.current;
  if(document.fullscreenElement===stage){
   await document.exitFullscreen().catch(()=>{});
   return;
  }
  if(stageMode==='expanded'){
   setStageMode(null);
   return;
  }
  try{
   if(document.fullscreenEnabled&&stage.requestFullscreen){
    await stage.requestFullscreen();
    return;
   }
  }catch{
   // Embedded browsers can reject native fullscreen.
  }
  if(stage.isConnected)setStageMode('expanded');
 }
 useEffect(()=>{
  function dismissProjectMenu(event){
   const menu=projectMenu.current;
   if(menu?.open&&!menu.contains(event.target))menu.open=false;
  }
  document.addEventListener('pointerdown',dismissProjectMenu);
  return ()=>document.removeEventListener('pointerdown',dismissProjectMenu);
 },[]);
 const editGroup=useRef(null);
 const setProject=update=>editProject(update,editGroup.current?.token);
 const setModel=update=>setProject(current=>({...current,model:update(current.model)}));
 const setRehearsal=update=>setProject(current=>({...current,rehearsal:update(current.rehearsal)}));
 const setSavedViews=update=>setProject(current=>({...current,views:update(current.views)}));
 const [selection,setSelected]=useState(null),[view,setView]=useState({name:'overview'}),[display,setDisplay]=useState({walls:true,seats:true,grid:false,labels:true,dimensions:false,riggingLabels:false});
 const lastPreset=useRef('overview');
 const items=useMemo(()=>setItems(model),[model]);
 const setItem=items.find(item=>item.id===selection) ?? items[0];
 const sail=setItem?.kind==='sail' ? setItem.item : null;
 const riggingSail=sail ?? model.sails[0];
 const [placementDraft,setPlacementDraft]=useState(null);
 const [lightDraft,setLightDraft]=useState(null);
 const selectSetItem=id=>{setPlacementDraft(null);setSelected(id);};
 const previewSetItem=patch=>setPlacementDraft(patch ? {id:setItem.id,patch} : null);
 const previewLight=(id,patch)=>{
  if(patch)setAimLight(null);
  setLightDraft(patch ? {id,patch} : null);
 };
 const clearPlacement=()=>{setPlacementDraft(null);setLightDraft(null);};
 const api=useRef();
 const [selectedLight,setSelectedLight]=useState(null),[aimLight,setAimLight]=useState(null);
 const [selectedCharacter,setSelectedCharacter]=useState(null),[characterDraft,setCharacterDraft]=useState(null);
 const character=model.characters.find(item=>item.id===selectedCharacter) ?? model.characters[0];
 const [blockingProperty,setBlockingProperty]=useState('position');
 const [departmentId,setDepartmentId]=useState('set'),[departmentTabs,setDepartmentTabs]=useState({});
 const [globalTab,setGlobalTab]=useState('script');
 const [drafts,setDrafts]=useState([]);
 const [resolution,setResolution]=useState(null);
 const [lightingExportOpen,setLightingExportOpen]=useState(false);
 const [pickedKey,setPickedKey]=useState(null);
 const [keyNotice,setKeyNotice]=useState('');
 const [editNotice,setEditNotice]=useState('');
 const removalSnapshot=useRef(null);
 const notifyRemoval=(message,snapshot)=>{removalSnapshot.current=snapshot;setEditNotice(message);};
 useEffect(()=>{
  if(!editNotice)return;
  const timer=setTimeout(()=>setEditNotice(''),7000);
  return ()=>clearTimeout(timer);
 },[editNotice]);
 const [neutralView,setNeutralView]=useState(false);
 const [lightProperty,setLightProperty]=useState('level');
 const roomSelected=selectedLight==='room'||!model.lighting.fixtures.length;
 const department=DEPARTMENTS.find(item=>item.id===departmentId);
 const settingsTab=departmentTabs[departmentId] ?? department.tabs[0].id;
 const inspectorTab=departmentId==='lighting'&&roomSelected ? 'room' : settingsTab;
 const showTab=(tab,dept=departmentId)=>{
  setDepartmentId(dept);
  setDepartmentTabs(tabs=>({...tabs,[dept]:tab}));
  if(tab!=='fixtures')setAimLight(null);
  setCharacterDraft(null);
  clearPlacement();
 };
 const showStage=()=>stageViewport.current?.scrollIntoView({block:'start'});
 const switchDepartment=(id,reveal=false)=>{
  setDepartmentId(id);setAimLight(null);setCharacterDraft(null);clearPlacement();
  if(reveal&&innerWidth<=860)requestAnimationFrame(()=>document.getElementById('department-inspector')?.scrollIntoView({block:'start'}));
 };
 const baseClock=useMemo(()=>scriptClock(script.lines),[script.lines]);
 const pendingEnd=drafts.reduce((end,entry)=>Math.max(end,entry.time),0);
 const retainedGoEnd=rehearsal.lightingCues?.findLast(cue=>cue.kept&&!cue.removed)?.time??0;
 const clock=useMemo(()=>extendScriptClock(baseClock,rehearsal.keyframes,Math.max(pendingEnd,retainedGoEnd)),[baseClock,rehearsal.keyframes,pendingEnd,retainedGoEnd]);
 const playback=useTransport(clock);
 const guardPending=(label,action,entries=drafts)=>entries.length ? setResolution({label,action,entries}) : action();
 const clearGesture=()=>{setCharacterDraft(null);setAimLight(null);clearPlacement();};
 const transport={
  ...playback,
  seek:time=>{clearGesture();setPickedKey(null);setKeyNotice('');playback.seek(time);},
  togglePlay:()=>{
   const toggle=()=>{clearGesture();setPickedKey(null);setKeyNotice('');playback.togglePlay();};
   if(playback.playing)toggle();
   else guardPending('Play',toggle);
  },
  baseLook:()=>{clearGesture();setPickedKey(null);setKeyNotice('');playback.baseLook();},
 };
 useEffect(()=>{
  if(!drafts.length)return;
  function preventLoss(event){event.preventDefault();event.returnValue='';}
  window.addEventListener('beforeunload',preventLoss);
  return ()=>window.removeEventListener('beforeunload',preventLoss);
 },[drafts.length]);
 function changeHistory(redo){
  const target=redo ? redoTarget : undoTarget;
  if(!target)return;
  if(drafts.length){
   const targetChannels=animationChannels(target.model);
   if(drafts.some(item=>!targetChannels.has(item.id))){
    setEditNotice('Save or discard the affected keyframe drafts before changing this edit.');
    return;
   }
  }
  editGroup.current=null;
  const restored=onHistory(redo);
  if(!restored)return;
  clearGesture();
  setEditNotice(redo?'Edit redone.':'Edit undone.');
  const restoredItem=setItems(restored.model).find(item=>!items.some(previous=>previous.id===item.id));
  const restoredLight=restored.model.lighting.fixtures.find(item=>!model.lighting.fixtures.some(previous=>previous.id===item.id));
  const restoredCharacter=restored.model.characters.find(item=>!model.characters.some(previous=>previous.id===item.id));
  if(restoredItem)selectSetItem(restoredItem.id);
  if(restoredLight)selectLight(restoredLight.id);
  if(restoredCharacter)selectCharacter(restoredCharacter.id);
  if(playback.playing)playback.togglePlay();
 }
 const undoOrRedo=useEffectEvent(changeHistory);
 useEffect(()=>{
  function handleUndo(event){
   if(event.defaultPrevented || event.isComposing || !event.metaKey || event.ctrlKey || event.altKey ||
    event.key.toLowerCase()!=='z')return;
   const target=event.target;
   if(target instanceof Element && (target.isContentEditable ||
    target.closest('textarea, input:not([type]), input[type="text"], input[type="number"], dialog[open]')))return;
   event.preventDefault();
   undoOrRedo(event.shiftKey);
  }
  window.addEventListener('keydown',handleUndo);
  return ()=>window.removeEventListener('keydown',handleUndo);
 },[]);
 const moment=clock.at(transport.time);
 const sceneTitles=useMemo(()=>new Map(rehearsal.scenes.map(scene=>[scene.moment,scene.title])),[rehearsal.scenes]);
 const changeScene=(momentId,title)=>setRehearsal(current=>{
  const scenes=current.scenes.filter(scene=>scene.moment!==momentId);
  if(title!==null)scenes.push({moment:momentId,title});
  return {...current,scenes};
 });
 const tracks=useMemo(()=>compileRehearsal(model,{tracks:rehearsal.tracks,keyframes:rehearsal.keyframes},clock),
  [model,rehearsal.tracks,rehearsal.keyframes,clock]);
 const draft=useMemo(()=>transport.playing ? null : new Map(drafts.filter(item=>item.time===clock.snap(transport.time))
  .map(item=>[item.id,item.value])),[drafts,clock,transport.time,transport.playing]);
 const sailHeights=transport.preview ? tracks.set(transport.time,draft) : null;
 const lightLook=transport.preview ? tracks.lighting(transport.time,draft) : null;
 const blockingLook=transport.preview ? tracks.blocking(transport.time,draft) : null;
 const stageLightMix=lightLook?.mix ?? Number(model.lighting.mode==='theatre');
 const stageModel=useMemo(()=>sailHeights || blockingLook || placementDraft ? {
  ...model,
  sails:sailHeights || placementDraft?.id.startsWith('sail:') ? model.sails.map((sail,index)=>({
   ...sail,closed:sailHeights?.[index]??sail.closed,...(placementDraft?.id===sailKey(sail.id)?placementDraft.patch:null),
  })) : model.sails,
  props:placementDraft?.id.startsWith('prop:') ? model.props.map(prop=>propKey(prop.id)===placementDraft.id?{...prop,...placementDraft.patch}:prop) : model.props,
  characters:blockingLook ?? model.characters,
 } : model,[model,sailHeights,blockingLook,placementDraft]);
 const previewSet=setItem && (placementDraft?.id===setItem.id ? {...setItem.item,...placementDraft.patch} : setItem.item);
 const lightingModel=lightDraft ? {...model,lighting:{...model.lighting,fixtures:model.lighting.fixtures.map(light=>
  light.id===lightDraft.id ? {...light,...lightDraft.patch} : light)}} : model;
 const stageCharacter=character && stageModel.characters.find(item=>item.id===character.id);
 const previewCharacter=stageCharacter && characterDraft?.id===stageCharacter.id
  ? {...stageCharacter,...characterDraft.patch} : stageCharacter;
 const audioClips=useMemo(()=>project.example==='lola' ? SAMPLE_AUDIO.filter(item=>clock.byId.has(item.moment)) : [],
  [project.example,clock]);
 const markers=departmentId==='audio' ? audioClips : [];
 const openClip=clip=>{
  transport.seek(clock.byId.get(clip.moment).start);
  showTab('clips');
 };
 const activeLight=roomSelected ? undefined : model.lighting.fixtures.find(f=>f.id===selectedLight)??model.lighting.fixtures[0];
 const selectedSailChannel=sail && sailChannel(sail.id);
 const roomProperty=lightProperty.startsWith('lighting:');
 const selectedLightChannel=roomSelected ? (roomProperty ? lightProperty : THEATRE_CHANNEL)
  : fixtureChannel(activeLight.id,roomProperty ? 'level' : lightProperty);
 const selectedBlockingChannel=character && characterChannel(character.id,blockingProperty);
 const selectedChannel=({set:selectedSailChannel,lighting:selectedLightChannel,blocking:selectedBlockingChannel})[departmentId];
 const selectedKey=pickedKey?.id===selectedChannel ? tracks.keys(selectedChannel).find(key=>key.time===pickedKey.time) : undefined;
 function chooseChannel(id){
  setPickedKey(null);setKeyNotice('');
  const [kind,entity,property]=id.split(':');
  if(kind==='sail')selectSetItem(sailKey(Number(entity)));
  if(kind==='prop')selectSetItem(propKey(Number(entity)));
  if(kind==='lighting'){switchDepartment('lighting');selectLight('room');setLightProperty(id);}
  if(kind==='light'){selectLight(Number(entity));showTab('output','lighting');setLightProperty(property);}
  if(kind==='character'){selectCharacter(Number(entity));setBlockingProperty(property);}
 }
 const writeKeys=(id,edit)=>setRehearsal(current=>{
  const existing=current.keyframes[id] ?? tracks.keys(id);
  const keys=edit(existing).sort((a,b)=>a.time-b.time);
  return {...current,keyframes:{...current.keyframes,[id]:keys}};
 });
 function discardDraft(id,time){
  setDrafts(current=>current.filter(item=>item.id!==id || item.time!==time));
 }
 function saveDrafts(entries){
  if(!entries.length)return true;
  if(entries.some(item=>!tracks.channels.has(item.id))){
   setEditNotice('A draft’s entity is unavailable. Restore the entity or discard that draft.');
   return false;
  }
  setRehearsal(current=>{
   const keyframes={...current.keyframes};
   for(const {id,time,value} of entries){
    keyframes[id]=setKeyframe(keyframes[id]??tracks.keys(id),time,value);
   }
   return {...current,keyframes};
  });
  setDrafts(current=>current.filter(item=>!entries.includes(item)));
  return true;
 }
 function resolveDrafts(save){
  const {entries,action}=resolution;
  setResolution(null);
  if(save&&!saveDrafts(entries))return;
  if(!save)setDrafts(current=>current.filter(item=>!entries.includes(item)));
  try {action();} catch(error){setEditNotice(error.message);}
 }
 function selectKey(id,time){
  transport.seek(time);
  setPickedKey({id,time});
 }
 const lightingAtOpening=transport.preview && transport.time===0;
 function animate(id,base,onBaseChange) {
  const keys=tracks.keys(id);
  const time=keys.find(key=>Math.abs(key.time-transport.time)<1e-7)?.time ?? clock.snap(transport.time);
  const atKey=keys.some(key=>key.time===time);
  const opening=lightingAtOpening && tracks.channels.get(id).group==='lighting';
  const value=transport.preview ? tracks.value(id,transport.time,draft) : base;
  const focus=()=>{
   const {group}=tracks.channels.get(id);
   if(group==='lighting')setLightProperty(id.startsWith('lighting:') ? id : id.split(':').at(-1));
   if(group==='blocking')setBlockingProperty(id.split(':').at(-1));
  };
  return {
   value,atKey,focus,opening,focused:id===selectedChannel,pending:transport.preview&&draft?.has(id),disabled:transport.playing,
   discard:()=>discardDraft(id,time),
   change:next=>{
    if(transport.playing)return;
    focus();
    if(!transport.preview){onBaseChange?.(next);return;}
    if(opening||atKey){writeKeys(id,keys=>setKeyframe(keys,time,next));discardDraft(id,time);return;}
    setDrafts(current=>[...current.filter(item=>item.id!==id || item.time!==time),{id,time,value:next}]);
   },
   save:()=>{
    if(transport.playing)return;
    focus();
    const pending=drafts.find(item=>item.id===id&&item.time===time);
    writeKeys(id,keys=>setKeyframe(keys,time,pending ? pending.value : value));
    discardDraft(id,time);
    selectKey(id,time);
   },
  };
 }
 const animationFor=(id)=>({
  id,label:tracks.channels.get(id).label,keys:tracks.keys(id),
  selected:id===selectedChannel ? selectedKey : undefined,
  select:time=>{if(id!==selectedChannel)chooseChannel(id);selectKey(id,time);}, notice:keyNotice,
  move:(from,to)=>{
   if(from===to)return;
   const occupied=tracks.keys(id).some(key=>key.time===to);
   const pending=drafts.some(item=>item.id===id&&item.time===to);
   if(occupied||pending){
    const error=pending?'Save or discard the unsaved keyframe at that time first.':'A keyframe already exists at that time.';
    setKeyNotice(error);return error;
   }
   writeKeys(id,keys=>keys.map(key=>key.time===from?{...key,time:to}:key));
   if(id!==selectedChannel)chooseChannel(id);
   selectKey(id,to);
  },
  curve:curve=>writeKeys(id,keys=>keys.map(key=>key.time===selectedKey.time?{...key,curve}:key)),
  remove:()=>{
   const {time}=selectedKey;
   if(tracks.channels.get(id).group==='lighting'){
    setRehearsal(current=>({...current,
     keyframes:{...current.keyframes,[id]:tracks.keys(id).filter(key=>key.time!==time)},
     lightingCues:preserveLightingGos(current.lightingCues??[],lightingGos,changes,id,time),
    }));
   }else writeKeys(id,keys=>keys.filter(key=>key.time!==time));
   setPickedKey(null);setEditNotice('Keyframe removed.');
  },
 });
 const animation=selectedChannel && animationFor(selectedChannel);
 const timelineRows={
  set:()=>items.map(({id,item,kind,label})=>kind==='sail' ? animationFor(sailChannel(item.id)) : {id,label,static:true}),
  lighting:()=>model.lighting.fixtures.map(fixture=>animationFor(fixtureChannel(fixture.id,'level'))),
  blocking:()=>model.characters.map(item=>({
   ...animationFor(characterChannel(item.id,blockingProperty)),name:characterName(item),
  })),
 }[departmentId]?.();
 const {changes,lightingPlan,lightingGos,omittedDimmerGos}=useMemo(()=>{
  const fixtures=model.lighting.fixtures;
  const saved=rehearsal.lightingCues??[];
  const labels=new Map(rehearsal.tracks.lighting.map(cue=>[baseClock.byId.get(cue.moment).start,cue.label]));
  const changes=lightingChanges(fixtures,tracks);
  const lightingPlan=planLightingExport(fixtures,tracks,saved,labels,changes,rehearsal.lightingCueNumbers);
  const lightingGos=lightingTimelineCues(changes,saved,lightingPlan,labels);
  const dimmerStarts=new Set(changes.filter(change=>change.isDimmer).map(change=>change.start));
  const omittedDimmerGos=saved.filter(cue=>cue.removed&&dimmerStarts.has(cue.time)).map(cue=>cue.time);
  return {changes,lightingPlan,lightingGos,omittedDimmerGos};
 },[model.lighting.fixtures,tracks,rehearsal.lightingCues,rehearsal.lightingCueNumbers,rehearsal.tracks.lighting,baseClock]);
 const pendingDimmers=drafts.filter(item=>item.time===clock.snap(transport.time)&&/^light:\d+:level$/.test(item.id));
 function openOpeningLook(){
  if(activeLight)showTab('output','lighting');
  else switchDepartment('lighting');
  setNeutralView(false);
  transport.seek(0);
 }
 function renameLightingGo(cue,label){
  const name=label.trim().slice(0,60);
  if(name===cue.label)return;
  setRehearsal(current=>{
   const markers=current.lightingCues??[];
   const marker=markers.find(item=>item.time===cue.time);
   const lightingCues=[...markers.filter(item=>item.time!==cue.time),{...marker,time:cue.time,label:name}];
   return {...current,lightingCues:lightingCues.sort((a,b)=>a.time-b.time)};
  });
 }
 function removeLightingGo(cue){
  setRehearsal(current=>{
   const markers=current.lightingCues??[];
   const marker=markers.find(item=>item.time===cue.time);
   const removed={...marker,time:cue.time,label:cue.label,removed:true};
   return {...current,lightingCues:[...markers.filter(item=>item.time!==cue.time),removed].sort((a,b)=>a.time-b.time)};
  });
  setEditNotice('GO removed. Lighting keyframes kept.');
 }
 function restoreLightingGo(time){
  setRehearsal(current=>{
   const lightingCues=(current.lightingCues??[]).map(marker=>{
    if(marker.time!==time)return marker;
    const restored={...marker};
    delete restored.removed;
    return restored;
   });
   return {...current,lightingCues};
  });
 }
 function openLightingExport(){
  const pending=drafts.filter(item=>tracks.channels.get(item.id)?.group==='lighting');
  guardPending('Export lighting',()=>setLightingExportOpen(true),pending);
 }
 const selectLight=id=>{
  setSelectedLight(id);
  setLightDraft(null);
  if(id==='room'&&!roomProperty)setLightProperty(THEATRE_CHANNEL);
  if(id!=='room'&&roomProperty)setLightProperty('level');
  setAimLight(null);
 };
 const updateLighting=(update,removedId)=>{
  setLightDraft(null);
  const next=setProject(current=>{
   const lighting=update(current.model.lighting);
   const ids=new Set(lighting.fixtures.map(fixture=>fixture.id));
   const removed=current.model.lighting.fixtures.some(fixture=>!ids.has(fixture.id));
   return {
    ...current,model:{...current.model,lighting},
    rehearsal:removed ? removeFixtureTargets(current.rehearsal,ids) : current.rehearsal,
   };
  });
  if(removedId!==undefined){
   setDrafts(current=>current.filter(item=>!item.id.startsWith(fixtureChannel(removedId,''))));
   notifyRemoval('Fixture removed.',next);
  }
 };
 const addLight=(type,copy)=>{
  const next=setProject(current=>{
   const {model}=current,{lighting}=model;
   if(lighting.fixtures.length>=MAX_LIGHTS)return current;
   const fresh=newFixture(model,type,riggingSail?.id);
   const fixture=copy ? {...copy,id:fresh.id,name:`L${fresh.id}`,position:Math.min(1,copy.position+.06)} : fresh;
   return {...current,model:{...model,lighting:{...lighting,fixtures:[...lighting.fixtures,fixture]}}};
  });
  const light=next?.model.lighting.fixtures.at(-1);
  if(light)selectLight(light.id);
  if(!copy){
   showTab('fixtures','lighting');
   if(!stageLightMix)setEditNotice('Fixture added. Choose Theatre in Room to see its light.');
  }
 };
 const removeLight=()=>{
  const id=activeLight.id;
  const remove=()=>{
   updateLighting(current=>({...current,fixtures:current.fixtures.filter(light=>light.id!==id)}),id);
   selectLight(null);
  };
  guardPending('Remove fixture',remove,drafts.filter(item=>item.id.startsWith(fixtureChannel(id,''))));
 };
 const finishAim=()=>{
  setAimLight(null);
  requestAnimationFrame(()=>{
   if(stageMode)fullscreenButton.current?.focus();
   else document.getElementById('aim-in-viewport')?.focus({preventScroll:innerWidth>860});
  });
 };
 const aimAtPoint=point=>{
  if(aimLight===null)return;
  const aim=worldToPlan(point);
  setModel(m=>({...m,lighting:{...m.lighting,fixtures:m.lighting.fixtures.map(f=>f.id===aimLight?{...f,aim}:f)}}));
  finishAim();
 };
 const beginAim=()=>{
  if(!activeLight)return;
  if(aimLight!==null){finishAim();return;}
  setAimLight(activeLight.id);
  if(innerWidth<=860)showStage();
 };
 useEffect(()=>{if(aimLight!==null&&!model.lighting.fixtures.some(f=>f.id===aimLight))setAimLight(null);},[model.lighting.fixtures,aimLight]);
 const handleStageEscape=useEffectEvent(()=>{
  if(stageMode==='expanded'){
   setStageMode(null);
   fullscreenButton.current?.focus({preventScroll:true});
  }else if(!stageMode&&aimLight!==null)finishAim();
 });
 useEffect(()=>{
  const cancel=event=>{if(event.key==='Escape'&&!event.defaultPrevented)handleStageEscape();};
  window.addEventListener('keydown',cancel);
  return ()=>window.removeEventListener('keydown',cancel);
 },[]);
 const stageSail=sail && stageModel.sails.find(item=>item.id===sail.id);
 const alerts=useMemo(()=>layoutIssues(model),[model]);
 const support=useMemo(()=>sail && suspensionLayout(model,sail),[model,sail]);
 const update=(key,value)=>setModel(m=>({...m,[key]:value}));
 const updateSetItem=patch=>{
  const field=sail?'sails':'props';
  setModel(current=>({...current,[field]:current[field].map(item=>item.id===setItem.item.id?{...item,...patch}:item)}));
  setPlacementDraft(null);
 };
 const addSetItem=(type,copy)=>{
  const isSail=type==='sail',field=isSail?'sails':'props';
  const next=setProject(current=>{
   const previous=current.model[field];
   if(previous.length>=(isSail?MAX_SAILS:MAX_PROPS))return current;
   const fresh=isSail?newSail(current.model):newProp(current.model,type);
   const item=copy?{...copy,...{id:fresh.id,x:fresh.x,y:fresh.y},name:`${setItem.label} copy`.slice(0,60)}:fresh;
   const objects=[...previous,item];
   return {...current,model:{...current.model,[field]:objects},
    rehearsal:isSail?editSailTracks(current.rehearsal,previous,objects):current.rehearsal};
  });
  const added=next?.model[field].at(-1);
  if(added)selectSetItem((isSail?sailKey:propKey)(added.id));
 };
 const removeSetItem=()=>{
  const field=sail?'sails':'props';
  const next=setProject(current=>{
   const previous=current.model[field];
   const objects=previous.filter(item=>item.id!==setItem.item.id);
   return {...current,model:{...current.model,[field]:objects},
    rehearsal:sail?editSailTracks(current.rehearsal,previous,objects):current.rehearsal};
  });
  if(sail)setDrafts(current=>current.filter(item=>item.id!==sailChannel(sail.id)));
  notifyRemoval(`${sail?'Sail':'Object'} removed.`,next);
  selectSetItem(null);
 };
 const requestRemoveSetItem=()=>{
  if(sail)guardPending('Remove sail',removeSetItem,drafts.filter(item=>item.id===sailChannel(sail.id)));
  else removeSetItem();
 };
 const selectCharacter=id=>{
  setSelectedCharacter(id);
  setCharacterDraft(null);
 };
 const addCharacter=copy=>{
  const next=setProject(current=>{
   if(current.model.characters.length>=MAX_CHARACTERS)return current;
   const fresh=newCharacter(current.model.characters);
   const item=copy?{...copy,id:fresh.id,x:fresh.x,y:fresh.y,name:`${characterName(copy)} copy`.slice(0,60)}:fresh;
   return {...current,model:{...current.model,characters:[...current.model.characters,item]}};
  });
  selectCharacter(next?.model.characters.at(-1)?.id);
 };
 const updateCharacter=patch=>setModel(current=>({
  ...current,characters:current.characters.map(item=>item.id===character.id ? {...item,...patch} : item),
 }));
 const removeCharacter=()=>{
  const next=setProject(current=>({
   ...current,model:{...current.model,characters:current.model.characters.filter(item=>item.id!==character.id)},
   rehearsal:removeCharacterKeys(current.rehearsal,character.id),
  }));
  setDrafts(current=>current.filter(item=>!item.id.startsWith(characterChannel(character.id,''))));
  notifyRemoval('Character removed.',next);
  selectCharacter(null);
 };
 const requestRemoveCharacter=()=>{
  guardPending('Remove character',removeCharacter,drafts.filter(item=>item.id.startsWith(characterChannel(character.id,''))));
 };
 const blockingAnimations=character && {
  position:animate(characterChannel(character.id,'position'),{x:character.x,y:character.y},updateCharacter),
  direction:animate(characterChannel(character.id,'direction'),character.direction,direction=>updateCharacter({direction})),
  elevation:animate(characterChannel(character.id,'elevation'),character.elevation,elevation=>updateCharacter({elevation})),
  pose:animate(characterChannel(character.id,'pose'),character.pose,pose=>updateCharacter({pose})),
 };
 const motionProperty=patch=>Object.hasOwn(patch,'x')||Object.hasOwn(patch,'y') ? 'position' : Object.keys(patch)[0];
 const previewCharacterEdit=patch=>{
  if(patch)blockingAnimations[motionProperty(patch)].focus();
  setCharacterDraft(patch ? {id:character.id,patch} : null);
 };
 const commitCharacterEdit=patch=>{
  const property=motionProperty(patch);
  const value=property==='position' ? {x:stageCharacter.x,y:stageCharacter.y,...patch} : patch[property];
  blockingAnimations[property].change(value);
  setCharacterDraft(null);
 };
 const previewScript=raw=>{
  const next=replaceProjectScript(project,raw);
  const occupied=new Set(next.rehearsal.scenes.map(marker=>marker.moment));
  return {affected:rehearsal.scenes.filter(marker=>!occupied.has(marker.moment)),
   lines:next.script.lines.filter(line=>!occupied.has(line.id))};
 };
 const applyScript=(raw,reattach)=>{
  const next=setProject(current=>replaceProjectScript(current,raw,reattach));
  if(next===project || !next)return;
  setEditNotice('Script updated.');
 };
 const preset=name=>{lastPreset.current=name;setView({name,nonce:Date.now()});};
 const toggle=key=>setDisplay(d=>({...d,[key]:!d[key]}));
 const saveProjectFile=()=>{
  const filename=project.title.replace(/[^\p{L}\p{N} _-]/gu,'').trim() || 'corpus-playroom-project';
  download(`${filename}.json`,JSON.stringify(exportProject(project),null,2),'application/json');
 };
 const exportLightingFile=(contents,patch,numbers)=>{
  setRehearsal(current=>({...current,lightingPatch:patch,lightingCueNumbers:{...current.lightingCueNumbers,...numbers}}));
  const filename=project.title.replace(/[^\p{L}\p{N} _-]/gu,'').trim() || 'corpus-playroom';
  download(`${filename}-lighting.asc`,contents,'text/plain;charset=us-ascii');
  setLightingExportOpen(false);
 };
 const lightingControls={model,characters:stageModel.characters,stageSails:stageModel.sails,onChange:updateLighting,selected:activeLight?.id,onSelect:selectLight,
  onAimClick:beginAim,aiming:aimLight!==null,animate,draft:lightDraft,
  onPreview:previewLight,disabled:transport.playing,timelinePreview:transport.preview,opening:lightingAtOpening};
 const selectStageEntity={set:selectSetItem,lighting:selectLight,blocking:selectCharacter}[departmentId];
 const raise=sail && animate(selectedSailChannel,sail.closed,value=>updateSetItem({closed:value}));
 const setControls={model,items,entry:setItem,preview:previewSet,closed:stageSail?.closed,raise,
  onSelect:selectSetItem,onEdit:updateSetItem,onPreview:previewSetItem,
  disabled:transport.playing,support};
 const entityPanel=`inspector-panel-${departmentId}-${inspectorTab}`;
 const lightTabs=useMemo(()=>[{id:'room',label:'Room'},...model.lighting.fixtures.map(light=>({id:light.id,label:light.name.trim()||`L${light.id}`,off:!light.enabled}))],[model.lighting.fixtures]);
 const lightCount=model.lighting.fixtures.length;
 const characterTabs=useMemo(()=>model.characters.map(item=>({id:item.id,label:characterName(item)})),[model.characters]);
 const entities={
  set:<EntityPicker prefix="set-entity" panel={entityPanel} tabs={items} active={setItem?.id} label="Set objects" onChange={selectSetItem}>
   <SetAdd model={model} onAdd={type=>addSetItem(type)}/>
   {setItem&&<EntityActions label={setItem.label} onRemove={requestRemoveSetItem} onDuplicate={()=>addSetItem(sail?'sail':setItem.item.type,setItem.item)}
    disabled={sail?model.sails.length>=MAX_SAILS:model.props.length>=MAX_PROPS}/>}
  </EntityPicker>,
  lighting:<EntityPicker prefix="lighting-entity" panel={id=>`inspector-panel-lighting-${id==='room'?'room':settingsTab}`}
   tabs={lightTabs} active={roomSelected?'room':activeLight.id} label="Room and fixtures" onChange={selectLight}>
   <LightAdd count={lightCount} onAdd={addLight}/>
   {activeLight&&<EntityActions label={activeLight.name||`L${activeLight.id}`} onRemove={removeLight}
    onDuplicate={()=>addLight(activeLight.type,activeLight)} disabled={lightCount>=MAX_LIGHTS}/>}
  </EntityPicker>,
  blocking:<EntityPicker prefix="blocking-entity" panel={entityPanel} tabs={characterTabs} active={character?.id} label="Characters" onChange={selectCharacter}>
   <button type="button" className="primary" onClick={()=>addCharacter()} disabled={characterTabs.length>=MAX_CHARACTERS}>Add character</button>
   {character&&<EntityActions label={characterName(character)} onRemove={requestRemoveCharacter}
    onDuplicate={()=>addCharacter(character)} disabled={characterTabs.length>=MAX_CHARACTERS}/>}
  </EntityPicker>,
 }[departmentId];
 function groupEdits({target}){
  editGroup.current=target instanceof HTMLInputElement && ['range','color','text'].includes(target.type)
   ? {input:target,token:Symbol()} : null;
 }
 function closeHeaderMenu(event){
  const menu=event.currentTarget;
  if(event.key!=='Escape'||event.defaultPrevented||!menu.open)return;
  menu.open=false;
  menu.querySelector('summary').focus();
 }
 const fullscreenLabel=stageMode?'Exit fullscreen':'Fullscreen stage';
 return <div className="app" data-stage-expanded={stageMode==='expanded' || undefined} onPointerDownCapture={groupEdits} onFocusCapture={groupEdits}
  onBlurCapture={event=>{if(editGroup.current?.input===event.target)editGroup.current=null;}}>
  <header className="header">
   <div className="studio-brand"><span className="studio-mark" aria-hidden="true"/><span className="studio-name">Corpus Playroom <span>Studio</span></span></div>
    <details className="header-menu project-menu" ref={projectMenu} onKeyDown={closeHeaderMenu}>
     <summary aria-label={`Project menu · ${project.title}`} title={project.title}>
      <span className="active-project">{project.title}</span><ControlIcon kind="chevron"/>
     </summary>
     <div><ProjectControls project={project} projects={projects} onSelect={id=>guardPending('Open project',()=>onSelect(id))}
      onCreate={title=>guardPending('Create project',()=>onCreate(title))} onRename={title=>setProject(current=>({...current,title}))}
      onImport={data=>{const imported=importProject(data);guardPending('Import project',()=>onImport(imported));}} onExport={saveProjectFile}
      onCopyScript={source=>guardPending('Replace script and scenes',()=>{
       setProject(current=>copyProjectScript(current,source));
       transport.seek(0);
       setEditNotice(`Script and scenes copied from ${source.title}.`);
      })}/>
      {project.example==='lola'&&<details className="production-details"><summary>Production details</summary>
       <p>LOLA · Week 7, Late Show by Fletcher Players</p><p>Farshad Jafari · Writer, Director, Scenic Designer</p>
      </details>}
     </div>
    </details>
   {saveError && <div className="storage-warning" role="alert">Browser storage unavailable. <button onClick={saveProjectFile}>Export project</button></div>}
  </header>
  {editNotice&&<div className="edit-notice" role="status"><span>{editNotice}</span>
   {editNotice.endsWith('removed.')&&removalSnapshot.current===project&&<button disabled={!canUndo} onClick={()=>changeHistory(false)}>Undo</button>}
   <button className="quiet" onClick={()=>setEditNotice('')} aria-label="Dismiss message">×</button>
  </div>}
  <main className="workspace">
   <GlobalPanel active={globalTab} onChange={setGlobalTab} panels={{
    script: <ScriptPanel active={globalTab==='script'} script={script} clock={clock} moment={moment} sceneTitles={sceneTitles}
     playing={transport.playing} onSeek={transport.seek} onSceneChange={changeScene} onScriptChange={applyScript} onScriptPreview={previewScript}/>,
    rigging: <>
     <InspectorSection title="Lighting bars">
      <NumberField label="Estimated bar height" value={model.riggingHeight} onChange={v=>update('riggingHeight',v)} min={1000} max={7000}/>
     </InspectorSection>
     <InspectorSection title="Venue reference">
      <details className="light-advanced"><summary>Lighting plan and measurements</summary>
       <a className="plan-source" href="https://www.adctheatre.com/media/2706/lighting.pdf" target="_blank" rel="noreferrer">Corpus Playroom lighting plan ↗</a>
       <p className="small-note">7 bar runs · Rear walls 2,600 mm</p>
      </details>
      <p className="small-note">Bar positions follow the venue plan. Height is estimated. Confirm proposed fixing points with the venue.</p>
     </InspectorSection>
    </>,
    view: <>
     <InspectorSection title="Camera">
      <NumberField label="Seated eye height" value={model.eyeHeight} onChange={v=>update('eyeHeight',v)} min={500} max={2200}/>
      <p className="small-note">Audience presets use the rear row on an estimated 320 mm riser. Eye height is measured above that tier.</p>
     </InspectorSection>
     <InspectorSection title="Visibility">
      <div className="toggles">
       {[['walls','Walls'],['seats','Audience seats'],['grid','500 mm grid'],['labels','Sail labels'],['dimensions','Dimensions'],['riggingLabels','Bar and patch IDs']].map(([key,label])=><label key={key}><input type="checkbox" checked={display[key]} onChange={()=>toggle(key)}/>{label}</label>)}
       <label><input type="checkbox" checked={model.lighting.showCones} onChange={event=>{
        const showCones=event.target.checked;updateLighting(current=>({...current,showCones}));
       }}/>Beam guides</label>
      </div>
     </InspectorSection>
     <InspectorSection title="Saved viewpoints" meta={`${savedViews.length} saved`}>
      <button className="full" onClick={()=>{const camera=api.current?.camera();if(camera)setSavedViews(v=>[...v,{...camera,name:`View ${v.length+1}`}]);}}>Save current viewpoint</button>
      {view.name==='saved'&&<button className="full" onClick={()=>preset(lastPreset.current)}>Return to {CAMERA_VIEWS.find(([key])=>key===lastPreset.current)?.[1]}</button>}
      {savedViews.length>0&&<div className="saved-view-list">
       {savedViews.map((v,i)=><div className="saved-view-row" key={i}>
        <button onClick={()=>setView({name:'saved',custom:v,nonce:Date.now()})}>{v.name}</button>
        <details className="entity-actions"><summary aria-label={`Manage ${v.name}`}>⋯</summary><div>
         <form onSubmit={event=>{
          event.preventDefault();const name=new FormData(event.currentTarget).get('name')?.trim();
          if(name){
           const renamed={...v,name};
           setSavedViews(all=>all.map((item,index)=>index===i?renamed:item));
           if(view.custom===v)setView({...view,custom:renamed});
          }
          event.currentTarget.closest('details').open=false;
         }}><label>Name <input key={v.name} name="name" defaultValue={v.name} maxLength={60} required/></label><button>Rename</button></form>
         <button className="danger" onClick={event=>{event.currentTarget.closest('details').open=false;
          notifyRemoval('Viewpoint removed.',setSavedViews(all=>all.filter((_,index)=>index!==i)));
         }}>Remove viewpoint</button>
        </div></details>
       </div>)}
       <details className="light-advanced"><summary>Manage viewpoints</summary><button className="danger" onClick={()=>notifyRemoval('All viewpoints removed.',setSavedViews(()=>[]))}>Remove all viewpoints</button></details>
      </div>}
     </InspectorSection>
    </>,
   }}/>
   <section className={`viewport ${aimLight!==null?'aiming':''}`} ref={stageViewport} aria-label="Interactive 3D stage">
    <div className="view-toolbar"><div className="segmented" aria-label="Camera viewpoints">{CAMERA_VIEWS.map(([k,n])=><button key={k} aria-pressed={view.name===k} onClick={()=>preset(k)}>{n}</button>)}</div>
     <select className="camera-menu" aria-label="Camera viewpoint" value={view.name} onChange={event=>preset(event.target.value)}>
      {CAMERA_VIEWS.map(([key,label])=><option key={key} value={key}>{label}</option>)}
      {view.name==='saved'&&<option value="saved" disabled>{view.custom.name}</option>}
     </select>
     <div className="view-toolbar-actions">
      <div className="lighting-mode" role="group" aria-label="Viewport lighting">
       <button aria-pressed={!neutralView} onClick={()=>setNeutralView(false)}>{stageLightMix>0&&stageLightMix<1?`${Math.round(stageLightMix*100)}% theatre`:'Show lighting'}</button>
       <button aria-pressed={neutralView} onClick={()=>setNeutralView(true)}>Neutral view</button>
      </div>
      <button className="stage-fullscreen" type="button" ref={fullscreenButton} onClick={toggleStageFullscreen}
       aria-label={fullscreenLabel} title={fullscreenLabel}>
       <ControlIcon kind={stageMode?'exitFullscreen':'fullscreen'}/>
      </button>
     </div>
    </div>
    <Canvas shadows events={stageEvents} dpr={[1,2]} camera={{position:[-6.5,4.5,7.8],fov:45,near:.03,far:100}} gl={{antialias:true}} onCreated={({gl})=>{gl.setClearColor('#252a30');gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.2;}} fallback={<div className="canvas-error">This viewer needs a browser with WebGL enabled.</div>}>
     <StageSelection department={departmentId} aiming={aimLight!==null} onSelect={selectStageEntity} onAim={aimAtPoint}>
      {hovered=><>
       <LightingScene model={lightingModel} look={neutralView?{mix:0,fixtures:{}}:lightLook} selected={departmentId==='lighting'?activeLight?.id:undefined}
        hovered={departmentId==='lighting'?hovered:undefined} adjusting={lightDraft?.id}/>
       <Objects model={stageModel} selected={departmentId==='set'?setItem?.id:undefined} display={display}
        characterId={departmentId==='blocking'?character?.id:undefined} characterDraft={characterDraft}
        department={departmentId} hovered={hovered}/>
      </>}
     </StageSelection>
     <Rig view={view} eyeHeight={model.eyeHeight} api={api}/>
    </Canvas>
    {aimLight!==null&&<div className="aim-overlay" role="status"><span>{activeLight?.name||`L${aimLight}`} · Select a surface to aim</span><button onClick={finishAim}>Cancel aim</button></div>}
    {departmentId==='set' && setItem && <div className="viewport-bottom">
     <span className="selected-chip">{setItem.label}{transport.preview && stageSail && ` · ${Math.round(stageSail.closed*100)}% raised`}</span>
    </div>}
    {departmentId==='blocking' && character && <div className="viewport-bottom"><span className="selected-chip">{characterName(character)}</span></div>}
    {departmentId==='lighting'&&activeLight&&aimLight===null&&<div className="viewport-bottom"><span className="selected-chip">{activeLight.name||`L${activeLight.id}`}</span></div>}
   </section>
   <Inspector department={department} active={inspectorTab} onChange={showTab} warnings={alerts} entities={entities} onStage={showStage}
    headerAction={departmentId==='lighting'&&<button type="button" className="primary lighting-export-action"
     onClick={openLightingExport} disabled={transport.playing}>Export lighting…</button>}
    standalone={departmentId==='lighting'?{id:'room',tabId:'lighting-entity-tab-room'}:undefined}
    onWarning={issue=>{
     selectSetItem(issue.id);showTab(issue.tab,'set');
     requestAnimationFrame(()=>document.getElementById(issue.target)?.scrollIntoView({block:'nearest'}));
    }} panels={{
    fixtures: <LightingControls {...lightingControls} section="fixtures"/>,
    output: <LightingControls {...lightingControls} section="output"/>,
    room: <LightingControls {...lightingControls} section="room"/>,
    characters: <CharacterControls model={stageModel} character={character} placement={stageCharacter}
     preview={previewCharacter} animations={blockingAnimations}
     onSelect={selectCharacter} onEdit={updateCharacter} onPreview={previewCharacterEdit}
     onCommit={commitCharacterEdit}/>,
    clips: <AudioClips markers={audioClips} clock={clock} moment={moment} onSeek={transport.seek}/>,
    objects: <SetControls {...setControls} section="objects"/>,
    dimensions: <SetControls {...setControls} section="dimensions"/>,
   }}/>
   <Timeline department={departmentId} onDepartment={id=>switchDepartment(id,true)} markers={markers} onMarker={openClip}
    animation={animation} sceneTitles={sceneTitles} transport={transport} moment={moment} clock={clock}
    rows={timelineRows} selectedRow={animation?.id??(departmentId==='set'?setItem?.id:undefined)}
    blockingProperty={blockingProperty} onBlockingProperty={property=>chooseChannel(characterChannel(character.id,property))}
    lighting={departmentId==='lighting' ? {
     cues:lightingGos,openingNumber:lightingPlan[0].number,
     pendingCount:pendingDimmers.length,onRecord:()=>saveDrafts(pendingDimmers),onRename:renameLightingGo,onRemove:removeLightingGo,
     onOpening:openOpeningLook,
    } : null}
    channels={[...tracks.channels].filter(([,channel])=>channel.group===departmentId)} onChannel={chooseChannel}
    pending={drafts} resolution={resolution} onCancelResolution={()=>setResolution(null)} onResolve={resolveDrafts}
    onSavePending={item=>saveDrafts([item])} onDiscardPending={item=>discardDraft(item.id,item.time)}
    pendingLabel={id=>tracks.channels.get(id)?.label??id}
    onPendingJump={item=>{const group=tracks.channels.get(item.id)?.group;if(group)switchDepartment(group);chooseChannel(item.id);transport.seek(item.time);}}/>
  </main>
  {lightingExportOpen&&<LightingExportDialog fixtures={model.lighting.fixtures} savedPatch={rehearsal.lightingPatch}
   cues={lightingPlan} omitted={omittedDimmerGos}
   onClose={()=>setLightingExportOpen(false)} onReview={time=>{setLightingExportOpen(false);transport.seek(time);}}
   onRestoreGo={restoreLightingGo}
   onDownload={exportLightingFile}/>}
 </div>;
}

function readStoredLibrary(json,current){
 const stored=JSON.parse(json);
 if(stored?.version!==1 || !Array.isArray(stored.projects) || !stored.projects.length)return current;
 const projects=stored.projects.map(project=>{
  const local=current.projects.find(item=>item.id===project.id);
  return sameProject(local,project) ? local : project;
 });
 const activeId=[current.activeId,stored.activeId].find(id=>projects.some(item=>item.id===id)) ?? projects[0].id;
 return {...stored,projects,activeId};
}

function App(){
 const [library,setLibrary]=useState(()=>loadLibrary(localStorage));
 const state=useRef(library);
 const snapshot=useRef(null);
 const unsaved=useRef(false);
 const history=useRef(new Map());
 const [saveError,setSaveError]=useState(false);
 const active=library.projects.find(project=>project.id===library.activeId);

 function persist(next) {
  try {
   const json=JSON.stringify(next);
   localStorage.setItem(LIBRARY_KEY,json);
   snapshot.current=json;
   unsaved.current=false;
   setSaveError(false);
  } catch {
   unsaved.current=true;
   setSaveError(true);
  }
 }
 useEffect(()=>{
  try {snapshot.current=localStorage.getItem(LIBRARY_KEY);} catch { /* Report errors when saving. */ }
  if(!snapshot.current)persist(state.current);
  const sync=event=>{
   if(event.key!==LIBRARY_KEY || !event.newValue || unsaved.current)return;
   try {
    const json=localStorage.getItem(LIBRARY_KEY);
    if(json===snapshot.current)return;
    state.current=readStoredLibrary(json,state.current);
    snapshot.current=json;
    setLibrary(state.current);
   } catch { /* Ignore malformed external updates. */ }
  };
  window.addEventListener('storage',sync);
  return ()=>window.removeEventListener('storage',sync);
 },[]);

 function change(update) {
  const previous=state.current;
  let current=previous;
  if(!unsaved.current){
   try {
    const json=localStorage.getItem(LIBRARY_KEY);
    if(json!==snapshot.current){
     current=readStoredLibrary(json,current);
     snapshot.current=json;
    }
   } catch { /* Keep the in-memory library if storage is unavailable. */ }
  }
  const next=update(current);
  if(next!==previous){state.current=next;setLibrary(next);}
  if(next!==current)persist(next);
  return next;
 }
 function updateProject(update){
  return change(current=>{
   const project=current.projects.find(item=>item.id===active.id);
   if(!project)return current;
   const next=update(project);
   if(next===project)return current;
   return {...current,projects:current.projects.map(item=>item===project?next:item)};
  }).projects.find(item=>item.id===active.id);
 }
 function editProject(update,group){
  return updateProject(project=>{
   const next=update(project);
   if(sameProject(project,next))return project;
   history.current.set(project.id,recordProjectEdit(history.current.get(project.id),project,next,group));
   return next;
  });
 }
 function moveHistory(redo){
  let restored;
  updateProject(project=>{
   const next=stepProjectHistory(history.current.get(project.id),project,redo);
   if(!next)return project;
   history.current.set(project.id,next);
   restored=next.present;
   return restored;
  });
  return restored;
 }
 function add(project) {
  change(current=>({...current,projects:[...current.projects,project],activeId:project.id}));
 }
 function openProject(activeId) {
  change(current=>{
   if(current.projects.some(project=>project.id===activeId))return {...current,activeId};
   if(activeId===SAMPLE_PROJECT_ID)return {...current,projects:[...current.projects,createSampleProject()],activeId};
   return current;
  });
 }
 const activeHistory=history.current.get(active.id);
 return <Workspace key={active.id} project={active} projects={library.projects} saveError={saveError}
  undoTarget={activeHistory?.present===active?activeHistory.past.at(-1):undefined}
  redoTarget={activeHistory?.present===active?activeHistory.future.at(-1):undefined}
  editProject={editProject} onHistory={moveHistory}
  onSelect={openProject} onCreate={title=>add(createProject(title))}
  onImport={add}/>;
}

class Boundary extends React.Component{
 constructor(props){super(props);this.state={error:null};}
 static getDerivedStateFromError(error){return{error};}
 render(){
  return this.state.error ? <div className="canvas-error">
   <h1>Couldn’t open the workspace</h1><p>{this.state.error.message}</p>
   <button onClick={()=>location.reload()}>Reload</button>
  </div> : this.props.children;
 }
}
createRoot(document.getElementById('root')).render(<Boundary><App/></Boundary>);
