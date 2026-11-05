import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const url=pathToFileURL(root).href;
const {dailyStats,createReferenceExperience}=await import(url+'reference-experience.js');
const {AIR_QUALITY_DAYS,AIR_QUALITY_SOURCE,airRecordAt,recordIndexFor}=await import(url+'reference/experienceData.js');
const THREE=await import(url+'vendor/three.module.js');
assert.equal(AIR_QUALITY_DAYS.reduce((n,d)=>n+d.count,0),7791);
let complete=0,partial=0;
for(const d of AIR_QUALITY_DAYS){const s=dailyStats(d.start);assert.ok(Number.isFinite(s.average));assert.ok(Number.isFinite(s.peak));if(s.complete){complete++;assert.ok(s.aqi>=0&&s.aqi<=500);}else {partial++;assert.equal(s.aqi,null);}}
assert.ok(complete>0&&partial>0);
const html=fs.readFileSync(root+'index.html','utf8');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'No duplicate IDs');
const controller=fs.readFileSync(root+'reference-experience.js','utf8');for(const m of controller.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(m[1]),'Missing DOM target '+m[1]);
class Element{
 constructor(){this.hidden=false;this.checked=true;this.value='';this.dataset={};this.style={};this.children=[];this.attrs={};this.events=[];this.paused=true;this.currentTime=0;this.classList={toggle(){},contains(){return false;}};}
 replaceChildren(...children){this.children=children;}
 set innerHTML(v){this.html=v;if(v.includes('aqi-'))this.children=Array.from({length:6},()=>new Element());}
 get innerHTML(){return this.html;}
 setAttribute(k,v){this.attrs[k]=v;}
 dispatchEvent(event){this.events.push(event.type);if(event.type==='change')this.onchange?.({target:this});if(event.type==='input')this.oninput?.({target:this});}
 closest(){return light;}
 async play(){this.paused=false;}
 pause(){this.paused=true;this.onpause?.();}
}
const elements=new Map(ids.map(id=>[id,new Element()])),light=new Element(),cloudControls=new Element(),legend=new Element(),caption=new Element();
globalThis.document={hidden:false,getElementById:id=>elements.get(id),querySelector:s=>({'.cloud-controls':cloudControls,'.cloud-legend':legend,'.scene-caption>span':caption}[s]),createElement:()=>({width:0,height:0,getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}})})};
globalThis.window={isSecureContext:true};globalThis.Option=class {constructor(text,value){this.text=text;this.value=value;}};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),host=elements.get('canvas'),renderer={xr:{enabled:false}},controls={target:new THREE.Vector3()};
let hour;
const experience=createReferenceExperience({scene,camera,renderer,controls,host,onHour:value=>hour=value,onFrame(){}});
assert.equal(host.dataset.experienceMode,'live');assert.equal(cloudControls.hidden,false);assert.equal(elements.get('show-clouds').checked,true);assert.equal(elements.get('historical-controls').hidden,true);
elements.get('experience-mode').value='historical';elements.get('experience-mode').onchange({target:elements.get('experience-mode')});
assert.equal(host.dataset.experienceMode,'historical');assert.equal(elements.get('historical-controls').hidden,false);assert.equal(cloudControls.hidden,true);assert.equal(elements.get('show-clouds').checked,false);assert.equal(hour,9);assert.ok(elements.get('show-flow-particles').events.includes('input'));assert.equal(elements.get('show-cloud-boundaries').checked,false);
const nativeFetch=globalThis.fetch;
globalThis.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(root+'reference/road-volume.json'))});
await experience.setReady({runtime:{xr_start:[0,520,900]}});
experience.render(1000);const points=scene.children.find(o=>o.userData.referenceHistoricalParticles);assert.ok(points);assert.ok(points.geometry.drawRange.count>=200);assert.equal(points.visible,true);
for(const v of points.geometry.attributes.position.array)assert.ok(Number.isFinite(v));
elements.get('history-date').value=AIR_QUALITY_DAYS[0].date;elements.get('history-date').onchange({target:elements.get('history-date')});assert.equal(elements.get('history-aqi').textContent,'—');
elements.get('experience-mode').value='live';elements.get('experience-mode').onchange({target:elements.get('experience-mode')});experience.render(1100);assert.equal(points.visible,false);assert.equal(elements.get('show-clouds').checked,true);assert.equal(cloudControls.hidden,false);assert.equal(elements.get('historical-controls').hidden,true);
elements.get('experience-mode').value='historical';elements.get('experience-mode').onchange({target:elements.get('experience-mode')});experience.render(1200);assert.equal(points.visible,true);
elements.get('history-play').onclick();experience.render(1300);experience.render(3200);assert.equal(elements.get('history-hour').textContent,'10:00');
await elements.get('tour-start').onclick();assert.equal(elements.get('tour-audio').currentTime,280.5);assert.equal(elements.get('history-date').value,'2025-01-29');assert.equal(elements.get('history-hour').textContent,'00:00');assert.equal(elements.get('replay-state').textContent,'PAUSED');
elements.get('tour-audio').currentTime=343.326;elements.get('tour-audio').ontimeupdate();assert.equal(elements.get('history-hour').textContent,'12:00');
elements.get('history-time').value=5;elements.get('history-time').oninput({target:elements.get('history-time')});elements.get('tour-audio').currentTime=350;elements.get('tour-audio').ontimeupdate();assert.equal(elements.get('history-hour').textContent,'05:00');
elements.get('tour-resume').onclick();assert.notEqual(elements.get('history-hour').textContent,'05:00');
console.log(`PASS: ${AIR_QUALITY_SOURCE.recordCount} historical records; ${complete} full / ${partial} partial days; DOM IDs; particle initialization/finite geometry; live/history isolation; playback; chapter audio seek/detach/resume; unsupported VR fallback.`);
globalThis.fetch=nativeFetch;
