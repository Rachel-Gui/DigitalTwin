import { useState } from "react";
import { Link } from "react-router-dom";
import arcgisPreview from "../assets/home/south-park-arcgis-preview.png";
import { SectionHeader, ViewerPreview } from "../components";
import { modulePanels } from "../data/projectContent";

export default function Home(){
  return <div className="home-page">
    <section className="home-hero page-container">
      <div className="hero-title"><h1>DecarbCityTwin</h1></div>
      <div className="hero-statement"><h2>A Platform for Health-Driven<br/>&amp; Equitable Decarbonization</h2><p>DecarbCityTwin connects neighborhood air-quality data, building-energy simulation, health-driven retrofit analysis, renewable-energy scenarios, agentic decision support, and immersive VR for the South Park testbed.</p></div>
      <div className="hero-preview"><ViewerPreview src={arcgisPreview}/></div>
    </section>
    <ModuleExpandingPanels/>
  </div>
}

function ModuleExpandingPanels(){
  const [active,setActive]=useState(0);
  return <section className="study-section"><div className="study-inner page-container">
    <SectionHeader eyebrow="02 / Modules" title="What we study"/>
    <div className="expanding-panels">
      {modulePanels.map((m,i)=><article key={m.key} className={active===i?"module-panel active":"module-panel"} onMouseEnter={()=>setActive(i)} onFocus={()=>setActive(i)}>
        <button aria-controls={`module-panel-${m.key}`} aria-expanded={active===i} onClick={()=>setActive(i)}><span>{m.number}</span><h3>{m.title}</h3></button>
        <div id={`module-panel-${m.key}`} className="module-reveal" aria-hidden={active!==i}><p>{m.description}</p><Link tabIndex={active===i?0:-1} to={m.path}>View module ↗</Link></div>
      </article>)}
    </div>
  </div></section>
}
