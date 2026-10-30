const paths = {
 more:<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
 building:<><path d="M3 21h18M5 21V9h6v12m0-16h7v16M14 5V2M7 12h1m-1 4h1m6-7h1m-1 4h1m-1 4h1"/></>,
 home:<><path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7"/></>,
 sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
 air:<><path d="M3 8h12c5 0 4-6 1-5m-13 9h16c5 0 5 7 1 7M3 16h8c4 0 3 5 0 5"/></>,
 layers:<><path d="m12 3 10 5-10 5L2 8Zm-10 11 10 5 10-5M2 19l10 5 10-5"/></>,
 info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/></>,
 external:<><path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6"/></>,
 expand:<><path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/></>,
 refresh:<><path d="M20 7a9 9 0 1 0 1 7m-1-7V2m0 5h-5"/></>,
 map:<><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/></>,
 close:<path d="m6 6 12 12M6 18 18 6"/>,
 chevron:<path d="m8 4 8 8-8 8"/>
};
export default function WorkspaceIcon({name}){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||paths.layers}</svg>}
