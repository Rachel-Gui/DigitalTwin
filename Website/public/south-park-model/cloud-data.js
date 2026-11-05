export const POLLUTANTS={pm25:{label:'PM₂.₅',unit:'µg/m³',max:50},pm10:{label:'PM₁₀',unit:'µg/m³',max:100},no2:{label:'NO₂',unit:'ppb',max:100}};
export function metricState(metric){
 if(metric?.value===null||metric?.value===undefined||metric?.value===''||!Number.isFinite(Number(metric?.value)))return {valid:false,reason:'No data',value:null};
 const value=Number(metric.value),qc=String(metric.qcAssessment||'').toLowerCase();
 if(qc==='invalid'||qc==='failed'||qc==='suspect'||qc==='questionable'||value<0)return {valid:false,reason:'QC '+(qc||'invalid'),value};
 if((metric.qcFlags||[]).some(flag=>String(flag).startsWith('QC.I.')))return {valid:false,reason:'QC invalid',value};
 return {valid:true,reason:qc==='valid'?'QC valid':'QC unverified',value};
}
export function geoToModel(latitude,longitude,registration){
 if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>=85)return null;
 const mx=6378137*longitude*Math.PI/180-registration.origin_mercator[0];
 const my=6378137*Math.log(Math.tan(Math.PI/4+latitude*Math.PI/360))-registration.origin_mercator[1];
 const c=registration.coefficients;
 return [mx*c[0][0]+my*c[1][0]+c[2][0],mx*c[0][1]+my*c[1][1]+c[2][1]];
}
export function inModelBounds(xz,bounds){return xz&&xz[0]>=bounds.min[0]&&xz[0]<=bounds.max[0]&&xz[1]>=bounds.min[2]&&xz[1]<=bounds.max[2];}
export function cloudColor(value,max){
 const stops=[[.13,.65,.96],[.18,.88,.72],[.95,.88,.25],[1,.42,.15],[.87,.2,.61]];
 const v=Math.min(1,Math.max(0,value/max))*4,i=Math.min(3,Math.floor(v)),t=v-i;
 return stops[i].map((a,j)=>a+(stops[i+1][j]-a)*t);
}
export function interpolateConcentration(point,samples){
 if(!samples.length)return null;
 let sum=0,weights=0;for(const s of samples){const distance=Math.hypot(point[0]-s.x,point[1]-s.z);if(distance<.001)return s.value;const w=1/Math.max(20,distance)**2;sum+=w*s.value;weights+=w;}return sum/weights;
}
export function concentrationRange(samples,config,local=true){
 if(!local||!samples.length)return [0,config.max];const values=samples.map(s=>s.value);const low=Math.floor(Math.min(...values)*2)/2;return [low,Math.max(low+1,Math.ceil(Math.max(...values)*2)/2)];
}
