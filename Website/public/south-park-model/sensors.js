import { metricState } from './cloud-data.js';
import { locatedSources, sensorName, formatValue, observationTime } from './sensor-data.js';
const $=id=>document.getElementById(id);
let snapshot=null,selectedId=null,inFlight=false,requestController;
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function select(source){selectedId=source.datasourceId;window.dispatchEvent(new CustomEvent('air-sensor-selected',{detail:{datasourceId:selectedId}}));renderDetail(source);for(const button of $('sensor-list').children)button.setAttribute('aria-pressed',String(button.dataset.id===selectedId));}
function renderDetail(source){
  $('sensor-detail').hidden=!source;if(!source)return;
  $('sensor-name').textContent=sensorName(source);$('sensor-metrics').replaceChildren();
  for(const [key,label,unit] of [['pm25','PM₂.₅','µg/m³'],['pm10','PM₁₀','µg/m³'],['no2','NO₂','ppb']]){
    const metric=source.metrics?.[key];const row=element('div','sensor-metric');const line=element('div','sensor-metric-line');line.append(element('span','',label),element('strong','',formatValue(metric?.value)),element('small','',unit));row.append(line,element('span','sensor-measurement-time',observationTime(metric?.time)));
    if(metric?.qcAssessment)row.append(element('span','sensor-quality','QC: '+(typeof metric.qcAssessment==='object'?JSON.stringify(metric.qcAssessment):metric.qcAssessment)));
    if(metric?.qcFlags?.length)row.append(element('span','sensor-quality','Flags: '+metric.qcFlags.join(', ')));
    $('sensor-metrics').append(row);
  }
  $('sensor-location').textContent=`${source.latitude.toFixed(5)}° N / ${Math.abs(source.longitude).toFixed(5)}° W · Latest: ${observationTime(source.latestAt)}`;
}
function render(){
 const sources=locatedSources(snapshot);$('sensor-list').replaceChildren();$('sensor-summary').hidden=false;
 const qcValues=(snapshot.sources||[]).map(s=>metricState(s.metrics?.pm25)).filter(s=>s.valid&&s.reason==='QC valid').map(s=>s.value);$('network-pm25').textContent=formatValue(qcValues.length?qcValues.reduce((a,b)=>a+b,0)/qcValues.length:null);$('located-count').textContent=String(sources.length);$('registered-count').textContent=`${snapshot.summary?.monitoringLocations ?? snapshot.sources.length} registered`;
 for(const source of sources){const button=element('button','sensor-item');button.type='button';button.dataset.id=source.datasourceId;button.setAttribute('aria-pressed','false');button.append(element('span','sensor-item-name',sensorName(source)));const reading=element('span','sensor-item-reading',formatValue(source.metrics?.pm25?.value));reading.append(element('small','',' µg/m³'));const state=metricState(source.metrics?.pm25);if(!state.valid){button.classList.add('qc-invalid');button.title=state.reason;button.firstChild.textContent+=' · '+state.reason;}button.append(reading);button.addEventListener('click',()=>select(source));$('sensor-list').append(button);}
 const selected=sources.find(source=>source.datasourceId===selectedId)||sources[0];if(selected)select(selected);else{selectedId=null;renderDetail(null);$('sensor-list').append(element('p','sensor-meta','No monitoring locations are available.'));}
 $('sensor-updated').textContent=`Newest observation: ${observationTime(snapshot.newestMeasurementAt)} · API snapshot: ${observationTime(snapshot.fetchedAt)}`;
}
async function load(){
 if(inFlight)return;inFlight=true;$('refresh-sensors').disabled=true;$('refresh-sensors').textContent='Refreshing…';$('sensor-panel')?.setAttribute('aria-busy','true');$('sensor-status').textContent=snapshot?'Refreshing observations…':'Loading sensor observations…';$('sensor-status').classList.remove('is-error');
 requestController=new AbortController();const timeout=setTimeout(()=>requestController.abort(),25000);
 try{const response=await fetch('/api/clarity',{cache:'no-store',signal:requestController.signal});const payload=await response.json();if(!response.ok)throw new Error(response.status===503?'Sensor API is not configured.':'Sensor API is unavailable. Please try again.');if(!Array.isArray(payload.sources))throw new Error('Unexpected sensor API response.');snapshot=payload;window.southParkSensorSnapshot=payload;window.dispatchEvent(new CustomEvent('air-sensors-updated',{detail:payload}));render();$('sensor-status').textContent=locatedSources(snapshot).length?'Latest available measurements · Seattle time':'No sensor locations returned.';}
 catch(error){$('sensor-status').classList.add('is-error');$('sensor-status').textContent=(error.name==='AbortError'?'Sensor request timed out.':error.message)+(snapshot?' Showing previously loaded readings.':' Use Refresh to retry.');}
 finally{clearTimeout(timeout);inFlight=false;$('refresh-sensors').disabled=false;$('refresh-sensors').textContent='Refresh ↻';$('sensor-panel')?.setAttribute('aria-busy','false');}
}
window.addEventListener('air-sensor-select',event=>{const source=locatedSources(snapshot).find(s=>s.datasourceId===event.detail.datasourceId);if(source){select(source);$('sensor-detail').scrollIntoView({block:'nearest',behavior:'smooth'});}});
$('refresh-sensors').addEventListener('click',load);
const interval=setInterval(()=>{if(!document.hidden)load();},5*60*1000);
window.addEventListener('pagehide',()=>{clearInterval(interval);requestController?.abort();},{once:true});
load();
