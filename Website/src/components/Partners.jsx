import { useLanguage } from "../i18n";
import { useTheme } from "../theme";
import uwPurple from "../assets/partners/uw-stacked-purple.png";
import uwGold from "../assets/partners/uw-stacked-gold.png";
import uwMarkPurple from "../assets/partners/uw-w-purple.png";
import uwMarkGold from "../assets/partners/uw-w-gold.png";
import siuLight from "../assets/partners/siu-color-light.png";
import siuDark from "../assets/partners/siu-color-dark.png";
import urbiLogo from "../assets/partners/urbiilab.png";
import seattleLogo from "../assets/partners/seattle-official-blue.svg";
import drccLogo from "../assets/partners/drcc-official-white.png";
import silLogo from "../assets/brand/sustainable-intelligence-lab-logo.png";
import "./partners.css";

export default function Partners({contained=true}){
 const {language}=useLanguage();
 const {theme}=useTheme();
 const dark=theme==="dark";
 return <section id="partners-collaborators" className={`partners-network${contained?" page-container":""}`} aria-labelledby="project-partners-title">
  <header className="partners-heading"><h2 id="project-partners-title">{language==="es"?"Socios y colaboradores":"Partners & Collaborators"}</h2></header>
  <div className="partners-directory">
   <div className="partners-group partners-university">
    <div className="partners-brand-row"><img className="partners-uw-logo" src={dark?uwGold:uwPurple} width="746" height="367" alt="University of Washington" loading="lazy"/></div>
    <ul className="partners-units"><li>Population Health Initiative</li><li>Department of Architecture</li><li>Electrical &amp; Computer Engineering</li></ul>
   </div>
   <div className="partners-group partners-labs">
    <p className="partners-real-name">Renewable Energy Analysis Lab</p>
    <div className="partners-lockup"><img className="partners-sil-logo" src={silLogo} width="374" height="374" alt="" loading="lazy"/><p>Sustainable Intelligence Lab <span>[SIL]</span></p></div>
    <div className="partners-idl"><div><strong>INTEGRATED<br/>DESIGN LAB</strong><img src={dark?uwMarkGold:uwMarkPurple} width="450" height="303" alt="" loading="lazy"/></div><span>University of Washington</span></div>
   </div>
   <div className="partners-group partners-siu-group">
    <div className="partners-brand-row"><img className="partners-siu-logo" src={dark?siuDark:siuLight} width="1493" height="292" alt="Southern Illinois University Carbondale" loading="lazy"/></div>
    <p className="partners-college">College of Arts and Media</p>
    <div className="partners-lockup partners-urbi"><img src={urbiLogo} width="764" height="318" alt="" loading="lazy"/><p>Urban Intelligence &amp; Integrity Lab <span>[URBiiLAB]</span></p></div>
   </div>
   <div className="partners-group partners-community-group">
    <div className="partners-lockup partners-city"><img src={seattleLogo} width="64" height="64" alt="" loading="lazy"/><p>City of Seattle<span className="partners-detail">Office of Sustainability &amp; Environment</span></p></div>
    <div className="partners-lockup partners-coalition"><img src={drccLogo} width="1170" height="1170" alt="" loading="lazy"/><p>Duwamish River Community Coalition</p></div>
   </div>
  </div>
 </section>;
}
