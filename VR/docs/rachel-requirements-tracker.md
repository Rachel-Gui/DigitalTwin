# Rachel VR / PM2.5 requirements tracker

Status values: `complete`, `in progress`, `blocked — evidence needed`, `blocked — hardware needed`.

| ID | Requirement | Status | Current evidence | Next action / owner |
|---|---|---|---|---|
| R1 | EPA 24-hour reference line | complete | UI line, text label, source link, reference audit | Preserve during visual QA. |
| R2 | Prevent hourly/AQI/annual-standard confusion | in progress | Complete-day guard added; incomplete days do not receive a 24-hour comparison | Visual QA and regression test. |
| R3 | Historical/live distinction | in progress | VR says historical/not live; Clarity renamed latest available | Confirm desired API cache with data owner. |
| R4 | Historical dates and sources | in progress | Concord sourced to PurpleAir 2024-04-23; South Park date selector and file shown | Confirm South Park upstream PM2.5 provider. |
| R5 | PM2.5 public definition | in progress | Expandable VR guide and website glossary | Add Spanish inside standalone VR. |
| R6 | Particle meaning and scale | in progress | Explicit not-real-size/count statement added | Check comprehension with participants. |
| R7 | Monitoring station explanation | blocked — evidence needed | Clarity stations exist; Concord profiles retained as zones | Obtain five-profile sensor mapping or confirm no mapping. |
| R8 | Building heights | blocked — evidence needed | GIS Height field restored | Hasif dataset comparison and sign-off. |
| R9 | Rhino/Grasshopper motion parity | in progress | Automated particle parity tests and recovery docs | Golden Demo side-by-side review. |
| R10 | Lucy wind/uncertainty feedback | blocked — evidence needed | Wind behavior and limitations now disclosed | Attach Lucy notes and obtain approval. |
| R11 | Community landmarks | blocked — evidence needed | No verified labels | Obtain official names, coordinates, and Spanish labels. |
| R12 | Bilingual website and VR | in progress | Website partial Spanish; standalone VR/audio English only | Implement VR language state after approved Spanish copy. |
| R13 | Community FAQ | in progress | `community-pm25-faq.md` created | Team scientific/language review and Spanish version. |
| R14 | Quest and iPad testing | blocked — hardware needed | No completed test record | Use hardware checklist and record reviewer/date/results. |
| R15 | Activity material/source crosswalk | in progress | `source-crosswalk.md` created | Add missing poster, Lucy, Hasif and paper evidence. |

