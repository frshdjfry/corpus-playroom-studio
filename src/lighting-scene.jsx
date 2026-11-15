import React,{useMemo,useEffect} from 'react';
import * as T from 'three';
import {FIXTURE_TYPES,beamGeometry} from './lighting.js';
import {hoverOutline,ignoreStageRay} from './stage-selection.jsx';
function Fixture({model,fixture,selected,hovered,theatre,look,showCones,adjusting}){
 const spec=FIXTURE_TYPES[fixture.type],pose=beamGeometry(model,fixture);
 const origin=pose.worldOrigin,targetPosition=pose.worldTarget;
 const target=useMemo(()=>new T.Object3D(),[]);target.position.set(...targetPosition);
 const direction=new T.Vector3(...targetPosition).sub(new T.Vector3(...origin));if(direction.length()<.001)direction.set(0,-1,0);direction.normalize();
 const rotation=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,-1),direction);
 const beamLength=Math.min(15,pose.distance/1000),radius=beamLength*Math.tan(pose.halfAngle);
 const guide=useMemo(()=>{
  const points=[];for(let i=0;i<32;i++){
   const a=i/32*Math.PI*2,b=(i+1)/32*Math.PI*2;
   points.push(new T.Vector3(radius*Math.cos(a),radius*Math.sin(a),-beamLength),new T.Vector3(radius*Math.cos(b),radius*Math.sin(b),-beamLength));
   if(i%8===0)points.push(new T.Vector3(),new T.Vector3(radius*Math.cos(a),radius*Math.sin(a),-beamLength));
  }
  return new T.BufferGeometry().setFromPoints(points);
 },[beamLength,radius]);
 useEffect(()=>()=>guide.dispose(),[guide]);
 const level = fixture.enabled ? (look?.level ?? fixture.intensity) : 0;
 const color = look?.color ?? fixture.color;
 const lit = theatre * level > 0;
 return <>
  <primitive object={target}/>
  {theatre>0&&fixture.enabled&&<spotLight position={origin} target={target} color={color} intensity={40*theatre*level/100} angle={pose.halfAngle} penumbra={fixture.softness} distance={18} decay={2} castShadow={fixture.shadows} shadow-mapSize={[1024,1024]} shadow-camera-near={.1} shadow-camera-far={18} shadow-normalBias={0} shadow-bias={-.001}/>}
  <group position={origin} userData={{stageEntity:{department:'lighting',id:fixture.id}}}>
   <mesh position={[0,.14,0]}><cylinderGeometry args={[.014,.014,.16,8]}/><meshStandardMaterial color="#252a2f" metalness={.5} roughness={.6}/></mesh>
   <mesh position={[0,.21,0]}><boxGeometry args={[.07,.045,.07]}/><meshStandardMaterial color="#363d42"/></mesh>
   <group quaternion={rotation}>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[spec.radius,spec.radius*.85,spec.length,16]}/><meshStandardMaterial color={selected?'#89754e':'#272b30'} roughness={.65} metalness={.3}/></mesh>
    {hovered&&<mesh rotation={[Math.PI/2,0,0]} material={hoverOutline} raycast={ignoreStageRay}><cylinderGeometry args={[spec.radius,spec.radius*.85,spec.length,16]}/></mesh>}
    <mesh position={[0,0,-Math.max(spec.length/2,spec.kind==='profile'?spec.length*.42+.06:0)-.004]} rotation={[0,Math.PI,0]}><circleGeometry args={[spec.radius*.86,24]}/><meshStandardMaterial color={lit?color:'#7e858a'} emissive={color} emissiveIntensity={lit?.7:0} roughness={.2}/></mesh>
    {spec.kind==='profile'&&<mesh position={[0,0,-spec.length*.42]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[spec.radius*.64,spec.radius*.80,.12,16]}/><meshStandardMaterial color="#32383d"/></mesh>}
    {selected&&<mesh raycast={ignoreStageRay}><torusGeometry args={[spec.radius+.018,.004,6,24]}/><meshBasicMaterial color="#e0b875"/></mesh>}
   </group>
   {(adjusting||(showCones&&fixture.enabled))&&<group quaternion={rotation}><lineSegments geometry={guide} raycast={ignoreStageRay}><lineBasicMaterial color={color} transparent opacity={adjusting?.85:selected?.55:.19} depthWrite={false}/></lineSegments></group>}
  </group>
 </>;
}
export function LightingScene({model,look,selected,hovered,adjusting}){
 const theatre = look?.mix ?? (model.lighting.mode==='theatre' ? 1 : 0);
 const neutral = 1 - theatre;
 return <>
  {neutral>0&&<>
   <ambientLight intensity={.85*neutral}/><hemisphereLight args={['#e9eef7','#36312b']} intensity={1.3*neutral}/>
   <directionalLight position={[-3,6,4]} intensity={2.5*neutral} color="#fff0d5" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-normalBias={.025}/>
   <directionalLight position={[3,4,-1]} intensity={1.2*neutral} color="#d6e3fa"/>
  </>}
  {theatre>0&&<ambientLight intensity={(look?.ambient ?? model.lighting.ambient)*theatre}/>}
  {model.lighting.fixtures.map(f=><Fixture key={f.id} model={model} fixture={f} look={look?.fixtures[f.id]} selected={selected===f.id}
   hovered={hovered===f.id} adjusting={adjusting===f.id} theatre={theatre} showCones={model.lighting.showCones}/>)}
 </>;
}
