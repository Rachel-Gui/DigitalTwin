import { useEffect, useState } from "react";
import { useLanguage } from "../../i18n";
import "./page-scroll-ruler.css";

export default function PageScrollRuler(){
 const {language}=useLanguage();
 const [progress,setProgress]=useState(0);
 useEffect(()=>{
  let frame=0;
  const update=()=>{
   frame=0;
   const extent=document.documentElement.scrollHeight-window.innerHeight;
   setProgress(extent>0?Math.max(0,Math.min(100,window.scrollY/extent*100)):0);
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  const observer=new ResizeObserver(schedule);
  observer.observe(document.body);
  window.addEventListener("scroll",schedule,{passive:true});
  window.addEventListener("resize",schedule);
  update();
  return()=>{observer.disconnect();window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);cancelAnimationFrame(frame)};
 },[]);
 const value=Math.round(progress);
 return <aside className="home-scroll-ruler" role="progressbar" aria-label={language==="es"?"Posición en la página":"Page scroll position"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
  <div className="home-ruler-track" aria-hidden="true">{Array.from({length:21},(_,i)=>{
   const emphasis=Math.max(0,1-Math.abs(progress-i*5)/12);
   return <i key={i} className={i%5===0?"is-major":""} style={{top:`${i*5}%`,"--tick-scale":1+emphasis*2,"--tick-opacity":.3+emphasis*.7}}/>;
  })}</div>
 </aside>;
}
