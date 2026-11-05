import * as THREE from 'three';
import { AIR_FIELD_GLSL } from './field-shader.js';
// The path is a presentation animation, never a velocity inferred from pollutants.
// Concentration, color and relative particle occupancy share the cloud's IDW field.
const vertex=`
attribute vec4 aSeed;attribute float aTrail;
uniform float uTime,uSpeed;uniform vec3 uCenter;
varying vec3 vColor;varying float vAlpha;varying vec3 vLocal;
${AIR_FIELD_GLSL}
void main(){
 float head=fract(aSeed.x+uTime*.012*uSpeed);
 float x=head-aTrail*.09-.5;
 float z=aSeed.y*.72+sin((x+.5)*8.168+aSeed.x*6.283)*.045;
 float y=aSeed.z*.60+sin(x*9.0+aSeed.y*12.0)*.10;
 vec3 p=vec3(x,y,z);vLocal=p;
 float concentration=field(p),t=clamp((concentration-uScaleMin)/max(.001,uScaleMax-uScaleMin),0.,1.);
 vColor=palette(t);vAlpha=(.3+.7*t)*pow(1.0-aTrail,1.25);
 #ifdef PARTICLES
  // Sampling occupancy is illustrative relative density, not a particle count per m³.
  vAlpha*=step(aSeed.w,.25+.75*t);
 #endif
 vec4 mv=modelViewMatrix*vec4(uCenter+p*uSize,1.);
 gl_Position=projectionMatrix*mv;
 gl_PointSize=clamp((2.3+2.0*sqrt(t))*700.0/max(50.,-mv.z),1.8,7.0);
}`;
const fragment=`
varying vec3 vColor;varying float vAlpha;varying vec3 vLocal;
void main(){
 if(abs(vLocal.x)>.49||abs(vLocal.y)>.49||abs(vLocal.z)>.49)discard;
 float alpha=vAlpha*(1.-smoothstep(.40,.49,abs(vLocal.x)));
 #ifdef PARTICLES
  float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;alpha*=exp(-d*d*3.5)*.85;
 #endif
 if(alpha<.01)discard;
 gl_FragColor=vec4(vColor,alpha);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
function random(seed){let state=seed>>>0;return()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};}
function makeGeometry(count,trails){const seeds=[],progress=[],rand=random(trails?719:119);for(let i=0;i<count;i++){const seed=[rand(),rand()-.5,rand()-.5,rand()];if(trails){for(let j=0;j<20;j++){seeds.push(...seed,...seed);progress.push(j/20,(j+1)/20);}}else{seeds.push(...seed);progress.push(0);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(progress.length*3),3));geo.setAttribute('aSeed',new THREE.Float32BufferAttribute(seeds,4));geo.setAttribute('aTrail',new THREE.Float32BufferAttribute(progress,1));return geo;}
export function createAirFlow(){
 const group=new THREE.Group();group.name='Schematic flow - concentration colored, NOT measured wind';group.visible=false;
 const uniforms={uTime:{value:0},uSpeed:{value:1},uCenter:{value:new THREE.Vector3()},uSize:{value:new THREE.Vector3(1,1,1)},uScaleMin:{value:0},uScaleMax:{value:1},uSensorCount:{value:0},uSensors:{value:Array.from({length:4},()=>new THREE.Vector2())},uValues:{value:[0,0,0,0]}};
 const material=defines=>new THREE.ShaderMaterial({uniforms,defines,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,depthTest:true});
 const lines=new THREE.LineSegments(makeGeometry(90,true),material({}));const particles=new THREE.Points(makeGeometry(2600,false),material({PARTICLES:1}));
 for(const mesh of [lines,particles]){mesh.frustumCulled=false;mesh.renderOrder=5;group.add(mesh);}
 lines.visible=false;
 let setting={lines:false,particles:true,speed:1},clock=0,previous=null;
 return {group,
  setField({samples,scaleMin,scaleMax,centerY,halfHeight,bounds,enabled}){group.visible=enabled&&samples.length>0;uniforms.uScaleMin.value=scaleMin;uniforms.uScaleMax.value=scaleMax;uniforms.uSensorCount.value=Math.min(4,samples.length);const cx=(bounds.minX+bounds.maxX)/2,cz=(bounds.minZ+bounds.maxZ)/2;uniforms.uCenter.value.set(cx,centerY,cz);uniforms.uSize.value.set(bounds.maxX-bounds.minX,halfHeight*2,bounds.maxZ-bounds.minZ);samples.slice(0,4).forEach((s,i)=>{uniforms.uSensors.value[i].set(s.x-cx,s.z-cz);uniforms.uValues.value[i]=s.value;});},
  settings(next){setting={...setting,...next,lines:false};lines.visible=false;particles.visible=setting.particles;},
  update(milliseconds){if(previous!==null)clock+=Math.min(.1,Math.max(0,(milliseconds-previous)/1000))*setting.speed;previous=milliseconds;uniforms.uTime.value=clock;uniforms.uSpeed.value=1;},
  dispose(){for(const object of [lines,particles]){object.geometry.dispose();object.material.dispose();}group.clear();group.removeFromParent();}
 };
}
