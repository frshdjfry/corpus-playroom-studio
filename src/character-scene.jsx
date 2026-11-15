import React, {useEffect, useLayoutEffect, useMemo} from 'react';
import * as T from 'three';
import {characterLayout, STANDING_SPAN, TURNED_PROFILES} from './characters.js';
import {planToWorld} from './lighting.js';
import {hoverOutline, ignoreStageRay} from './stage-selection.jsx';

function turned(profile) {
  return new T.LatheGeometry(profile.map(([radius, height]) => new T.Vector2(radius, height)), 24);
}

const shapes = {
  oval: new T.SphereGeometry(1, 24, 16),
  spindle: turned(TURNED_PROFILES.spindle),
  torso: turned(TURNED_PROFILES.torso),
};
const up = new T.Vector3(0, 1, 0);
const selection = new T.MeshBasicMaterial({color:'#e1bd84', transparent:true, opacity:0.78, depthWrite:false});
const ring = new T.RingGeometry(0.117, 0.122, 40);
const facingTick = new T.BoxGeometry(0.014, 0.003, 0.043);

export function CharacterObject({character, selected, hovered}) {
  const {bodyColor, jointColor} = character;
  const finish = useMemo(() => ({
    wood: new T.MeshStandardMaterial({roughness:0.52}),
    joint: new T.MeshStandardMaterial({roughness:0.6}),
  }), []);
  useLayoutEffect(() => {
    finish.wood.color.set(bodyColor);
    finish.joint.color.set(jointColor);
  }, [finish, bodyColor, jointColor]);
  useEffect(() => () => {
    finish.wood.dispose();
    finish.joint.dispose();
  }, [finish]);
  const layout = useMemo(() => {
    const {parts, floor} = characterLayout(character.pose);
    return {
      floor,
      parts: parts.map(part => ({
        ...part, rotation: new T.Quaternion().setFromUnitVectors(up, new T.Vector3(...part.axis)),
      })),
    };
  }, [character.pose]);
  const metres = character.height / 1000 / STANDING_SPAN;
  const position = planToWorld({x:character.x, y:character.y, height:character.elevation});
  return <group position={position} rotation={[0, character.direction * Math.PI / 180, 0]}
    userData={{stageEntity:{department:'blocking', id:character.id}}} dispose={null}>
    <group scale={metres} position={[0, -layout.floor * metres, 0]}>
      {layout.parts.map((part, index) => <mesh key={index} geometry={shapes[part.shape]} material={finish[part.tone]}
        position={part.center} quaternion={part.rotation} scale={part.radii} castShadow receiveShadow>
        {hovered && <mesh geometry={shapes[part.shape]} material={hoverOutline} raycast={ignoreStageRay}/>}
      </mesh>)}
    </group>
    {selected && <group position={[0, 0.004, 0]} scale={metres}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={ring} material={selection} raycast={ignoreStageRay}/>
      <mesh position={[0, 0, 0.132]} geometry={facingTick} material={selection} raycast={ignoreStageRay}/>
    </group>}
  </group>;
}
