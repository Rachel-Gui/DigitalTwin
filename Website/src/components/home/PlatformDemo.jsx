import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n";
import { homeText } from "./content";
import CityScene from "./CityScene";
import CapabilityIcon from "./CapabilityIcon";

const layers = [
  {id:"energy",title:"Building energy",icon:"building",focus:"Energy demand & retrofit opportunities",status:"Modeling + scenario assessment",href:"/dashboard?module=energy",action:"Open energy assessment"},
  {id:"heat",title:"Urban heat",icon:"wind",focus:"Heat exposure & outdoor comfort",status:"Emerging research area",href:"/publications",action:"Read the research"},
  {id:"air",title:"Air quality",icon:"wind",focus:"Pollutant patterns & environmental exposure",status:"Sensing + predictive modeling",href:"/dashboard?module=air",action:"Explore environmental data"},
  {id:"solar",title:"Solar potential",icon:"layers",focus:"Rooftop solar & renewable-energy opportunity",status:"Modeling + scenario assessment",href:"/dashboard?module=renewable",action:"Explore solar potential"}
];
export default function PlatformDemo() {
  const {language}=useLanguage();
  const t=text=>homeText(language,text);
  const [layer,setLayer]=useState("energy");
  const [scenario,setScenario]=useState("existing");
  const [selected,setSelected]=useState(44);
  const [scale,setScale]=useState("neighborhood");
  const current=layers.find(item=>item.id===layer);
  return <div className="platform-demo">
    <div className="demo-topbar"><span><i/>{t("Interactive concept preview")}</span><span>{t("Illustrative urban model")}</span></div>
    <div className="demo-workspace">
      <aside className="demo-controls">
        <h3>{t("Environmental & energy layers")}</h3>
        <div className="demo-layer-list" role="group" aria-label={t("Environmental & energy layers")}>{layers.map(item=><button type="button" key={item.id} aria-pressed={layer===item.id} onClick={()=>setLayer(item.id)}><CapabilityIcon type={item.icon}/><span>{t(item.title)}</span><i/></button>)}</div>
        <h3>{t("Scenario")}</h3>
        <div className="demo-scenarios" role="group" aria-label={t("Scenario")}>{[["existing","Existing conditions"],["intervention","Greening + retrofit"]].map(([id,title])=><button type="button" key={id} aria-pressed={scenario===id} onClick={()=>setScenario(id)}><span/>{t(title)}</button>)}</div>
        <div className="demo-legend"><h3>{t("Relative intensity")}</h3><div className={`demo-color-scale demo-color-${layer}`}/><p><span>{t("Lower")}</span><span>{t("Higher")}</span></p></div>
      </aside>
      <div className="demo-map">
        <div className="demo-scale-switch" role="group" aria-label={t("View scale")}><button type="button" aria-pressed={scale==="neighborhood"} onClick={()=>setScale("neighborhood")}>{t("Neighborhood scale")}</button><button type="button" aria-pressed={scale==="building"} onClick={()=>setScale("building")}>{t("Building scale")}</button></div>
        <CityScene layer={layer} scenario={scenario} selected={selected} onSelect={setSelected} scale={scale} label={t("Example building")}/>
        <span className="demo-map-instruction"> {t("Select a building to explore")}</span>
      </div>
      <aside className="demo-inspector" aria-live="polite" aria-atomic="true">
        <span className="demo-kicker">{t("Selected building")}</span><h3>{t("Example building")} {String(selected).padStart(2,"0")}</h3>
        <span className="demo-status">{t("Illustrative assessment")}</span>
        <div className="demo-inspector-focus"><span>{t("Assessment focus")}</span><h4>{t(current.focus)}</h4><p>{t(current.status)}</p></div>
        <div className="demo-workflow"><h4>{t("Analysis workflow")}</h4><ol>{["Geospatial inputs","Scientific simulation","AI-assisted assessment","Human review"].map((step,i)=><li key={step}><b>0{i+1}</b>{t(step)}</li>)}</ol></div>
        <Link className="demo-module-link" to={current.href}>{t(current.action)} <span></span></Link>
      </aside>
    </div>
    <p className="demo-caption">{t("This interactive illustration explains the platform concept. Colors and scenarios are illustrative, not measured or computed results. Heat modeling and frontier AI are research directions.")}</p>
  </div>;
}
