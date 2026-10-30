import { useId } from "react";

// Deterministic illustrative geometry. No values represent a real building or model output.
export const demoBuildings = [];
for (let row = 0; row < 13; row++) for (let col = 0; col < 16; col++) {
  if (row === 5 || row === 6 || col % 5 === 0 || row % 5 === 4) continue;
  const seed = (col * 31 + row * 17) % 97;
  demoBuildings.push({ id: demoBuildings.length + 1, x: 480 + (col - row) * 30, y: 40 + (col + row) * 14, h: 13 + seed % 38 + (col > 8 && row < 4 ? seed % 70 : 0), seed });
}
const palettes = {
  energy: ["#54ddd0", "#bce4c2", "#e3cc89", "#e28a50", "#e45e39"],
  heat: ["#55c2d3", "#91d5be", "#ead79a", "#eb9755", "#ec6552"],
  air: ["#62b9c0", "#70d7c0", "#9dd3a5", "#c7cf7e", "#e4bd68"],
  solar: ["#3e738b", "#53a5a5", "#9ac6ac", "#e7d99b", "#f7bb53"]
};
export default function CityScene({ layer="energy", scenario="existing", selected=44, onSelect, scale="neighborhood", decorative=false, label }) {
  const id = useId().replaceAll(":", "");
  const building = demoBuildings.find(b => b.id === selected) || demoBuildings[0];
  const palette = palettes[layer];
  const viewBox = scale === "building" ? `${building.x-195} ${building.y-205} 390 330` : "80 -85 930 660";
  return <svg className={`city-scene ${decorative ? "city-scene-decorative" : ""}`} viewBox={viewBox} role={decorative ? undefined : "group"} aria-label={decorative ? undefined : label} aria-hidden={decorative || undefined}>
    <defs>
      <radialGradient id={`${id}-halo`}><stop stopColor="#1d615d" stopOpacity=".4"/><stop offset="1" stopColor="#092022" stopOpacity="0"/></radialGradient>
      <linearGradient id={`${id}-river`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#0d4e60"/><stop offset="1" stopColor="#073239"/></linearGradient>
      <pattern id={`${id}-grid`} width="60" height="28" patternUnits="userSpaceOnUse"><path d="M0 14 30 0 60 14 30 28Z" fill="none" stroke="#4d8883" strokeOpacity=".09"/></pattern>
    </defs>
    <ellipse cx="540" cy="230" rx="510" ry="340" fill={`url(#${id}-halo)`}/>
    <path d="M480-5 1000 238 610 490 90 247Z" className="city-ground" fill="#102326" stroke="#294044"/>
    <path d="M480-5 1000 238 610 490 90 247Z" fill={`url(#${id}-grid)`}/>
    <path d="m288 102 510 239-58 40-516-240Z" className="city-river" fill={`url(#${id}-river)`} stroke="#28606a" strokeWidth="1"/>
    <path d="m252 128 511 238m-492-257 511 238" stroke="#60b8b8" strokeOpacity=".25" strokeWidth="1"/>
    {[0,5,10,15].map(col=><path key={`c${col}`} d={`M${480+col*30} ${40+col*14}l-390 182`} stroke="#4e6a6d" strokeWidth="8" strokeOpacity=".48"/>)}
    {[4,9].map(row=><path key={`r${row}`} d={`M${480-row*30} ${40+row*14}l480 224`} stroke="#4e6a6d" strokeWidth="7" strokeOpacity=".45"/>)}
    {layer === "heat" && <path d="m390 225 180-90 330 160-180 105Z" fill="#e59c48" opacity={scenario === "existing" ? ".2" : ".08"}/>}
    {demoBuildings.map(b=>{
      const level = Math.min(4, Math.max(0, b.seed % 5 - (scenario === "intervention" && layer !== "solar" ? 1 : 0)));
      const color = palette[level];
      const active = selected === b.id && !decorative;
      const name = `${label || "Example building"} ${String(b.id).padStart(2,"0")}`;
      return <g key={b.id} className={onSelect ? "demo-building" : undefined} role={onSelect ? "button" : undefined} tabIndex={onSelect ? (active ? 0 : -1) : undefined} data-building-id={b.id} aria-label={onSelect ? name : undefined} aria-pressed={onSelect ? active : undefined} onClick={onSelect ? ()=>onSelect(b.id) : undefined} onKeyDown={onSelect ? e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onSelect(b.id)}
        else if(["ArrowRight","ArrowLeft","ArrowDown","ArrowUp"].includes(e.key)) {
          e.preventDefault();
          const offset=e.key==="ArrowRight"||e.key==="ArrowDown"?1:-1;
          const next=demoBuildings[(demoBuildings.indexOf(b)+offset+demoBuildings.length)%demoBuildings.length];
          onSelect(next.id);
          e.currentTarget.parentElement.querySelector(`[data-building-id="${next.id}"]`)?.focus();
        }} : undefined}>
        <path d={`M${b.x} ${b.y}l22 10 0 ${-b.h}-22-10Z`} fill={color} fillOpacity=".37" stroke="#092023" strokeWidth=".6"/>
        <path d={`M${b.x+22} ${b.y+10}l22-10 0 ${-b.h}-22 10Z`} fill={color} fillOpacity=".6" stroke="#092023" strokeWidth=".6"/>
        <path className="building-roof" d={`M${b.x} ${b.y-b.h}l22-10 22 10-22 10Z`} fill={color} stroke={active ? "#baffef" : "#152d2c"} strokeWidth={active ? 2.5 : .6}/>
        {b.h>45&&<path d={`M${b.x+27} ${b.y-b.h+13}v${b.h-20}m7-39v25`} stroke={color} strokeWidth="1" opacity=".6"/>}
        {active&&<><path d={`M${b.x+22} ${b.y-b.h-15}v-35`} stroke="#67f7de" strokeDasharray="3 3"/><circle cx={b.x+22} cy={b.y-b.h-54} r="5" fill="#67f7de"/></>}
      </g>;
    })}
    {(scenario === "intervention" ? [2,3,7,8,11,12,16,17,20,24,27,30,33,38,44,48] : [3,12,24,38]).map((n,i)=>{
      const b=demoBuildings[n];return <g key={`tree${n}`} transform={`translate(${b.x-7} ${b.y+3})`}><path d="M0 0v-13" stroke="#65a58b" strokeWidth="2"/><ellipse cy="-15" rx="5" ry="8" fill={i%2 ? "#387e6b" : "#5aaa88"}/></g>;
    })}
    {layer === "air" && <g fill="#8df3d9" opacity=".6">{Array.from({length:32},(_,i)=><circle key={i} cx={240+i*18} cy={175+i*6+(i%3)*8} r={2+i%2}/>)}</g>}
    <path d="m158 387 35-16-35-16m0 16h70" stroke="#648d8b" fill="none" strokeWidth="1"/>
  </svg>;
}
