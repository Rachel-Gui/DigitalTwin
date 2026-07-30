import { useState } from "react";
import { Link } from "react-router-dom";
import arcgisPreview from "../assets/home/south-park-arcgis-preview.png";
import studyAreaMap from "../assets/south-park-study-area-map.png";
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
    <StudyAreaSection/>
  </div>
}

function ModuleExpandingPanels(){
  const [activeModule,setActiveModule]=useState(null);
  return <section className="study-section"><div className="study-inner page-container">
    <SectionHeader eyebrow="02 / Modules" title="What we study"/>
    <div className="editorial-modules">
      {modulePanels.map((m)=><article
        key={m.key}
        className={`editorial-module${activeModule===m.key?" active":""}`}
        onMouseEnter={()=>setActiveModule(m.key)}
        onMouseLeave={()=>setActiveModule(null)}
        onFocus={()=>setActiveModule(m.key)}
        onBlur={(event)=>{
          if(!event.currentTarget.contains(event.relatedTarget)){
            setActiveModule(null);
          }
        }}
      >
        <button
          type="button"
          aria-expanded={activeModule===m.key}
          aria-controls={`module-details-${m.key}`}
          onClick={()=>setActiveModule(activeModule===m.key?null:m.key)}
        >
          <span className="module-kicker">{m.label}</span>
          <span className="module-background-number" aria-hidden="true">{m.number}</span>
          <div className="module-copy">
            <h3>{m.title}</h3>
          </div>
        </button>
        <div className="module-details" id={`module-details-${m.key}`}>
          <p>{m.description}</p>
          <Link className="module-link" to={m.path}>View module ↗</Link>
        </div>
      </article>)}
    </div>
  </div></section>
}

function StudyAreaSection(){
  return <section className="home-study-area">
    <div className="home-study-area-inner page-container">
      <div className="study-area-copy">
        <span className="eyebrow">03 / Where we study</span>
        <h2>South Park,<br/>Duwamish Valley,<br/>Seattle.</h2>
        <div className="study-area-body">
          <p>South Park is the initial DecarbCityTwin study area within Seattle’s Duwamish Valley. The neighborhood is shaped by industrial land uses, pollution exposure, older residential buildings, and long-standing environmental and health inequities.</p>
          <p>Many homes lack modern ventilation, cooling, and high-performance envelope systems, making residents more vulnerable to poor indoor air quality, overheating, and inefficient energy performance. These conditions make South Park a critical testbed for health-driven retrofit, air-quality analysis, renewable-energy assessment, and community-centered decarbonization.</p>
        </div>
        <ul className="study-area-keywords" aria-label="Study area focus">
          <li>Air quality</li>
          <li>Housing vulnerability</li>
          <li>Heat risk</li>
        </ul>
      </div>
      <figure className="study-area-map">
        <img src={studyAreaMap} alt="South Park study area in Seattle’s Duwamish Valley"/>
        <figcaption>Initial DecarbCityTwin study area · South Park, Seattle</figcaption>
      </figure>
    </div>
  </section>
}
