import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n";
import { capabilities } from "./content";
import { figures } from "../../data/projectContent";
import clarity from "../../assets/air-quality/clarity-screenshot.png";
import scene from "../../assets/home/south-park-energy-workspace.png";
import vr from "../../assets/vr/concord-vr-hero.png";
import studyArea from "../../assets/south-park-study-area-map.png";
import single from "../../assets/energy/single-family-high-resolution.png";
import duplex from "../../assets/energy/duplex-high-resolution.png";
import quadplex from "../../assets/energy/quadplex-high-resolution.png";
import apartment from "../../assets/energy/ten-unit-apartment-high-resolution.png";
import ModelingBridge from "./ModelingBridge";
import "./capability-stories.css";

const copy={
 en:{scope:"Research scope",preview:"Project preview",source:"DecarbCityTwin project materials",archetype:"Select a residential archetype",workflow:"Research workflow",observed:"Observed",modeled:"Modeled",web:"Digital Twin",vr:"VR experience",static:"Static project record",methods:"EnergyPlus  machine learning  evaluation",paper:"Abbasabadi et al. · Architecture 2026, 6, 84",question:"Explore by research question",energyQuestion:"Building energy & retrofit",airQuestion:"Neighborhood air quality",vrQuestion:"Immersive exploration",open:"Open application",concentration:"Annual-average PM2.5 prediction · µg/m³",sensors:"Clarity monitoring interface · Sensor observations",map:"South Park Digital Twin · Modeled baseline building energy use with EUI legend",immersive:"Concord School · Historical PM2.5 particle visualization",area:"South Park study area · Seattle",building:"Building data",simulation:"EnergyPlus",model:"ML models",evaluation:"Evaluation"},
 es:{scope:"Alcance de investigación",preview:"Vista previa del proyecto",source:"Materiales del proyecto DecarbCityTwin",archetype:"Selecciona un arquetipo residencial",workflow:"Flujo de investigación",observed:"Observado",modeled:"Modelado",web:"Gemelo digital",vr:"Experiencia VR",static:"Registro estático del proyecto",methods:"EnergyPlus  aprendizaje automático  evaluación",paper:"Abbasabadi et al. · Architecture 2026, 6, 84",question:"Explorar por pregunta de investigación",energyQuestion:"Energía y rehabilitación",airQuestion:"Calidad del aire del barrio",vrQuestion:"Exploración inmersiva",open:"Abrir aplicación",concentration:"Predicción del promedio anual de PM2.5 · µg/m³",sensors:"Interfaz Clarity · Observaciones de sensores",map:"Gemelo digital de South Park · Consumo energético de referencia modelado con leyenda EUI",immersive:"Concord School · Visualización histórica de partículas PM2.5",area:"Área de estudio de South Park · Seattle",building:"Datos de edificios",simulation:"EnergyPlus",model:"Modelos ML",evaluation:"Evaluación"}
};
const archetypes=[{id:"single-family",image:single,en:"Single family",es:"Unifamiliar"},{id:"duplex",image:duplex,en:"Duplex",es:"Dúplex"},{id:"quadplex",image:quadplex,en:"Quadplex",es:"Cuádruplex"},{id:"ten-unit-apartment",image:apartment,en:"10-unit apartment",es:"Apartamento de 10 unidades"}];

export default function CapabilityStories(){
 const {language}=useLanguage();
 const locale=language==="es"?"es":"en";
 const root=useRef(null);
 useEffect(()=>{
   if(!root.current||!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   const rows=[...root.current.querySelectorAll('.cap-story')];
   const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.dataset.visible='true';observer.unobserve(entry.target)}}),{threshold:.12});
   rows.forEach(row=>{row.dataset.reveal='true';observer.observe(row)});
   return()=>{observer.disconnect();rows.forEach(row=>{delete row.dataset.reveal})};
 },[]);
 return <section className="cap-stories" id="core-platform-capabilities" aria-label={locale==="es"?"Capacidades de la plataforma":"Platform capabilities"} ref={root}>
   <div className="cap-story-list">{capabilities.map((item,i)=>{return <article className={`cap-story cap-story-${item.id}`} key={item.id} id={`capability-${item.id}`} aria-labelledby={`cap-title-${item.id}`}>
     <div className="cap-story-copy"><span className="cap-story-number">0{i+1}</span><h4 id={`cap-title-${item.id}`}>{item[locale][0]}</h4><p className="cap-story-description">{item[locale][1]}</p></div>
     <div className={`cap-story-visual${item.id==="analytics"?" cap-visual-open":""}`}><CapabilityVisual type={item.id} locale={locale}/></div>
   </article>})}</div>
 </section>;
}

function CapabilityVisual({type,locale}){
 const words=copy[locale];
 const [choice,setChoice]=useState(0);
 if(type==="analytics")return <ModelingBridge archetypes={archetypes} locale={locale}/>;
 if(type==="environment")return <figure className="cap-figure cap-environment"><div className="cap-preview-switch" role="group" aria-label={locale==="es"?"Tipo de evidencia ambiental":"Environmental evidence type"}>{[words.observed,words.modeled].map((label,i)=><button type="button" key={label} aria-pressed={choice===i} onClick={()=>setChoice(i)}>{label}</button>)}</div><div className="cap-image-frame" key={choice}><img src={choice===0?clarity:figures.airMap.src} alt={choice===0?words.sensors:words.concentration} loading="lazy"/></div></figure>;
 if(type==="energy")return <figure className="cap-figure cap-housing"><div className="cap-image-frame" key={choice}><img src={archetypes[choice].image} alt={archetypes[choice][locale]} loading="lazy"/></div><div className="cap-archetype-switch" role="group" aria-label={words.archetype}>{archetypes.map((building,i)=><button type="button" key={building.id} aria-pressed={choice===i} onClick={()=>setChoice(i)}><img src={building.image} alt="" loading="lazy"/><span>{building[locale]}</span></button>)}</div></figure>;
 if(type==="visualization")return <figure className="cap-figure cap-immersive"><div className="cap-preview-switch" role="group" aria-label={locale==="es"?"Modo de visualización":"Visualization mode"}>{[words.web,words.vr].map((label,i)=><button type="button" key={label} aria-pressed={choice===i} onClick={()=>setChoice(i)}>{label}</button>)}</div><div className="cap-image-frame" key={choice}><img src={choice===0?scene:vr} alt={choice===0?words.map:words.immersive} loading="lazy"/></div></figure>;
 const questions=[[words.energyQuestion,"/dashboard?module=energy"],[words.airQuestion,"/dashboard?module=air"],[words.vrQuestion,"/vr"]];
 return <figure className="cap-figure cap-community"><div className="cap-image-frame"><img src={studyArea} alt={words.area} loading="lazy"/></div><div className="cap-question-panel"><span>{words.question}</span><div role="group" aria-label={words.question}>{questions.map(([label],i)=><button key={label} type="button" aria-pressed={choice===i} onClick={()=>setChoice(i)}>{label}</button>)}</div></div></figure>;
}
