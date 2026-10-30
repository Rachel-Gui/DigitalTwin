const paths = {
  brain: <><path d="M12 5c-3-5-8-1-6 2-5 0-5 7-2 8-2 4 3 7 6 4V5m2 0c3-5 8-1 6 2 5 0 5 7 2 8 2 4-3 7-6 4V5"/><path d="M7 8v3l3 2m-5 2h5m7-7v3l-3 2m5 2h-5"/></>,
  wind: <><path d="M3 8h12c5 0 4-6 1-5m-13 9h16c5 0 5 7 1 7M3 16h8c4 0 3 5 0 5"/></>,
  building: <><path d="M3 21h18M5 21V9h6v12m0-16h7v16M14 5V2M7 12h1m-1 4h1m6-7h1m-1 4h1m-1 4h1"/></>,
  cube: <><path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10L3 7m9 5 9-5m-9 5v10"/></>,
  people: <><circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4M17 4a3 3 0 0 1 0 6m1 4a5 5 0 0 1 4 5v2"/></>,
  layers: <><path d="m12 2 10 6-10 6L2 8Zm-10 12 10 6 10-6M2 19l10 6 10-6"/></>
};
export default function CapabilityIcon({type="layers"}) { return <svg viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>; }
