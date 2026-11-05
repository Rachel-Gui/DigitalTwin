import { AIR_FIELD_GLSL } from './field-shader.js';
import { createAirFlow } from './flow.js';
import * as THREE from 'three';
import {geoToModel,inModelBounds,metricState,cloudColor,POLLUTANTS,concentrationRange} from './cloud-data.js';
import {sensorName,formatValue,observationTime,locatedSources} from './sensor-data.js';
const $=id=>document.getElementById(id);
// Bounded ellipsoids of animated procedural density. The sampled concentration is
// uniform per sensor; the noise/radius is illustrative, not dispersion modelling.
const vertexShader=`varying vec3 vLocal; void main(){vLocal=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const fragmentShader=`precision highp float;
varying vec3 vLocal;uniform mat4 projectionMatrix;uniform mat4 modelViewMatrix;uniform vec3 uCamera,uColor;uniform float uTime,uOpacity,uStrength;uniform float uRegional;uniform sampler2D uDepth;uniform vec2 uResolution;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
${AIR_FIELD_GLSL}
void main(){
 vec3 ray=normalize(vLocal-uCamera);vec3 inv=1.0/ray;vec3 a=(-vec3(.5)-uCamera)*inv,b=(vec3(.5)-uCamera)*inv;
 vec3 lo=min(a,b),hi=max(a,b);float nearT=max(max(lo.x,lo.y),lo.z),farT=min(min(hi.x,hi.y),hi.z);nearT=max(nearT,0.0);if(farT<=nearT)discard;
 float stepT=(farT-nearT)/48.0,alpha=0.0;vec3 rgb=vec3(0.0);float sceneDepth=texture2D(uDepth,gl_FragCoord.xy/uResolution).r;
 for(int i=0;i<48;i++){vec3 p=uCamera+ray*(nearT+(float(i)+.5)*stepT);vec4 clip=projectionMatrix*modelViewMatrix*vec4(p,1.0);float depth=clip.z/clip.w*.5+.5;if(depth>sceneDepth+.000001)break;
 float edge=uRegional>.5?(1.0-smoothstep(.35,.5,abs(p.x)))*(1.0-smoothstep(.35,.5,abs(p.z)))*(1.0-smoothstep(.18,.5,abs(p.y))):1.0-smoothstep(.45,1.0,length(p*2.0));float n=noise(p*vec3(12.,5.,12.)+vec3(0.0,uTime*.025,0.0))*.7+noise(p*24.0)*.3;
 float concentration=field(p);float normalized=clamp((concentration-uScaleMin)/max(uScaleMax-uScaleMin,.001),0.0,1.0);float strength=uRegional>.5?.35+.65*sqrt(normalized):uStrength;
 float density=edge*smoothstep(.2,.8,n);float sampleA=1.0-exp(-density*stepT*28.0*uOpacity*strength);
 vec3 lit=(uRegional>.5?palette(normalized):uColor)*(.75+.35*(p.y+.5));rgb+=(1.0-alpha)*sampleA*lit;alpha+=(1.0-alpha)*sampleA;if(alpha>.94)break;}
 if(alpha<.004)discard;gl_FragColor=vec4(rgb/max(alpha,.001),alpha);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
export function createAirClouds({scene,camera,renderer,host,controls}){
 const group=new THREE.Group();group.name='Sensor observation clouds - illustrative radius and altitude';scene.add(group);
 const volumes=new THREE.Group();group.add(volumes);const airFlow=createAirFlow();group.add(airFlow.group);const annotations=new THREE.Group();group.add(annotations);
 const labels=document.createElement('div');labels.className='cloud-labels';host.parentElement.append(labels);
 const target=new THREE.WebGLRenderTarget(1,1);target.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
 let registration,modelBounds,sources=[],items=[],snapshot=null,selectedId=null,disposed=false;
 const vector=new THREE.Vector3(),worldCamera=new THREE.Vector3(),resolution=new THREE.Vector2();
 const boundaryObjects=[];
 function clear(){for(const part of [volumes,annotations]){for(const child of [...part.children]){part.remove(child);child.geometry?.dispose();const mats=Array.isArray(child.material)?child.material:[child.material];mats.forEach(m=>m?.dispose());}}items=[];boundaryObjects.length=0;labels.replaceChildren();}
 function rebuild(){if(!registration||!modelBounds)return;clear();
  const key=$('cloud-pollutant').value,config=POLLUTANTS[key],radius=+$('cloud-radius').value,centerY=+$('cloud-altitude').value,regional=$('cloud-mode').value==='regional',halfHeight=regional?75:30;
  const samples=sources.map(source=>{const p=geoToModel(source.latitude,source.longitude,registration),state=metricState(source.metrics?.[key]);return inModelBounds(p,modelBounds)&&state.valid?{x:p[0],z:p[1],value:state.value,time:source.metrics[key].time}:null;}).filter(Boolean).slice(0,4);
  const [scaleMin,scaleMax]=concentrationRange(samples,config,$('cloud-scale').value==='local');
  const uniforms=(color,strength=1)=>({uCamera:{value:new THREE.Vector3()},uColor:{value:color},uTime:{value:0},uOpacity:{value:+$('cloud-opacity').value/100},uStrength:{value:strength},uDepth:{value:target.depthTexture},uResolution:{value:resolution},uRegional:{value:0},uSize:{value:new THREE.Vector3(1,1,1)},uScaleMin:{value:scaleMin},uScaleMax:{value:scaleMax},uSensors:{value:Array.from({length:4},()=>new THREE.Vector2())},uValues:{value:[0,0,0,0]},uSensorCount:{value:0}});
  $('cloud-radius-value').textContent=radius+' m';$('cloud-altitude-value').textContent=(centerY-halfHeight)+'–'+(centerY+halfHeight)+' m';$('cloud-max').textContent=scaleMax.toFixed(1)+' '+config.unit;$('cloud-min').textContent=scaleMin.toFixed(1);$('cloud-radius-value').textContent=regional?'+'+Math.round(radius*.35)+' m padding':radius+' m radius';
  let valid=0,invalid=0,outside=0;
  for(const source of sources){const position=geoToModel(source.latitude,source.longitude,registration);if(!inModelBounds(position,modelBounds)){outside++;continue;}
   const state=metricState(source.metrics?.[key]),rgb=state.valid?cloudColor(Math.max(0,state.value-scaleMin),scaleMax-scaleMin):[.5,.54,.56],color=new THREE.Color().setRGB(...rgb,THREE.SRGBColorSpace);const [x,z]=position;
   const marker=new THREE.Mesh(new THREE.SphereGeometry(3.5,12,8),new THREE.MeshBasicMaterial({color}));marker.position.set(x,2,z);annotations.add(marker);
   const ringPoints=[];for(let i=0;i<=80;i++){const t=i/80*Math.PI*2;ringPoints.push(new THREE.Vector3(x+Math.cos(t)*radius,1.3,z+Math.sin(t)*radius));}
   const ring=new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPoints),new THREE.LineDashedMaterial({color,dashSize:9,gapSize:6,transparent:true,opacity:.65}));ring.computeLineDistances();ring.visible=!regional&&$('show-cloud-boundaries').checked;annotations.add(ring);boundaryObjects.push(ring);
   if(state.valid){valid++;if(!regional){const material=new THREE.ShaderMaterial({uniforms:uniforms(color,.35+.65*Math.sqrt(Math.min(1,Math.max(0,(state.value-scaleMin)/(scaleMax-scaleMin))))),vertexShader,fragmentShader,transparent:true,depthWrite:false,depthTest:false,side:THREE.BackSide});const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),material);mesh.position.set(x,centerY,z);mesh.scale.set(radius*2,halfHeight*2,radius*2);mesh.renderOrder=3;volumes.add(mesh);}}else invalid++;
   const label=document.createElement('button');label.type='button';label.className='cloud-label';label.dataset.id=source.datasourceId;label.style.setProperty('--cloud-color','#'+color.getHexString());
   const title=document.createElement('strong');title.textContent=sensorName(source);const value=document.createElement('span');value.textContent=config.label+' '+formatValue(state.value)+' '+config.unit+(state.valid?'':' · '+state.reason);const extent=document.createElement('small');extent.textContent=state.valid?`Observed point · ${observationTime(source.metrics[key]?.time)}`:'Invalid / missing data · Excluded from field';
   label.append(title,value,extent);label.title=[title.textContent,value.textContent,extent.textContent].join(' · ');label.setAttribute('aria-label',label.title);label.addEventListener('click',()=>{selectedId=source.datasourceId;window.dispatchEvent(new CustomEvent('air-sensor-select',{detail:{datasourceId:selectedId}}));highlight();});labels.append(label);items.push({source,label,point:new THREE.Vector3(x,12,z)});
  }
  if(regional&&samples.length){const cx=(modelBounds.min[0]+modelBounds.max[0])/2,cz=(modelBounds.min[2]+modelBounds.max[2])/2,width=modelBounds.max[0]-modelBounds.min[0]+radius*.7,depth=modelBounds.max[2]-modelBounds.min[2]+radius*.7;
   const u=uniforms(new THREE.Color(1,1,1));u.uRegional.value=1;u.uSize.value.set(width,halfHeight*2,depth);u.uSensorCount.value=samples.length; samples.forEach((s,i)=>{u.uSensors.value[i].set(s.x-cx,s.z-cz);u.uValues.value[i]=s.value;});
   const cloud=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.ShaderMaterial({uniforms:u,vertexShader,fragmentShader,transparent:true,depthWrite:false,depthTest:false,side:THREE.BackSide}));cloud.position.set(cx,centerY,cz);cloud.scale.set(width,halfHeight*2,depth);cloud.renderOrder=3;volumes.add(cloud);
   const points=[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2],[-width/2,-depth/2]].map(p=>new THREE.Vector3(cx+p[0],centerY-halfHeight,cz+p[1]));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineDashedMaterial({color:0xd9ff68,dashSize:18,gapSize:14,transparent:true,opacity:.4}));line.computeLineDistances();line.visible=$('show-cloud-boundaries').checked;annotations.add(line);boundaryObjects.length=0;boundaryObjects.push(line);
  }
  $('cloud-state').textContent=`${valid} valid input sensors · ${invalid} invalid/missing · ${outside} outside model. ${regional?'Regional IDW estimate':'Point observation clouds'}.${samples.length?' Input range: '+Math.min(...samples.map(s=>s.value)).toFixed(2)+'–'+Math.max(...samples.map(s=>s.value)).toFixed(2)+' '+config.unit+'.':''}`;
  const newest=samples.map(s=>s.time).filter(Boolean).sort().at(-1);$('cloud-observed-at').textContent='Field inputs: '+observationTime(newest)+' · Seattle';
  const padding=radius*.35;airFlow.setField({samples,scaleMin,scaleMax,centerY,halfHeight,bounds:{minX:modelBounds.min[0]-padding,maxX:modelBounds.max[0]+padding,minZ:modelBounds.min[2]-padding,maxZ:modelBounds.max[2]+padding},enabled:regional});
  highlight();volumes.visible=$('show-clouds').checked;
 }
 function highlight(){for(const item of items)item.label.classList.toggle('selected',item.source.datasourceId===selectedId);}
 function resize(){renderer.getDrawingBufferSize(resolution);target.setSize(resolution.x,resolution.y);}
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
 const settings=['cloud-mode','cloud-scale','cloud-pollutant','cloud-radius','cloud-altitude'];for(const id of settings)$(id).addEventListener('input',rebuild);
 $('cloud-opacity').addEventListener('input',()=>{for(const mesh of volumes.children)mesh.material.uniforms.uOpacity.value=+$('cloud-opacity').value/100;});
 for(const id of ['show-flow-particles','flow-speed'])$(id).addEventListener('input',()=>airFlow.settings({lines:false,particles:$('show-flow-particles').checked,speed:+$('flow-speed').value}));
 $('show-sensor-labels').addEventListener('change',()=>{labels.hidden=!$('show-sensor-labels').checked;});
 $('show-clouds').addEventListener('change',()=>{volumes.visible=$('show-clouds').checked;});$('show-cloud-boundaries').addEventListener('change',()=>{for(const item of boundaryObjects)item.visible=$('show-cloud-boundaries').checked;});
 $('focus-clouds').onclick=()=>{if(!items.length)return;const box=new THREE.Box3();for(const item of items)box.expandByPoint(item.point);if($('cloud-mode').value==='regional'&&modelBounds){box.expandByPoint(new THREE.Vector3(modelBounds.min[0],0,modelBounds.min[2]));box.expandByPoint(new THREE.Vector3(modelBounds.max[0],200,modelBounds.max[2]));}const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),span=Math.max(size.x/Math.max(camera.aspect,.3),size.z,600);controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(span*.2,span*.85,span*.75));controls.update();};
 const onSnapshot=event=>{snapshot=event.detail;sources=locatedSources(snapshot);rebuild();};window.addEventListener('air-sensors-updated',onSnapshot);
 window.addEventListener('air-sensor-selected',event=>{selectedId=event.detail.datasourceId;highlight();});
 if(window.southParkSensorSnapshot){snapshot=window.southParkSensorSnapshot;sources=locatedSources(snapshot);}
 Promise.all([fetch('./data/georegistration.json').then(r=>{if(!r.ok)throw Error('registration unavailable');return r.json();}),fetch('./data/original/verified-assets.json').then(r=>{if(!r.ok)throw Error('model bounds unavailable');return r.json();})]).then(([r,b])=>{registration=r;modelBounds=b.bounds;rebuild();}).catch(()=>{$('cloud-state').textContent='Registration unavailable. Cloud display is disabled.';});
 return {
  render(time){if(disposed)return;airFlow.update(time);const visible=group.visible;group.visible=false;renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);group.visible=visible;
   camera.getWorldPosition(worldCamera);for(const mesh of volumes.children){mesh.updateWorldMatrix(true,false);mesh.material.uniforms.uCamera.value.copy(worldCamera);mesh.worldToLocal(mesh.material.uniforms.uCamera.value);mesh.material.uniforms.uTime.value=time/1000;}
   camera.updateMatrixWorld();for(const item of items){vector.copy(item.point).project(camera);const shown=vector.z>=-1&&vector.z<=1&&Math.abs(vector.x)<1.1&&Math.abs(vector.y)<1.1;item.label.hidden=!shown;if(shown)item.label.style.transform=`translate(${(vector.x*.5+.5)*host.clientWidth}px,${(-vector.y*.5+.5)*host.clientHeight}px) translate(-50%,-100%)`;}
  },
  drawLabels(ctx,scale){
   ctx.save();ctx.scale(scale,scale);ctx.font='11px monospace';
   for(const item of items){if(item.label.hidden||labels.hidden)continue;const p=item.point.clone().project(camera),x=(p.x*.5+.5)*host.clientWidth,y=(-p.y*.5+.5)*host.clientHeight;const lines=[item.label.querySelector('strong').textContent],width=Math.max(...lines.map(t=>ctx.measureText(t).width))+22,height=24;ctx.fillStyle='#081318e8';ctx.fillRect(x-width/2,y-height,width,height);ctx.strokeStyle=item.label.style.getPropertyValue('--cloud-color');ctx.strokeRect(x-width/2,y-height,width,height);ctx.fillStyle='#f3f1e9';lines.forEach((line,i)=>ctx.fillText(line,x-width/2+10,y-height+17+i*19));}
   const x=host.clientWidth-265,y=host.clientHeight-103;ctx.fillStyle='#081318ed';ctx.fillRect(x,y,250,88);ctx.fillStyle='#f3f1e9';ctx.fillText(POLLUTANTS[$('cloud-pollutant').value].label+' · Interpolated estimate',x+10,y+18);ctx.fillText('Schematic flow, NOT measured wind',x+10,y+38);ctx.fillText($('cloud-min').textContent+' – '+$('cloud-max').textContent,x+10,y+58);ctx.fillText(observationTime(snapshot?.newestMeasurementAt),x+10,y+76);ctx.restore();
  },
  dispose(){disposed=true;resizeObserver.disconnect();window.removeEventListener('air-sensors-updated',onSnapshot);clear();airFlow.dispose();target.dispose();labels.remove();scene.remove(group);}
 };
}
