import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { externalPlatforms } from '../../data/modules';
import { useLanguage } from '../../i18n';
import { homeText } from './content';
import './seattle-city-hero.css';

export default function SeattleCityHero(){
 const {language,t}=useLanguage(),es=language==='es';
 const frame=useRef(null),hero=useRef(null),video=useRef(null);
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 const [school,setSchool]=useState(false),[videoReady,setVideoReady]=useState(false);
 const [visible,setVisible]=useState(true),[pageVisible,setPageVisible]=useState(!document.hidden);
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const send=(action,value)=>frame.current?.contentWindow?.postMessage({type:'seattle-hero-control',action,value},window.location.origin);
 useEffect(()=>{
  const listener=e=>{
   if(e.origin!==window.location.origin||e.source!==frame.current?.contentWindow)return;
   if(e.data?.type==='seattle-hero-ready')setReady(true);
   if(e.data?.type==='seattle-hero-error')setFailed(true);
  };
  window.addEventListener('message',listener);
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));
  observer.observe(hero.current);
  const visibility=()=>setPageVisible(!document.hidden);
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const updateMotion=()=>setReduced(motion.matches);
  document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',updateMotion);
  return()=>{window.removeEventListener('message',listener);observer.disconnect();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',updateMotion)};
 },[]);
 useEffect(()=>{
  send('visibility',visible&&pageVisible&&!school);
 },[ready,visible,pageVisible,school]);
 useEffect(()=>{
  if(!ready||!videoReady||school||!visible||!pageVisible||reduced)return;
  const timer=setTimeout(()=>setSchool(true),16000);
  return()=>clearTimeout(timer);
 },[ready,videoReady,school,visible,pageVisible,reduced]);
 useEffect(()=>{
  if(!video.current)return;
  if(school&&visible&&pageVisible&&!reduced){
   if(video.current.ended)video.current.currentTime=0;
   video.current.play().catch(()=>{setSchool(false);setVideoReady(false)});
  }else{
   video.current.pause();
  }
 },[school,visible,pageVisible,reduced]);
 return <div ref={hero} className={`seattle-city-hero ${ready?'is-ready':''} ${failed?'has-failed':''} ${school?'is-school':''}`}>
  <iframe ref={frame} src="/seattle-hero/index.html" title={es?'Vista de Seattle en 3D':'Seattle city background'} aria-hidden="true" tabIndex={-1} className="city-hero-frame"/>
  <video ref={video} className="city-hero-school-video" src="/media/concord-school-walkthrough.mp4?v=fullhd" poster="/media/concord-school-poster.jpg" muted playsInline preload="auto" disablePictureInPicture disableRemotePlayback tabIndex={-1} aria-hidden="true" onLoadedData={()=>setVideoReady(true)} onEnded={()=>setSchool(false)} onError={()=>{setSchool(false);setVideoReady(false)}}/>
  <div className="city-hero-shade"/>
  <div className="city-hero-copy">
   <h1 id="platform-title">DecarbCityTwin</h1>
   <h2>{t('A Platform for Health-Driven')} {t('& Equitable Decarbonization')}</h2>
   <p>{homeText(language,'An AI-Driven, Multiscale Digital Twin for Building Energy and Urban Environmental Assessment')}</p>
  </div>
  <div className="city-hero-bottom">
   <nav className="city-hero-entrances" aria-label={es?'Explorar plataformas':'Explore platforms'}>
    <Link className="city-hero-enter-twin" to="/dashboard">Digital Twin</Link>
    <a className="city-hero-enter-vr" href={`${externalPlatforms.vr.replace(/#.*$/, '')}#concord`} target="_blank" rel="noopener noreferrer">{es?'Experiencia VR':'VR Experience'}</a>
   </nav>
  </div>
  {(!ready||failed)&&<div className="city-hero-note" role="status">{failed?(es?'Vista 3D no disponible':'3D view unavailable'):(es?'Cargando…':'Loading…')}</div>}
 </div>;
}
