import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import silLogo from "./assets/brand/sustainable-intelligence-lab-logo.png";
import { useLanguage } from "./i18n";
import ThemeToggle from "./components/ThemeToggle";

const primaryNavigation=[
  {to:"/",label:"Home",end:true},
  {to:"/dashboard",label:"Digital Twin"},
  {to:"/vr",label:"VR Experience"},
  {to:"/publications",label:"Publications"},
  {to:"/team",label:"Team"}
];

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [open,setOpen]=useState(false);
  const {pathname}=useLocation();
  useEffect(()=>setOpen(false),[pathname]);
  const navRef=useRef(null);
  const close=()=>setOpen(false);
  useEffect(()=>{
    const onPointerDown=(event)=>{if(!navRef.current?.contains(event.target)&&!event.target.closest(".menu-button"))close()};
    const onKeyDown=(event)=>{if(event.key==="Escape")close()};
    document.addEventListener("pointerdown",onPointerDown);
    document.addEventListener("keydown",onKeyDown);
    return()=>{document.removeEventListener("pointerdown",onPointerDown);document.removeEventListener("keydown",onKeyDown)};
  },[]);
  return <header className="institutional-header">
    <Link className="lab-brand" to="/" onClick={close}><img src={silLogo} alt="Sustainable Intelligence Lab"/><span className="project-brand"><strong>DecarbCityTwin</strong><small>Sustainable Intelligence Lab</small></span></Link>
    <span className="header-rule"/>
    <button className="menu-button" aria-label={open?"Close navigation":"Open navigation"} aria-controls="primary-navigation" aria-expanded={open} onClick={()=>setOpen(!open)}><span/><span/><span/></button>
    <nav ref={navRef} id="primary-navigation" className={open?"nav-links open":"nav-links"} aria-label="Primary navigation">
      {primaryNavigation.map(({to,label,end})=><NavLink key={to} to={to} end={end} onClick={close}>{t(label)}</NavLink>)}
      <div className="language-switch" role="group" aria-label="Language / Idioma"><button type="button" className={language==="en"?"active":""} onClick={()=>setLanguage("en")} aria-pressed={language==="en"}>EN</button><span>/</span><button type="button" className={language==="es"?"active":""} onClick={()=>setLanguage("es")} aria-pressed={language==="es"}>ES</button></div>
    </nav>
    <ThemeToggle/>
  </header>
}

export function Footer(){
  const {t}=useLanguage();
  return <footer id="site-footer" className="site-footer site-footer-compact"><div className="footer-inner">
    <Link className="footer-brand" to="/" aria-label={`DecarbCityTwin · ${t("Home")}`}><img src={silLogo} alt=""/><span>DecarbCityTwin</span></Link>
    <p className="footer-credit">© 2026 Sustainable Intelligence Lab <span aria-hidden="true">·</span> University of Washington</p>
    <nav aria-label="Footer navigation"><a href="mailto:info@silab.org">{t("Contact")} </a></nav>
  </div></footer>;
}

export function SectionHeader({eyebrow,title,text,action}){return <div className="section-header"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text&&<p>{text}</p>}</div>{action}</div>}
export function StatusLabel({children}){return <span className="status-label">{children}</span>}

export function SourceCaption({title,detail,source,status}){
  return <figcaption className="source-caption"><div><strong>{title}</strong><span>{detail}</span></div><dl><div><dt>Source</dt><dd>{source}</dd></div><div><dt>Status</dt><dd>{status}</dd></div></dl></figcaption>
}

export function ResearchFigure({figure,className=""}){
  return <figure className={`research-figure ${className}`}><div className="figure-image"><img src={figure.src} alt={figure.title}/></div><SourceCaption {...figure}/></figure>
}

export function PublicationRecord({image,status="PUBLISHED · 2026",title="AI-Enhanced Urban Building Energy Modeling for Health-Driven Decarbonization in Vulnerable Communities",source="Architecture 2026, 6, 84 · CC BY 4.0",href,label="Read the published article "}){
  return <article className={`publication-record ${image?"":"publication-record-text"}`}>{image&&<img src={image} alt="Published paper cover"/>}<div><StatusLabel>{status}</StatusLabel><h3>{title}</h3><p>Source: <cite>{source}</cite></p>{href&&<a className="text-link" href={href} target="_blank" rel="noopener noreferrer">{label}</a>}<span className="record-type">JOURNAL ARTICLE / RESEARCH OUTPUT</span></div></article>
}

export function ViewerPreview({src}){
  return <Link className="viewer-preview" to="/dashboard"><div className="browser-bar"><i/><i/><i/><span>SOUTH PARK LIVE SCENE</span><b>Open live viewer </b></div><img src={src} alt="South Park ArcGIS scene preview"/><div className="preview-fade"/></Link>
}

export function SolarDiagram(){
  return <div className="solar-diagram" role="img" aria-label="Non-quantitative building to renewable electricity diagram"><div>BUILDING</div><span></span><div>ROOF / FAÇADE</div><span></span><div className="sun">SUNLIGHT</div><span></span><div>ELECTRICITY</div></div>
}
export function ComparisonMatrix(){
  return <div className="mini-matrix" aria-label="Scenario comparison structure"><span/><b>Base</b><b>Envelope</b><b>Electric</b><b>PV</b>{["Energy","Exposure","Cost"].map(r=><><strong key={r}>{r}</strong>{[1,2,3,4].map(c=><i key={`${r}${c}`}/>)}</>)}</div>
}

export function LayerToggle({label,defaultOn,active,onActivate}){
  const [on,setOn]=useState(defaultOn); const toggle=()=>{const next=!on;setOn(next);if(next)onActivate?.(label)};
  return <label className={`layer-toggle ${active?"active-layer":""}`}><input type="checkbox" checked={on} onChange={toggle}/><span className="toggle-ui"/><span>{label}</span>{active&&<small>Legend</small>}</label>
}
export function ViewerPanel({src="https://uw.maps.arcgis.com/apps/instant/3dviewer/index.html?appid=9d99a4a0c2e2482b912608249bf3248f",title="South Park 3D Digital Twin",description}){return <div className="viewer-wrap">{description&&<p className="viewer-description">{description}</p>}<div className="viewer-label"><span><i/> SOUTH PARK ARCGIS SCENE</span><span>Embedded external viewer </span></div><div className="viewer-container"><iframe src={src} title={title} loading="lazy" allowFullScreen/></div></div>}
