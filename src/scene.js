import * as T from 'three';
import {STAGE,elevations,sailName} from './model.js';
import {RIGGING,suspensionAnchors} from './rigging-plan.js';
import {VENUE} from './venue-plan.js';
const mats={
 wood:new T.MeshStandardMaterial({color:'#ad8050',roughness:.75}),
 rope:new T.MeshStandardMaterial({color:'#736047',roughness:1}),
 sand:new T.MeshStandardMaterial({color:'#bba078',roughness:1}),
 metal:new T.MeshStandardMaterial({color:'#444950',metalness:.6,roughness:.5}),
 fabric:new T.MeshStandardMaterial({color:'#e7dfc9',side:T.DoubleSide,roughness:1,
  transparent:true,opacity:.9,depthWrite:false,forceSinglePass:true}),
 seat:new T.MeshStandardMaterial({color:'#773441',roughness:1}),
 floor:new T.MeshStandardMaterial({color:'#42464a',roughness:1}),
 wall:new T.MeshStandardMaterial({color:'#d3d0c7',side:T.DoubleSide,roughness:1}),
 selected:new T.LineBasicMaterial({color:'#d1aa6a'}),
};
// Transmit diffuse light from the reverse face using the same shadowed light
// contribution as the front face, so a figure between a lamp and the cloth reads as a silhouette.
mats.fabric.onBeforeCompile=shader=>{
 shader.fragmentShader=shader.fragmentShader.replace('#include <lights_physical_pars_fragment>',`
  #include <lights_physical_pars_fragment>

  void RE_Direct_Sail( const in IncidentLight light, const in vec3 position, const in vec3 normal,
    const in vec3 viewDir, const in vec3 clearcoatNormal, const in PhysicalMaterial material,
    inout ReflectedLight reflectedLight ) {
    RE_Direct_Physical( light, position, normal, viewDir, clearcoatNormal, material, reflectedLight );
    float backlight = max( 0.0, -dot( normal, light.direction ) );
    reflectedLight.directDiffuse += 0.65 * backlight * light.color * BRDF_Lambert( material.diffuseColor );
  }

  #undef RE_Direct
  #define RE_Direct RE_Direct_Sail
 `);
};
function mesh(g,mat,p=[0,0,0]){const m=new T.Mesh(g,mat);m.position.set(...p);m.castShadow=true;m.receiveShadow=true;return m;}
function box(parent,size,pos,mat){const m=mesh(new T.BoxGeometry(...size),mat,pos);parent.add(m);return m;}
function cord(parent,a,b,r=.003,mat=mats.rope){const v=new T.Vector3(...a),w=new T.Vector3(...b),d=w.clone().sub(v);if(d.length()<.0001)return;
 const m=mesh(new T.CylinderGeometry(r,r,d.length(),7),mat);m.position.copy(v.add(w).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());parent.add(m);return m;}
function path(parent,points,r=.003){const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));parent.add(mesh(new T.TubeGeometry(c,Math.max(10,points.length*3),r,6,false),mats.rope));}
function knot(parent,x,y,z){const k=mesh(new T.TorusGeometry(.009,.0035,5,9),mats.rope,[x,y,z]);k.rotation.z=.5;parent.add(k);}
function bag(parent,x,neck,z,height=.15,width=.105){
 const b=mesh(new T.SphereGeometry(1,12,9),mats.sand,[x,neck-height*.54,z]);b.scale.set(width*.52,height*.46,width*.39);parent.add(b);
 const n=mesh(new T.CylinderGeometry(width*.12,width*.26,height*.2,9),mats.sand,[x,neck-height*.1,z]);parent.add(n);knot(parent,x,neck-height*.12,z);
 for(const dx of [-.014,.014])cord(parent,[x+dx,neck-height*.2,z+width*.33],[x+dx*2,neck-height*.68,z+width*.36],.0014,mats.rope);
}
function label(parent,words,pos,color='#d6d9dc',size=.18){
 const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.font='500 42px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(words,256,48);
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:false}));s.position.set(...pos);s.scale.set(size*512/96,size,1);parent.add(s);
}
function measure(parent,a,b,words){const mat=new T.LineBasicMaterial({color:'#aeb5bf'});const g=new T.BufferGeometry().setFromPoints([new T.Vector3(...a),new T.Vector3(...b)]);parent.add(new T.Line(g,mat));label(parent,words,a.map((v,i)=>(v+b[i])/2+(i===1?.09:0)),'#c3ccd7',.13);}
export function makeSail(model,s,selected,labels,dimensions){
 const m=s.dimensions ? {...model,...s.dimensions} : model;
 const g=new T.Group();g.name=sailName(s);g.userData.sailId=s.id;g.position.set((s.x-STAGE.width/2)/1000,0,(STAGE.depth/2-s.y)/1000);g.rotation.y=s.angle*Math.PI/180;
 const e=elevations(m,s.closed),top=e.top/1000,bottom=e.bottom/1000,w=m.fabricWidth/1000,l=m.battenLength/1000;
 const nx=30,ny=72,positions=[],uv=[],indices=[];
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
  const u=i/nx,v=j/ny,x=(u-.5)*w,y=bottom+(top-bottom)*v;
  const z=Math.sin(v*Math.PI*12)*(.004+.029*s.closed)*Math.sin(u*Math.PI)+.008*Math.sin(u*Math.PI*7)*Math.sin(v*Math.PI);
  positions.push(x,y,z);uv.push(u,v);
 }
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
 const fabric=mesh(geo,mats.fabric);
 fabric.castShadow=false;
 g.add(fabric);
 for(const y of [top,bottom])box(g,[l,.024,.026],[0,y,0],mats.wood);
 const ropeXs=[-Math.min(.3,w*.22),Math.min(.3,w*.22)];
 for(const tie of suspensionAnchors(m,s)){
  const end=[tie.anchorLocalX/1000,m.riggingHeight/1000,tie.anchorLocalZ/1000];
  const support=cord(g,[tie.localX/1000,top+.015,0],end,.004);
  support.name=`Suspension pickup ${tie.pickup+1} to bar ${tie.to.bar}`;
  support.userData.anchorBar=tie.to.bar;
  const clamp=mesh(new T.SphereGeometry(.016,7,5),mats.metal,end);g.add(clamp);
 }
 // Put the operating assembly on the face away from the shared audience corner.
 // Mirroring the whole assembly keeps pulleys, threading, handles and floor
 // tie-offs together while leaving the suspension ropes unchanged.
 const operating=new T.Group();operating.name='Backstage operating ropes';
 operating.scale.z=Math.cos(g.rotation.y)-Math.sin(g.rotation.y)>=0?-1:1;
 g.add(operating);
 for(const x of ropeXs){
  const py=top+.064;
  const pulley=mesh(new T.TorusGeometry(.021,.005,6,14),mats.metal,[x,py,.025]);operating.add(pulley);
  cord(operating,[x,top+.012,.025],[x,py-.02,.025],.004,mats.metal);
  const holes=Array.from({length:6},(_,i)=>top-(top-bottom)*(.10+i*.16));
  const levels=[top+.06,...holes,bottom];
  levels.slice(0,-1).forEach((y,i)=>{const front=i%2===0;cord(operating,[x,y,front?.028:-.03],[x,levels[i+1],front?.028:-.03],.0032);});
  for(const y of holes){const ring=mesh(new T.TorusGeometry(.007,.0018,5,10),mats.rope,[x,y,.016]);operating.add(ring);cord(operating,[x,y+.008,.03],[x,y-.008,-.03],.003);}
  const neck=bottom-m.tieLength/1000;cord(operating,[x,bottom,0],[x,neck,0],.0035);bag(operating,x,neck,0,m.bagHeight/1000);
 }
 // Equal-length return branches: the first joining knot moves down as the sail is raised.
 const half=ropeXs[1],branchOpen=Math.hypot(half,.35),branchLength=branchOpen+(e.bottom-elevations(m).bottom)/1000;
 const joinY=top+.064-Math.sqrt(Math.max(0,branchLength*branchLength-half*half)),handleZ=.10;
 for(const x of ropeXs){path(operating,[[x,top+.06,.03],[x,top+.09,.055],[x,top+.055,.08],[0,joinY,handleZ]],.0035);}
 const tailLength=Math.max(.2,(elevations(m).top/1000-.35)-.08);
 const anchorNeck=.20,handleEnd=joinY-tailLength;
 const visibleEnd=s.closed>.95?Math.max(anchorNeck,handleEnd):Math.max(.07,handleEnd);
 for(const x of [-.006,.006])cord(operating,[x,joinY,handleZ],[x,visibleEnd,handleZ],.0035);
 for(let y=joinY;y>visibleEnd+.02;y-=.19)knot(operating,0,y,handleZ);
 if(s.closed>.95){
  cord(operating,[0,visibleEnd,handleZ],[0,anchorNeck,.22],.005);bag(operating,0,anchorNeck,.22,.2,.32);knot(operating,0,anchorNeck,.22);
  // Excess tail lies beside the ground bag after the tie-off.
  path(operating,[[0,anchorNeck,.22],[.13,.035,.30],[.25,.012,.35],[.36,.012,.27],[.28,.012,.17],[.16,.012,.21]],.005);
 }
 if(selected){const pts=[[-l/2,bottom-.025,.05],[-l/2,top+.025,.05],[l/2,top+.025,.05],[l/2,bottom-.025,.05],[-l/2,bottom-.025,.05]].map(v=>new T.Vector3(...v));g.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),mats.selected));}
 if(labels)label(g,s.name || `S${s.id}`,[0,top+.20,0],selected?'#edc78b':'#e0e2e4',.15);
 if(dimensions&&selected){measure(g,[-l/2,top+.32,0],[l/2,top+.32,0],`${m.battenLength} mm`);measure(g,[l/2+.15,bottom,0],[l/2+.15,top,0],`${Math.round(e.drop)} mm`);}
 g.traverse(o=>{if(o.isMesh)o.userData.sailId=s.id;});return g;
}
export function makeRoom(m,{walls,seats,grid,labels,dimensions,riggingLabels=false}){
 const g=new T.Group(),w=STAGE.width/1000,d=STAGE.depth/1000,h=RIGGING.rearWallHeight/1000;
 // The 4,160 mm width is the plan's back reference span; the right wall flares out.
 const planWorld=p=>[(p.x-STAGE.width/2)/1000,0,(STAGE.depth/2-p.y)/1000];
 const outline=new T.Shape();
 VENUE.floorOutline.forEach((p,i)=>{const q=planWorld(p);if(i===0)outline.moveTo(q[0],-q[2]);else outline.lineTo(q[0],-q[2]);});outline.closePath();
 const floor=mesh(new T.ExtrudeGeometry(outline,{depth:.08,bevelEnabled:false,steps:1}),mats.floor,[0,-.08,0]);floor.rotation.x=-Math.PI/2;g.add(floor);
 const wallPart=(a,b,height=h,base=0)=>{
  const pa=planWorld(a),pb=planWorld(b),length=Math.hypot(pb[0]-pa[0],pb[2]-pa[2]);
  const part=box(g,[length,height,.065],[(pa[0]+pb[0])/2,base+height/2,(pa[2]+pb[2])/2],mats.wall);
  part.rotation.y=Math.atan2(-(pb[2]-pa[2]),pb[0]-pa[0]);return part;
 };
 if(walls){
  for(const [i,segment] of VENUE.wallSegments.entries()){
   if(i===VENUE.door.wallSegment){
    wallPart(segment.a,VENUE.door.latch);
    wallPart(VENUE.door.hinge,segment.b);
    wallPart(VENUE.door.latch,VENUE.door.hinge,h-VENUE.door.openingHeight/1000,VENUE.door.openingHeight/1000);
   }else wallPart(segment.a,segment.b);
  }
  const door=VENUE.door,pa=planWorld(door.hinge),pb=planWorld(door.latch);
  const frame=new T.Group();frame.name='Mapped backstage door';frame.userData.planDoor=true;
  frame.position.set((pa[0]+pb[0])/2,0,(pa[2]+pb[2])/2);
  frame.rotation.y=Math.atan2(-(pb[2]-pa[2]),pb[0]-pa[0]);
  const dw=door.width/1000,dh=door.openingHeight/1000;
  const doorMat=new T.MeshStandardMaterial({color:'#aeafa7',roughness:.9});
  box(frame,[dw-.026,dh-.018,.036],[0,(dh-.018)/2,0],doorMat);
  for(const x of [-dw/2,dw/2])box(frame,[.025,dh,.078],[x,dh/2,0],mats.wood);
  box(frame,[dw+.025,.026,.078],[0,dh,0],mats.wood);
  const knob=mesh(new T.SphereGeometry(.022,9,7),mats.metal,[dw*.34,1.02,-.04]);frame.add(knob);g.add(frame);
 }
 if(grid){const gh=new T.GridHelper(10,20,'#737a82','#535a62');gh.position.y=.003;g.add(gh);}
 // Bar positions traced from the lighting plan; bar height remains an editable estimate.
 const rigY=m.riggingHeight/1000;
 const world=(p)=>[(p.x-STAGE.width/2)/1000,rigY,(STAGE.depth/2-p.y)/1000];
 for(const bar of RIGGING.bars){
  const tube=cord(g,world(bar.a),world(bar.b),.026,mats.metal);
  tube.name=`Lighting bar ${bar.id}`;tube.userData.riggingBar=bar.id;
  if(riggingLabels){
   const a=world(bar.a),b=world(bar.b);
   label(g,`Bar ${bar.id}`,a.map((v,i)=>(v+b[i])/2+(i===1?.16:0)),'#d2b68a',.15);
  }
 }
 // Socket identifiers, not light fittings. Removed and floor circuits are excluded.
 const patchMat=new T.MeshStandardMaterial({color:'#9f6459',roughness:.7});
 for(const patch of RIGGING.patches){
  const pos=world(patch);pos[1]-=.029;
  const socket=box(g,[.045,.035,.045],pos,patchMat);
  socket.name=`Patch ${patch.circuit}`;socket.userData.patchCircuit=patch.circuit;
  if(riggingLabels)label(g,String(patch.circuit),[pos[0],pos[1]-.1,pos[2]],'#e2b6ab',.105);
 }
 if(seats){
  for(let row=0;row<3;row++)for(let col=0;col<7;col++){
   const x=(col-3)*.49,z=d/2+.7+row*.75,y=row*.16;
   box(g,[.44,.13,.42],[x,y+.39,z],mats.seat);box(g,[.44,.43,.09],[x,y+.67,z+.22],mats.seat);
  }
  for(let row=0;row<3;row++)for(let col=0;col<7;col++){
   const x=-w/2-.7-row*.75,z=(col-3)*.58,y=row*.16;
   box(g,[.42,.13,.48],[x,y+.39,z],mats.seat);box(g,[.09,.43,.48],[x-.22,y+.67,z],mats.seat);
  }
 }
 if(labels){label(g,'AUDIENCE A',[0,.06,d/2+.4],'#aeb7c1',.16);label(g,'AUDIENCE B',[-w/2-.55,.06,0],'#aeb7c1',.16);if(walls){const p=planWorld(VENUE.door.centre);label(g,'STAGE DOOR',[p[0]-.10,VENUE.door.openingHeight/1000+.16,p[2]],'#959b9f',.12);}}
 if(dimensions){measure(g,[-w/2,.05,d/2+.13],[w/2,.05,d/2+.13],'4,160 mm');measure(g,[w/2+.22,.05,-d/2],[w/2+.22,.05,d/2],'5,030 mm');}
 return g;
}
export function disposeGroup(group){group.traverse(o=>{o.geometry?.dispose();if(o.isSprite){o.material.map?.dispose();o.material.dispose();}});}
