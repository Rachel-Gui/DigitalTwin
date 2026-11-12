import * as THREE from 'three';
import { GLTFLoader } from '/south-park-model/vendor/GLTFLoader.js';
const button=document.getElementById('record'),status=document.getElementById('status');
const width=1280,height=720,duration=22;
const scene=new THREE.Scene();scene.background=new THREE.Color('#9fbac8');scene.fog=new THREE.FogExp2('#9fbac8',.0015);
const camera=new THREE.PerspectiveCamera(64,width/height,.08,1200);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(width,height);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
document.body.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight('#c9e7ff','#576944',1.6));scene.add(new THREE.AmbientLight('#d8e4e8',.35));
const sun=new THREE.DirectionalLight('#fff0d0',3.3);sun.position.set(-65,90,-70);scene.add(sun);
const loader=new GLTFLoader();
try{
 await Promise.all(['school_core','school_buildings','school_context','school_plants','school_vehicles'].map(async name=>{
  const gltf=await loader.loadAsync(`./assets/${name}.glb`);
  gltf.scene.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){
   if(/glass/i.test(m.name)){m.transparent=true;m.depthWrite=false;}
   if(/Concrete trim|Ground asphalt/i.test(m.name)){m.polygonOffset=true;m.polygonOffsetFactor=-1;m.polygonOffsetUnits=-1;}
   if(/Ground grass/i.test(m.name)){m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;}
   if(/Ground .*paving/i.test(m.name)){m.polygonOffset=true;m.polygonOffsetFactor=-3;m.polygonOffsetUnits=-3;}
  }});scene.add(gltf.scene);
 }));
 // The School's historical particle symbols, staged only for this presentation clip.
 const count=1200,particles=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:'#353535'}),count);
 const matrix=new THREE.Object3D();const seeds=[];let seed=317;
 const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<count;i++)seeds.push({x:-85+random()*170,y:.3+random()*22,z:-80+random()*145,r:.035+random()*.11,phase:random()*6.28});scene.add(particles);
 // Camera stays at pedestrian eye height outside the north/front facade.
 const path=new THREE.CatmullRomCurve3([new THREE.Vector3(-49,1.15,-43),new THREE.Vector3(-40,1.15,-41),new THREE.Vector3(-29,1.15,-40),new THREE.Vector3(-18,1.15,-39),new THREE.Vector3(-7,1.15,-39)]);
 const gaze=new THREE.CatmullRomCurve3([new THREE.Vector3(-27,5,-20),new THREE.Vector3(-16,5.5,-20),new THREE.Vector3(-8,5,-22),new THREE.Vector3(1,4,-24),new THREE.Vector3(10,4,-25)]);
 function render(t){const u=Math.min(t/duration,1);camera.position.copy(path.getPointAt(u));camera.position.y+=Math.sin(t*6)*.012;camera.lookAt(gaze.getPointAt(u));
  for(let i=0;i<count;i++){const p=seeds[i];matrix.position.set(p.x+Math.sin(t*.23+p.phase)*1.3,p.y+Math.sin(t*.35+p.phase)*.25,p.z+Math.cos(t*.19+p.phase));matrix.scale.setScalar(p.r);matrix.updateMatrix();particles.setMatrixAt(i,matrix.matrix);}particles.instanceMatrix.needsUpdate=true;renderer.render(scene,camera);
 }
 render(0);status.textContent='School ready · 22-second first-person walkthrough';button.disabled=false;
 button.addEventListener('click',()=>{
  button.disabled=true;const stream=renderer.domElement.captureStream(24),chunks=[];
  const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
  const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6500000});
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:'video/webm'}),a=document.getElementById('download');a.href=URL.createObjectURL(blob);a.download='concord-school-walkthrough.webm';a.hidden=false;a.textContent='Download School walkthrough';a.click();status.textContent='Recording complete';button.disabled=false;};
  recorder.start();const start=performance.now();let previous=0;
  const tick=now=>{const t=(now-start)/1000;if(t-previous>=1/24){render(Math.min(t,duration));previous=t;status.textContent=`Recording School VR ${Math.min(duration,Math.floor(t))} / ${duration}s`;}
   if(t<duration)requestAnimationFrame(tick);else recorder.stop();};requestAnimationFrame(tick);
 });
 if(new URLSearchParams(location.search).has('record'))button.click();
}catch(e){status.textContent=`Capture failed: ${e.message}`;console.error(e)}
