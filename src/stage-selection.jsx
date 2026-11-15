import React, {useEffect, useState} from 'react';
import {events, useThree} from '@react-three/fiber';
import {Color, BackSide, ShaderMaterial} from 'three';

export const HOVER_COLOUR = '#fff092';
export const ignoreStageRay = () => null;

export const hoverOutline = new ShaderMaterial({
  side: BackSide,
  uniforms: {colour: {value: new Color(HOVER_COLOUR)}},
  vertexShader: `
    void main() {
      vec4 point = modelViewMatrix * vec4(position, 1.0);
      point.xyz += normalize(normalMatrix * normal) * 0.015;
      gl_Position = projectionMatrix * point;
    }
  `,
  fragmentShader: `
    uniform vec3 colour;
    void main() {
      gl_FragColor = vec4(colour, 1.0);
      #include <colorspace_fragment>
    }
  `,
});

export function stageEvents(state) {
  return {...events(state), filter: intersections => intersections.filter(hit => hit.object.isMesh)};
}

function stageEntity(object) {
  for (let item = object; item; item = item.parent) {
    if (item.userData.stageEntity) return item.userData.stageEntity;
  }
  return null;
}

export function StageSelection({department, aiming, onSelect, onAim, children}) {
  const canvas = useThree(state => state.gl.domElement);
  const [hovered, setHovered] = useState(null);
  const highlighted = !aiming && hovered?.department === department ? hovered.id : undefined;

  useEffect(() => setHovered(null), [department, aiming]);
  useEffect(() => {
    if (highlighted === undefined) return;
    canvas.style.cursor = 'pointer';
    return () => {canvas.style.cursor = '';};
  }, [canvas, highlighted]);

  return <group onPointerMove={event => {
    event.stopPropagation();
    const entity = aiming || event.buttons ? null : stageEntity(event.object);
    const next = entity?.department === department ? entity : null;
    setHovered(current => current?.department === next?.department && current?.id === next?.id ? current : next);
  }} onPointerOut={() => setHovered(null)} onClick={event => {
    event.stopPropagation();
    if (event.delta > 3) return;
    const entity = stageEntity(event.object);
    if (aiming) {
      if (entity?.department !== 'lighting') onAim(event.point);
    } else if (entity?.department === department) onSelect(entity.id);
  }}>
    {children(highlighted)}
  </group>;
}
