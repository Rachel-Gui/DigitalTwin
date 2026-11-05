import * as THREE from 'three';
import { AIR_QUALITY_DAYS, AIR_QUALITY_SOURCE, airRecordAt, dayForRecord, recordIndexFor, DEFAULT_AIR_RECORD_INDEX, SOUTH_PARK_SEEDS } from './reference/experienceData.js';
import { TOUR_CHAPTERS, chapterHour } from './reference/tourData.js';
import { createSouthParkParticles } from './reference/particles.js';

const $=id=>document.getElementById(id);
const bands=[['good','Good',0,9,0,50],['moderate','Moderate',9.1,35.4,51,100],['sensitive','Unhealthy for Sensitive Groups',35.5,55.4,101,150],['unhealthy','Unhealthy',55.5,125.4,151,200],['very-unhealthy','Very Unhealthy',125.5,225.4,201,300],['hazardous','Hazardous',225.5,325.4,301,500]];
export function dailyStats(index){
 const day=dayForRecord(index),records=Array.from({length:day.count},(_,i)=>airRecordAt(day.start+i)),values=records.map(r=>r.pm25_ug_m3);
 const average=values.reduce((a,b)=>a+b,0)/values.length,peak=Math.max(...values),complete=day.count===24&&records.every((r,i)=>Number(r.local_time.slice(11,13))===i);
 const concentration=Math.floor(Math.max(0,average)*10)/10;
 const band=bands.find(b=>concentration<=b[3])??bands.at(-1);
 const aqi=complete?Math.min(500,Math.round((band[5]-band[4])/(band[3]-band[2])*(concentration-band[2])+band[4])):null;
 return {day,records,values,average,peak,complete,band,aqi};
}

export function createReferenceExperience({scene,camera,renderer,controls,host,onHour,onFrame}){
 let mode='live',index=DEFAULT_AIR_RECORD_INDEX,playing=false,following=false,lastReplay=0,particles=null,ready=false,manifest=null;
 const chapter=TOUR_CHAPTERS.find(c=>c.sceneId==='south-park'),audio=$('tour-audio');
 let historicalPoints=null;
 const liveElements=[document.querySelector('.cloud-controls'),$('sensor-panel'),document.querySelector('.cloud-legend')];
 const lightControl=$('hour').closest('section');
 const liveChecks=['show-clouds','show-flow-particles','show-sensor-labels','show-cloud-boundaries'];
 const savedChecks=new Map(liveChecks.map(id=>[id,$(id).checked]));
 $('history-date').replaceChildren(...AIR_QUALITY_DAYS.map(day=>new Option(day.date,day.date)));
 $('tour-transcript').textContent=chapter.transcript;
 $('history-aqi-scale').innerHTML=bands.map(b=>`<span class="aqi-${b[0]}" title="${b[1]} · AQI ${b[4]}–${b[5]}"><i></i><small>${b[4]}–${b[5]}</small></span>`).join('');
 function update(){
  const r=airRecordAt(index),s=dailyStats(index),hour=Number(r.local_time.slice(11,13)),offset=index-s.day.start;
  $('history-date').value=s.day.date;$('history-time').max=s.day.count-1;$('history-time').value=offset;
  $('history-hour').textContent=`${String(hour).padStart(2,'0')}:00`;
  $('history-range').textContent=`${s.records[0].local_time.slice(11,16)}–${s.records.at(-1).local_time.slice(11,16)} · ${s.day.count} hours`;
  const progress=offset/Math.max(s.day.count-1,1);$('history-sun').style.left=`${progress*100}%`;$('history-sun').style.bottom=`${Math.sin(Math.PI*progress)*48+3}px`;
  $('history-day-label').textContent=s.day.date+' · '+new Intl.DateTimeFormat('en-US',{weekday:'long',timeZone:AIR_QUALITY_SOURCE.timezone}).format(new Date(s.day.date+'T12:00:00-08:00'));
  $('history-pm').textContent=r.pm25_ug_m3.toFixed(1);$('history-observed-at').textContent=r.local_time.replace('T',' ')+' · America/Los_Angeles';
  $('history-average').textContent=s.average.toFixed(1);$('history-average-note').textContent=`µg/m³ · ${s.complete?'24H':s.day.count+' AVAILABLE HOURS'}`;
  $('history-peak').textContent=s.peak.toFixed(1);$('history-aqi').textContent=s.aqi??'—';$('history-aqi-note').textContent=s.complete?'US EPA':'INCOMPLETE DAY';
  $('history-reference').textContent=s.complete?(s.average>35?'ABOVE REFERENCE':'BELOW REFERENCE'):'COMPARISON NOT AVAILABLE';
  $('history-dashboard').className=`air-dashboard aqi-${s.band[0]}${s.complete&&s.average>35?' is-above-reference':''}`;
  $('history-dashboard').setAttribute('aria-label',s.complete?`24-hour mean ${s.average.toFixed(1)} micrograms per cubic meter`:'Incomplete day; no 24-hour comparison');
  for(const el of $('history-aqi-scale').children)el.classList.toggle('is-current',s.complete&&el.classList.contains('aqi-'+s.band[0]));
  const max=Math.max(60,s.peak*1.12),x=i=>i/Math.max(s.values.length-1,1)*240,y=v=>92-v/max*80;
  $('history-chart').innerHTML=[ [9,'annual-reference','EPA ANNUAL · 9 µg/m³'],[35,'health-reference','EPA 24H · 35 µg/m³'] ].map(([v,c,label])=>`<g class="threshold ${c}"><line x1="0" y1="${y(v)}" x2="240" y2="${y(v)}"/><text x="238" y="${y(v)-3}" text-anchor="end">${label}</text></g>`).join('')+`<polyline points="${s.values.map((v,i)=>`${x(i)},${y(v)}`).join(' ')}"/><line class="current-hour-line" x1="${x(offset)}" x2="${x(offset)}" y1="10" y2="94"/><circle class="current-hour-point" cx="${x(offset)}" cy="${y(r.pm25_ug_m3)}" r="3.5"/>`;
  $('chart-first-hour').textContent=s.records[0].local_time.slice(11,16);$('chart-last-hour').textContent=s.records.at(-1).local_time.slice(11,16);
  $('history-last-update').textContent=r.local_time.replace('T',' ');$('history-wind').textContent=r.wind_speed_m_s?.toFixed(1)??'—';$('history-direction').textContent=r.wind_direction_deg?.toFixed(0)??'—';
  $('history-quality').textContent=r.quality_notes.includes('missing_wind')?'Wind observation missing. Modeled particle motion is paused.':r.quality_notes.includes('zero_wind_unverified')?'Source reports zero wind; not independently verified. Modeled particle motion is paused.':'Historical wind drives the reference particle model (10× speed).';
  if(mode==='historical'){onHour(hour);particles?.advance(r);}
 }
 function playback(value){playing=value;lastReplay=0;$('replay-state').textContent=value?'PLAYING':'PAUSED';$('history-play').textContent=value?'Ⅱ':'▶';$('history-play').setAttribute('aria-label',value?'Pause historical replay':'Play historical replay');}
 function detach(){following=false;$('tour-status').textContent='Guide detached · Resume Guide to synchronize date and sunlight.';}
 function sync(){if(!following)return;index=recordIndexFor('2025-01-29',chapterHour(chapter,audio.currentTime));update();}
 function setMode(next){
  if(mode==='live')for(const id of liveChecks)savedChecks.set(id,$(id).checked);
  mode=next;$('experience-mode').value=next;$('historical-controls').hidden=next!=='historical';
  for(const el of liveElements)el.hidden=next==='historical';lightControl.hidden=next==='historical';
  for(const id of liveChecks){$(id).checked=next==='live'&&savedChecks.get(id);$(id).dispatchEvent(new Event('change'));$(id).dispatchEvent(new Event('input'));}
  host.dataset.experienceMode=next;
  document.querySelector('.scene-caption>span').textContent=next==='historical'?'Historical PM2.5 + wind · modeled road-network particles':'Latest sensor observations · regional concentration estimate';
  if(next==='live'){playback(false);audio.pause();following=false;}
  update();
 }
 $('experience-mode').onchange=e=>setMode(e.target.value);
 $('history-date').onchange=e=>{detach();index=recordIndexFor(e.target.value);update();};
 $('history-time').oninput=e=>{detach();index=dayForRecord(index).start+Number(e.target.value);update();};
 $('history-play').onclick=()=>{detach();audio.pause();playback(!playing);};
 async function playAudio(){try{await audio.play();$('tour-play').textContent='Pause';$('tour-status').textContent=following?'Following South Park chapter · 2025-01-29':'Narration playing · guide detached';}catch(error){$('tour-status').textContent='Audio could not play: '+error.message;}}
 async function startTour(){playback(false);following=true;audio.currentTime=chapter.startTime;$('tour-controls').hidden=false;$('tour-start').hidden=true;onFrame();sync();await playAudio();}
 $('tour-start').onclick=startTour;$('tour-restart').onclick=startTour;
 $('tour-play').onclick=()=>{if(audio.paused)playAudio();else audio.pause();};
 $('tour-resume').onclick=()=>{following=true;playback(false);sync();$('tour-status').textContent='Following South Park chapter · 2025-01-29';};
 $('tour-seek').oninput=e=>{audio.currentTime=Number(e.target.value);sync();};
 audio.ontimeupdate=()=>{if(audio.currentTime<chapter.startTime)audio.currentTime=chapter.startTime;if(audio.currentTime>=chapter.endTime)audio.pause();$('tour-seek').value=Math.min(audio.currentTime,chapter.endTime);sync();};
 audio.onpause=()=>{$('tour-play').textContent='Play';};
 audio.onended=()=>{following=false;$('tour-status').textContent='South Park chapter complete';};
 audio.onerror=()=>{$('tour-status').textContent='Narration unavailable. The transcript remains available.';};
 setMode('live');
 // WebXR uses the same renderer and original manifest coordinates.
 renderer.xr.enabled=true;const rig=new THREE.Group();scene.add(rig);rig.add(camera);let session=null,savedCamera=null;
 async function checkVR(){
  if(!window.isSecureContext||!navigator.xr){$('enter-vr').textContent='VR unavailable';$('vr-status').textContent='Requires a WebXR-compatible browser and headset on localhost or HTTPS.';return;}
  try{const supported=await navigator.xr.isSessionSupported('immersive-vr');$('enter-vr').disabled=!supported||!ready;$('enter-vr').textContent=supported?'Enter VR':'VR not supported';$('vr-status').textContent=supported?'Connect your headset. Use thumbsticks to move and turn.':'This browser/device does not support immersive VR.';}catch(e){$('enter-vr').textContent='VR unavailable';$('vr-status').textContent=e.message;}
 }
 $('enter-vr').onclick=async()=>{
  if(session){await session.end();return;}
  try{savedCamera={position:camera.position.clone(),quaternion:camera.quaternion.clone(),target:controls.target.clone()};session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']});renderer.xr.setReferenceSpaceType('local-floor');rig.position.set(...manifest.runtime.xr_start);camera.position.set(0,0,0);controls.enabled=false;await renderer.xr.setSession(session);$('enter-vr').textContent='Exit VR';session.addEventListener('end',()=>{session=null;rig.position.set(0,0,0);rig.rotation.set(0,0,0);camera.position.copy(savedCamera.position);camera.quaternion.copy(savedCamera.quaternion);controls.target.copy(savedCamera.target);controls.enabled=true;controls.update();checkVR();},{once:true});}catch(e){if(session)await session.end().catch(()=>{});session=null;rig.position.set(0,0,0);rig.rotation.set(0,0,0);if(savedCamera){camera.position.copy(savedCamera.position);camera.quaternion.copy(savedCamera.quaternion);controls.target.copy(savedCamera.target);}controls.enabled=true;controls.update();$('vr-status').textContent='Unable to enter VR: '+e.message;}
 };
 checkVR();let lastTime=0;
 const direction=new THREE.Vector3(),right=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
 return {
  detach,
  async setReady(value){manifest=value;ready=true;checkVR();try{
   const response=await fetch('./reference/road-volume.json');if(!response.ok)throw new Error('Road boundary unavailable');const b=await response.json();
   particles=createSouthParkParticles(scene,host,{boundary:{polygonsXZ:b.polygons_xz,minY:b.min_y,maxY:b.max_y,toleranceM:4},seeds:SOUTH_PARK_SEEDS,windSpeedMultiplier:10,integrationDt:.8,motion:{simulationHz:8,substepsPerGrasshopperStep:20,sourceSpreadM:12,warmupSteps:24},cloudDisplay:{sizePx:8,opacity:.82}},crypto.getRandomValues(new Uint32Array(1))[0]);historicalPoints=scene.children.find(o=>o.userData.referenceHistoricalParticles);update();
  }catch(e){$('history-quality').textContent='Historical particles unavailable: '+e.message;console.error(e);}},
  render(time){
   if(mode==='historical'){
    if(playing&&!document.hidden){if(!lastReplay)lastReplay=time;if(time-lastReplay>=1800){lastReplay=time;index=(index+1)%AIR_QUALITY_SOURCE.recordCount;update();}}
    const r=airRecordAt(index);particles?.render(time,r.wind_speed_m_s>0);
   }
   // Factory points stay out of the live sensor view.
   if(historicalPoints)historicalPoints.visible=mode==='historical';
   const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;
   if(session){camera.getWorldDirection(direction);direction.y=0;direction.normalize();right.crossVectors(direction,up).normalize();for(const source of session.inputSources){const axes=source.gamepad?.axes;if(!axes?.length)continue;const x=axes.at(-2)??0,y=axes.at(-1)??0;if(source.handedness==='right'){if(Math.abs(x)>.15)rig.rotation.y-=x*dt;}else{if(Math.abs(y)>.15)rig.position.addScaledVector(direction,-y*dt*70);if(Math.abs(x)>.15)rig.position.addScaledVector(right,x*dt*70);}}}
  }
 };
}
