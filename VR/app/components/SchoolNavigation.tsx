"use client";

import { useState } from "react";

export type NavigationPose = { x: number; z: number; heading: number; immersive: boolean };
export type SchoolMap = { image: string; minX: number; minZ: number; span: number };
export type SchoolView = { id: string; label: string; position: [number, number, number]; target: [number, number, number] };

export function SchoolNavigation({ map, pose, views, onNavigate }: {
  map: SchoolMap | null;
  pose: NavigationPose;
  views: SchoolView[];
  onNavigate: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const x = map ? (pose.x - map.minX) / map.span * 256 : 128;
  const y = map ? (pose.z - map.minZ) / map.span * 256 : 128;
  const outside = x < 0 || x > 256 || y < 0 || y > 256;
  return <aside className={`school-navigation${collapsed ? " is-collapsed" : ""}`} aria-label="School location and navigation">
    <button className="school-navigation-heading" onClick={() => setCollapsed(!collapsed)} aria-expanded={!collapsed} aria-controls="school-map-content">
      <span>⌖ <strong>School navigation</strong></span><span>{collapsed ? "+" : "−"}</span>
    </button>
    {!collapsed && <div id="school-map-content">
      <div className="school-map">
        {map ? <svg viewBox="0 0 256 256" role="img" aria-label="School model plan with your virtual camera position and viewing direction">
          <image href={map.image} width="256" height="256" />
          {views.slice(1).map((view, index) => <g key={view.id} transform={`translate(${(view.target[0] - map.minX) / map.span * 256},${(view.target[2] - map.minZ) / map.span * 256})`}>
            <circle r="8" fill="#12252c" stroke="#fff" strokeWidth="1.5" /><text textAnchor="middle" y="3" fontSize="9" fill="#fff">{index + 1}</text>
          </g>)}
          <g transform={`translate(${Math.max(10, Math.min(246, x))},${Math.max(10, Math.min(246, y))}) rotate(${pose.heading})`}>
            <circle r="12" fill="#0d202c" fillOpacity=".7" />
            <path d="M 0 -10 L 7 8 L 0 5 L -7 8 Z" fill="#d9ff68" stroke="#14252b" strokeWidth="1.5" />
          </g>
        </svg> : <span className="school-map-loading">Preparing school plan…</span>}
      </div>
      <div className="school-map-location"><strong>{outside ? "Outside plan extent" : "You are here"}</strong><span>{pose.immersive ? "Headset position" : "Camera position"} · arrow = view direction</span></div>
      <div className="school-navigation-views">{views.map((view) => <button key={view.id} onClick={() => onNavigate(view.id)} disabled={!map}>{view.label}</button>)}</div>
      <p>Drag to look · scroll to zoom · right-drag to pan</p>
      <small>Model plan · virtual location, not GPS</small>
    </div>}
  </aside>;
}
