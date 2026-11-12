import * as THREE from 'three';

const status = document.getElementById('status');
let renderer, observer, frame, dead = false, visible = true, dirty = true;
let lastFrame = 0;
const frameInterval = 1000 / 30;
const projected = new THREE.Vector3();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const playing = !reduced.matches;
let elapsed = 0;
const target = new THREE.Vector3();
const baseTarget = new THREE.Vector3();
let orbitRadius, orbitAngle, orbitHeight;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#082d32');
scene.fog = new THREE.FogExp2('#16434a', 0.00019);
const camera = new THREE.PerspectiveCamera(39, innerWidth / innerHeight, 10, 15000);
const origin = [-122.341, 47.611];
const point = ([lon,lat]) => [(lon-origin[0])*75040, -(lat-origin[1])*111195];
const location = ([lon,lat], height = 0) => {const [x,z] = point([lon,lat]);return new THREE.Vector3(x,height,z);};
// Bounded cinematic orbit keeps the city framed behind the copy throughout the loop.
const moveCamera = () => {
 const phase = elapsed * .035;
 const angle = orbitAngle + Math.sin(phase) * .22;
 const radius = orbitRadius * (1 - .025 * Math.sin(phase * 2));
 target.copy(baseTarget);
 target.x += Math.sin(phase * 2) * 28;
 target.z += Math.sin(phase) * 45;
 camera.position.set(target.x + Math.sin(angle) * radius, orbitHeight + Math.sin(phase * 2) * 24, target.z + Math.cos(angle) * radius);
 camera.lookAt(target);
};
const home = () => {
 const mobile = innerWidth < 700;
 baseTarget.set(mobile ? 0 : -380, 70, mobile ? -100 : -70);
 const dx = (mobile ? -1900 : -1200) - baseTarget.x;
 const dz = (mobile ? 2400 : 1250) - baseTarget.z;
 const zoom = mobile ? .82 : .78;
 orbitRadius = Math.hypot(dx,dz) * zoom;
 orbitAngle = Math.atan2(dx,dz);
 orbitHeight = (mobile ? 2050 : 1000) * zoom;
 moveCamera();dirty=true;
};
const ambient = new THREE.HemisphereLight('#d9fff0','#0b333e',2.2);scene.add(ambient);
const sun = new THREE.DirectionalLight('#e2fff0',3.3); sun.position.set(-1200,2200,900);scene.add(sun);
const fill = new THREE.DirectionalLight('#539a9d',1.2);fill.position.set(800,500,-1000);scene.add(fill);
let mode = 'heat';
const uniforms = { uMode:{value:0} };
const groundMaterial = new THREE.ShaderMaterial({uniforms,vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 p;uniform float uMode;
float spot(vec2 q,vec2 c,float s){return exp(-dot(q-c,q-c)/s);}
void main(){vec2 q=p.xz;float h=.12+.75*spot(q,vec2(170.,320.),150000.)+.65*spot(q,vec2(-140.,-270.),90000.)+.68*spot(q,vec2(520.,-650.),125000.)+.65*spot(q,vec2(-430.,830.),85000.);h+=.1*sin(q.x*.009)*cos(q.y*.011);h=clamp(h,0.,1.);
vec3 cold=vec3(.14,.25,.34);vec3 mid=vec3(.50,.32,.52);vec3 hot=vec3(1.,.72,.40);vec3 color=mix(cold,mid,smoothstep(.05,.6,h));color=mix(color,hot,smoothstep(.48,.95,h));
if(uMode>0.5&&uMode<1.5)color=mix(vec3(.07,.25,.29),vec3(.80,.79,.38),h);if(uMode>1.5)color=mix(vec3(.06,.25,.27),vec3(.25,.65,.55),h);
vec2 grid=abs(fract(q/7.)-.5);float line=step(.46,max(grid.x,grid.y));color*=1.-.19*line;gl_FragColor=vec4(color,1.);}`});
function addLand(){
 // Simplified Elliott Bay shoreline; GIS footprints and roads retain their actual coordinates.
 const coast=[[-122.36,47.633],[-122.36,47.62],[-122.355,47.616],[-122.3518,47.612],[-122.3468,47.6075],[-122.342,47.603],[-122.339,47.597],[-122.339,47.586],[-122.315,47.586],[-122.315,47.635]];
 const shape=new THREE.Shape(coast.map(c=>{const [x,z]=point(c);return new THREE.Vector2(x,-z)}));
 const g=new THREE.ShapeGeometry(shape);g.rotateX(-Math.PI/2);const land=new THREE.Mesh(g,groundMaterial);land.position.y=.6;scene.add(land);
 const water=new THREE.Mesh(new THREE.PlaneGeometry(15000,15000),new THREE.MeshStandardMaterial({color:'#0a3941',roughness:.35,metalness:.3}));water.rotation.x=-Math.PI/2;water.position.y=-3;scene.add(water);
 const verts=[];for(let i=0;i<85;i++){const z=-3500+i*85;verts.push(-3300,-1,z,-900,-1,z+430)}
 const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));scene.add(new THREE.LineSegments(wg,new THREE.LineBasicMaterial({color:'#3e7477',transparent:true,opacity:.12})));
}
function addNeedle(){
 const group=new THREE.Group();group.position.copy(location([-122.3493,47.6205]));
 const mat=new THREE.MeshStandardMaterial({color:'#a2d7c3',roughness:.8});
 const part=(g,y)=>{const m=new THREE.Mesh(g,mat);m.position.y=y;group.add(m);return m;};
 for(let i=0;i<3;i++){const angle=i*Math.PI*2/3;const leg=part(new THREE.CylinderGeometry(2.4,4,135,6),70);leg.position.x=Math.cos(angle)*8;leg.position.z=Math.sin(angle)*8;}
 part(new THREE.CylinderGeometry(15,9,9,32),140);part(new THREE.CylinderGeometry(22,16,6,40),148);part(new THREE.CylinderGeometry(11,22,8,40),155);part(new THREE.ConeGeometry(14,6,40),162);part(new THREE.CylinderGeometry(.7,1.3,19,8),174);scene.add(group);
}
const labels=[['needle',[-122.3493,47.6205],208],['market',[-122.3425,47.6095],45],['columbia',[-122.3305,47.6045],320]].map(([id,c,h])=>({el:document.getElementById(id),point:location(c,h)}));
function receive(e){
 if(e.origin!==locationOrigin||e.source!==parent)return;
 const d=e.data;if(d?.type!=='seattle-hero-control')return;
 if(d.action==='visibility'){visible=d.value;dirty=true;}

}
const locationOrigin=window.location.origin;
try{
 renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'default'});
 const fitRenderer=()=>{renderer.setPixelRatio(Math.min(devicePixelRatio,1.25,1600/innerWidth,1000/innerHeight));renderer.setSize(innerWidth,innerHeight);dirty=true;};fitRenderer();renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 document.body.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.style.pointerEvents='none';
 home();
 const [layout, buffer, data] = await Promise.all([
  fetch('/data/seattle/buildings-layout.json').then(r=>{if(!r.ok)throw new Error('City layout unavailable');return r.json()}),
  fetch('/data/seattle/buildings.bin').then(r=>{if(!r.ok)throw new Error('City mesh unavailable');return r.arrayBuffer()}),
  fetch('/data/seattle/roads.json').then(r=>{if(!r.ok)throw new Error('City data unavailable');return r.json()}),
 ]);
 const merged=new THREE.BufferGeometry();
 const types={Float32Array,Int8Array,Uint8Array};
 for(const name of ['position','normal','color']){const a=layout[name];merged.setAttribute(name,new THREE.BufferAttribute(new types[a.type](buffer,a.offset,a.length),a.itemSize,a.normalized));}
 merged.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer,layout.index.offset,layout.index.length),1));
 const buildings=new THREE.Mesh(merged,new THREE.MeshLambertMaterial({vertexColors:true}));scene.add(buildings);
 addLand();addNeedle();
 const rv=[];for(const road of data.roads){for(let i=1;i<road.length;i++){const a=point(road[i-1]),b=point(road[i]);rv.push(a[0],1.3,a[1],b[0],1.3,b[1]);}}
 const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rv,3));scene.add(new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:'#c9a3c8',transparent:true,opacity:.27})));
 status.remove();parent.postMessage({type:'seattle-hero-ready'},locationOrigin);
 const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();home();fitRenderer()};
 window.addEventListener('resize',resize);window.addEventListener('message',receive);
 observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting});observer.observe(renderer.domElement);
 document.addEventListener('visibilitychange',()=>{visible=!document.hidden});
 const animate=(time=0)=>{
  if(dead)return;
  frame=requestAnimationFrame(animate);
  if(!visible||document.hidden||time-lastFrame<frameInterval)return;
  const delta=Math.min((time-lastFrame)/1000,.1);lastFrame=time;
  if(playing){elapsed+=delta;moveCamera();}
  if(!dirty&&!playing)return;
  renderer.render(scene,camera);dirty=false;
  for(const label of labels){
   const p=projected.copy(label.point).project(camera);
   label.el.style.transform=`translate3d(${(p.x*.5+.5)*innerWidth}px,${(-p.y*.5+.5)*innerHeight}px,0) translate(-50%,-100%)`;
   label.el.style.opacity=p.z<1&&Math.abs(p.x)<.94&&Math.abs(p.y)<.88?'1':'0';
  }
 };animate();
 window.addEventListener('pagehide',()=>{dead=true;cancelAnimationFrame(frame);observer.disconnect();scene.traverse(o=>{o.geometry?.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m?.dispose())});renderer.dispose();window.removeEventListener('resize',resize);window.removeEventListener('message',receive)},{once:true});
}catch(error){status.textContent='3D view unavailable on this device';parent.postMessage({type:'seattle-hero-error'},locationOrigin);console.error(error);}
