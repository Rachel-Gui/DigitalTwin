import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { GLTFExporter } from './vendor/GLTFExporter.js';
import { createSensorNavigation } from './navigation.js';
import { createAirClouds } from './clouds.js';
import { createReferenceExperience } from './reference-experience.js';
import { Sky } from './vendor/Sky.js';

const $=id=>document.getElementById(id),host=$('canvas');
const setStatus=text=>$('status').textContent=text;
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});}catch(error){setStatus('WebGL is unavailable. Enable hardware acceleration and reload.');throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.appendChild(renderer.domElement);
const scene=new THREE.Scene(),fogColor=new THREE.Color(0x9bb8c8);
const camera=new THREE.PerspectiveCamera(58,1,.05,6500);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.48;controls.minDistance=5;controls.maxDistance=4800;
const hemisphere=new THREE.HemisphereLight(0xbadcf1,0x48543a,.82),ambient=new THREE.AmbientLight(0xd8e4e8,.16);
scene.add(hemisphere,ambient);
const sun=new THREE.DirectionalLight(0xfff0d0,3.5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{near:1,far:3200,left:-1800,right:1800,top:1800,bottom:-1800});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.00025;sun.shadow.normalBias=.35;scene.add(sun,sun.target);
const sky=new Sky();sky.name='atmospheric-sky';sky.scale.setScalar(5000);sky.frustumCulled=false;const skyUniforms=sky.material.uniforms;
skyUniforms.turbidity.value=7.5;skyUniforms.rayleigh.value=1.7;skyUniforms.mieCoefficient.value=.006;skyUniforms.mieDirectionalG.value=.82;scene.add(sky);
const nightColor=new THREE.Color(0x050a12),dayFogColor=new THREE.Color(0xa9c5d3),dawnFogColor=new THREE.Color(0xc99b78),sunWarm=new THREE.Color(0xffae72),sunNoon=new THREE.Color(0xfff5dc);
const city=new THREE.Group();city.name='Original published South Park city model';scene.add(city);
const assets=new Map();let manifest,loaded=0;const cityBounds=new THREE.Box3();
function updateLight(){const hour=+$('hour').value;$('hour-value').textContent=String(hour).padStart(2,'0')+':00';
 const angle=((hour-6)/24)*Math.PI*2,rawAltitude=Math.sin(angle),altitude=Math.max(rawAltitude,-.22);
 sun.position.set(Math.cos(angle)*900,altitude*900,Math.sin(angle)*900*.65);skyUniforms.sunPosition.value.copy(sun.position).normalize();
 const daylight=THREE.MathUtils.smoothstep(rawAltitude,-.08,.28),noon=THREE.MathUtils.smoothstep(rawAltitude,.08,.9);
 sun.intensity=daylight*(1.2+Math.max(rawAltitude,0)*3.5);sun.color.lerpColors(sunWarm,sunNoon,noon);hemisphere.intensity=.18+daylight*.78;ambient.intensity=.08+daylight*.14;
 renderer.toneMappingExposure=.72+daylight*.45;skyUniforms.rayleigh.value=.35+daylight*1.55;
 fogColor.lerpColors(nightColor,dawnFogColor,THREE.MathUtils.smoothstep(rawAltitude,-.16,.04));fogColor.lerp(dayFogColor,THREE.MathUtils.smoothstep(rawAltitude,.02,.55));if(scene.fog)scene.fog.color.copy(fogColor);
}
function originalView(){if(!manifest)return;camera.position.set(...manifest.runtime.camera_position);controls.target.set(...manifest.runtime.camera_target);controls.update();activeView('reset');}
function activeView(id){for(const key of ['reset','aerial','top'])$(key).classList.toggle('active',id===key);}
function frame(top){if(cityBounds.isEmpty())return;const center=cityBounds.getCenter(new THREE.Vector3()),size=cityBounds.getSize(new THREE.Vector3());const distance=Math.max(size.z,size.x/camera.aspect)*1.1;controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(top?0:distance*.4,top?distance:distance*.7,top ? .001 : distance*.8));controls.update();activeView(top?'top':'aerial');}
function resize(){const width=host.clientWidth,height=host.clientHeight;camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();renderer.setSize(width,height);}
new ResizeObserver(resize).observe(host);resize();
const airClouds=createAirClouds({scene,camera,renderer,host,controls});
const reference=createReferenceExperience({scene,camera,renderer,controls,host,onHour:hour=>{$('hour').value=hour;updateLight();},onFrame:()=>frame(false)});
const navigation=createSensorNavigation({scene,camera,renderer,controls,host,onReset:originalView});
renderer.setAnimationLoop(time=>{if(!renderer.xr.isPresenting)controls.update();navigation.update(time);airClouds.render(time);reference.render(time);renderer.render(scene,camera);});
function save(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
$('hour').oninput=()=>{reference.detach();updateLight();};
for(const name of ['buildings','roads','ground'])$('show-'+name).onchange=event=>{const asset=assets.get('south_park_'+name);if(asset)asset.visible=event.target.checked;};
$('show-fog').onchange=event=>{if(!manifest)return;scene.fog=event.target.checked?new THREE.FogExp2(fogColor,manifest.runtime.fog_density*.72):null;};
$('reset').onclick=originalView;$('aerial').onclick=()=>frame(false);$('top').onclick=()=>frame(true);
$('screenshot').onclick=()=>{renderer.render(scene,camera);const image=document.createElement('canvas');image.width=renderer.domElement.width;image.height=renderer.domElement.height;const ctx=image.getContext('2d');ctx.drawImage(renderer.domElement,0,0);airClouds.drawLabels(ctx,image.width/host.clientWidth);image.toBlob(blob=>blob&&save(blob,'south-park-air-clouds.png'));};
function mobile(open){$('panel').classList.toggle('is-open',open);$('mobile-toggle').setAttribute('aria-expanded',String(open));}
$('mobile-toggle').onclick=()=>mobile(true);$('mobile-close').onclick=()=>mobile(false);
$('download-glb').disabled=true;
$('download-glb').onclick=async()=>{const button=$('download-glb');button.disabled=true;const prior=$('load-status').textContent;$('load-status').textContent='Exporting…';try{const data=await new GLTFExporter().parseAsync(city,{binary:true,onlyVisible:true});save(new Blob([data],{type:'model/gltf-binary'}),'south-park-original-city.glb');}catch(error){setStatus('Export failed: '+error.message);}finally{button.disabled=false;$('load-status').textContent=prior;}};
async function start(){const response=await fetch('./data/original/manifest.json');if(!response.ok)throw new Error('Model manifest unavailable');manifest=await response.json();
 scene.fog=new THREE.FogExp2(fogColor,manifest.runtime.fog_density*.72);controls.maxDistance=manifest.runtime.max_distance;originalView();updateLight();
 city.userData={source_reference:'https://decarb-city-twin-vr.ruichg.chatgpt.site/#south-park',source:manifest.source,coordinate_system:manifest.coordinate_system,runtime:manifest.runtime,geometry:'Unmodified published visual GLB assets',height_source:'Original Grasshopper Height field',building_count:1432};
 const chunks=manifest.chunks.filter(c=>c.role==='visual'&&c.status==='ready');const loader=new GLTFLoader();
 await Promise.all(chunks.map(async chunk=>{const filename=chunk.url.split('/').at(-1);const gltf=await loader.loadAsync('./data/original/'+filename);
  gltf.scene.name=chunk.id;gltf.scene.traverse(object=>{if(!object.isMesh)return;object.castShadow=chunk.id==='south_park_buildings';object.receiveShadow=true;});
  assets.set(chunk.id,gltf.scene);city.add(gltf.scene);cityBounds.expandByObject(gltf.scene);loaded++;$('load-status').textContent=`${loaded}/${chunks.length} ready`;
  if(loaded===chunks.length){navigation.setCity(city,cityBounds);reference.setReady(manifest);$('ready-dot').classList.add('active');$('geometry-status').textContent='Original geometry · Materials · Source heights';setStatus('');$('download-glb').disabled=false;}
 }));
}
start().catch(error=>{console.error(error);setStatus('Model unavailable: '+error.message);$('load-status').textContent='Load failed';});
