import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import silLogo from "./assets/brand/sustainable-intelligence-lab-logo.png";
import uwWhite from "./assets/brand/uw-signature-white.png";
import { modules } from "./data/modules";
import { useLanguage } from "./i18n";

const dropdownModules = modules.filter((module) => ["air", "energy", "retrofit", "renewable"].includes(module.key));

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [open,setOpen]=useState(false), [drop,setDrop]=useState(false);
  const navRef=useRef(null);
  const close=()=>{setOpen(false);setDrop(false)};
  useEffect(()=>{
    const onPointerDown=(event)=>{if(!navRef.current?.contains(event.target))close()};
    const onKeyDown=(event)=>{if(event.key==="Escape")close()};
    document.addEventListener("pointerdown",onPointerDown);
    document.addEventListener("keydown",onKeyDown);
    return()=>{document.removeEventListener("pointerdown",onPointerDown);document.removeEventListener("keydown",onKeyDown)};
  },[]);
  return <header className="institutional-header">
    <Link className="lab-brand" to="/" onClick={close}><img src={silLogo} alt="Sustainable Intelligence Lab"/><span>Sustainable<br/>Intelligence Lab</span></Link>
    <span className="header-rule"/>
    <button className="menu-button" aria-label={open?"Close navigation":"Open navigation"} aria-controls="primary-navigation" aria-expanded={open} onClick={()=>setOpen(!open)}><span/><span/><span/></button>
    <nav ref={navRef} id="primary-navigation" className={open?"nav-links open":"nav-links"} aria-label="Primary navigation">
      <NavLink to="/" onClick={close}>{t("Home")}</NavLink>
      <NavLink to="/dashboard" onClick={close}>{t("Digital Twin")}</NavLink>
      <div className="dropdown"><button className="dropdown-trigger" onClick={()=>setDrop(!drop)} aria-controls="modules-menu" aria-haspopup="true" aria-expanded={drop}><span>{t("Modules")}</span><i className="dropdown-chevron" aria-hidden="true"/></button>
        <div id="modules-menu" className={drop?"dropdown-menu show":"dropdown-menu"} aria-hidden={!drop}>
          {dropdownModules.map((m,index)=><NavLink key={m.key} to={m.path} onClick={close}><small>{String(index+1).padStart(2,"0")}</small><span><strong>{m.title}</strong></span><b aria-hidden="true">↗</b></NavLink>)}
        </div>
      </div>
      <NavLink to="/analytics" onClick={close}>{t("Live Air Data")}</NavLink>
      <Link className="live-link" to="/dashboard" onClick={close}>Open Live Viewer ↗</Link>
      <div className="language-switch" role="group" aria-label="Language / Idioma"><button type="button" className={language==="en"?"active":""} onClick={()=>setLanguage("en")} aria-pressed={language==="en"}>EN</button><span>/</span><button type="button" className={language==="es"?"active":""} onClick={()=>setLanguage("es")} aria-pressed={language==="es"}>ES</button></div>
      <img className="mobile-uw" src={uwWhite} alt="University of Washington"/>
    </nav>
    <span className="header-rule right"/>
    <img className="uw-brand" src={uwWhite} alt="University of Washington"/>
  </header>
}

export function Footer(){
  const {t}=useLanguage();
  return <footer className="site-footer"><div><img src={silLogo} alt="Sustainable Intelligence Lab"/><div><h2>DecarbCityTwin</h2><p>{t("Urban intelligence for equitable climate action.")}</p></div></div><div><span>{t("RESEARCH PLATFORM")}</span><p>South Park · Duwamish Valley · Seattle</p><p>{t("Figures and statuses are labeled by source and development stage.")}</p></div><nav aria-label="Footer navigation"><Link to="/">{t("Home")}</Link><Link to="/dashboard">{t("Digital Twin")}</Link><Link to="/research">{t("Research")}</Link><Link to="/analytics">{t("Live Air Data")}</Link><a href="mailto:info@silab.org">{t("Contact")}</a></nav><div><img src={uwWhite} alt="University of Washington"/><p>© 2026 Sustainable Intelligence Lab</p></div></footer>
}

export function SectionHeader({eyebrow,title,text,action}){return <div className="section-header"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text&&<p>{text}</p>}</div>{action}</div>}
export function StatusLabel({children}){return <span className="status-label">{children}</span>}

export function SourceCaption({title,detail,source,status}){
  return <figcaption className="source-caption"><div><strong>{title}</strong><span>{detail}</span></div><dl><div><dt>Source</dt><dd>{source}</dd></div><div><dt>Status</dt><dd>{status}</dd></div></dl></figcaption>
}

export function ResearchFigure({figure,className=""}){
  return <figure className={`research-figure ${className}`}><div className="figure-image"><img src={figure.src} alt={figure.title}/></div><SourceCaption {...figure}/></figure>
}

export function PublicationRecord({image,status="PUBLISHED · 2026",title="AI-Enhanced Urban Building Energy Modeling for Health-Driven Decarbonization in Vulnerable Communities",source="Architecture 2026, 6, 84 · CC BY 4.0",href,label="Read the published article ↗"}){
  return <article className={`publication-record ${image?"":"publication-record-text"}`}>{image&&<img src={image} alt="Published paper cover"/>}<div><StatusLabel>{status}</StatusLabel><h3>{title}</h3><p>Source: <cite>{source}</cite></p>{href&&<a className="text-link" href={href} target="_blank" rel="noopener noreferrer">{label}</a>}<span className="record-type">JOURNAL ARTICLE / RESEARCH OUTPUT</span></div></article>
}

export function ViewerPreview({src}){
  return <Link className="viewer-preview" to="/dashboard"><div className="browser-bar"><i/><i/><i/><span>SOUTH PARK LIVE SCENE</span><b>Open live viewer ↗</b></div><img src={src} alt="South Park ArcGIS scene preview"/><div className="preview-fade"/></Link>
}

export function SolarDiagram(){
  return <div className="solar-diagram" role="img" aria-label="Non-quantitative building to renewable electricity diagram"><div>BUILDING</div><span>→</span><div>ROOF / FAÇADE</div><span>→</span><div className="sun">SUNLIGHT</div><span>→</span><div>ELECTRICITY</div></div>
}
export function ComparisonMatrix(){
  return <div className="mini-matrix" aria-label="Scenario comparison structure"><span/><b>Base</b><b>Envelope</b><b>Electric</b><b>PV</b>{["Energy","Exposure","Cost"].map(r=><><strong key={r}>{r}</strong>{[1,2,3,4].map(c=><i key={`${r}${c}`}/>)}</>)}</div>
}

export function LayerToggle({label,defaultOn,active,onActivate}){
  const [on,setOn]=useState(defaultOn); const toggle=()=>{const next=!on;setOn(next);if(next)onActivate?.(label)};
  return <label className={`layer-toggle ${active?"active-layer":""}`}><input type="checkbox" checked={on} onChange={toggle}/><span className="toggle-ui"/><span>{label}</span>{active&&<small>Legend</small>}</label>
}
export function ViewerPanel(){return <div className="viewer-wrap"><div className="viewer-label"><span><i/> SOUTH PARK ARCGIS SCENE</span><span>Embedded external viewer ↗</span></div><div className="viewer-container"><iframe src="https://uw.maps.arcgis.com/apps/instant/3dviewer/index.html?appid=9d99a4a0c2e2482b912608249bf3248f" title="South Park 3D Digital Twin" loading="lazy" allowFullScreen/></div></div>}
