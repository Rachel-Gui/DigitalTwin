import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n";
import { externalPlatforms } from "../../data/modules";
import twinPreview from "../../assets/home/south-park-arcgis-preview.png";
import vrPreview from "../../assets/vr/concord-vr-hero.png";
import "./platform-entrances.css";

export default function PlatformEntrances(){
 const {language}=useLanguage();
 const es=language==="es";
 return <section className="platform-entrances" id="explore-platforms" aria-labelledby="platform-entrances-title">
  <header><h2 id="platform-entrances-title">{es?"Explora DecarbCityTwin":"Explore DecarbCityTwin"}</h2><p>{es?"Explora el modelo del barrio o entra en una experiencia inmersiva.":"Explore the neighborhood model or step into an immersive experience."}</p></header>
  <div className="platform-entrance-grid">
   <article className="platform-entrance"><img src={twinPreview} alt={es?"Vista del modelo 3D de South Park":"South Park 3D Digital Twin preview"} loading="lazy"/><div><h3>Digital Twin</h3><p>{es?"Explora energía de edificios, oportunidades de rehabilitación, potencial solar y datos de calidad del aire en South Park.":"Explore South Park building energy, retrofit opportunities, solar potential, and air-quality data in one map workspace."}</p><Link className="platform-enter-button" to="/dashboard">{es?"Abrir Digital Twin":"Open Digital Twin"}</Link></div></article>
   <article className="platform-entrance"><img src={vrPreview} alt={es?"Escena VR de Concord School con visualización histórica de PM2.5":"Concord School VR interface with historical PM2.5 particle visualization"} loading="lazy"/><div><h3>{es?"Plataforma VR":"VR Platform"}</h3><p>{es?"Explora Concord School y South Park con perfiles históricos de PM2.5 y reproducción horaria. El plano de Concord muestra tu posición y orientación dentro del modelo.":"Explore Concord School and South Park with historical PM2.5 profiles and hourly replay. The Concord school plan tracks your position and viewing direction within the model."}</p><a className="platform-enter-button" href={externalPlatforms.vr} target="_blank" rel="noopener noreferrer">{es?"Entrar en la plataforma VR":"Enter VR Platform"}</a></div></article>
  </div>
 </section>;
}
