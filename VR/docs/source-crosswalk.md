# VR and PM2.5 source crosswalk

| Topic | Earlier reviewed material | Current implementation | Decision / remaining confirmation |
|---|---|---|---|
| Concord date and PM2.5 source | `Decarb CityTwin 2.0.pptx`, slide 6: `Data Source: PurpleAir, 23th April 2024` | Concord metadata displays 2024-04-23 and PurpleAir | Confirm whether “23th” should be corrected to “23 April” in all activity materials; current UI uses grammatically correct wording. |
| Concord particle profiles | `PHI EarthDay.gh` | Six recovered spatial profiles and 00:00–23:00 replay | Five small regions are called Particle Zones, not stations, pending sensor mapping evidence. |
| South Park PM2.5 input | `PHI T3 pm 2.5.ipynb`; generated `pm25_with_wind` dataset | Selectable historical dates from 2025-01-02 through 2025-11-22 | Upstream provider of notebook input `data.csv` is not stated and requires confirmation. |
| South Park wind | Notebook cites NOAA/NCEI and processes `LCD_USW00024234_2025_winddir_windsp.csv` | Hourly direction/speed drive simplified road-constrained motion | Confirm station identity and whether zero wind represents calm or preprocessing. |
| Historical versus live | 2025 presentation slide 8 calls IoT real-time visualization a future direction | VR is labeled historical/not live; Clarity is separate | Keep VR and latest-available Clarity data separate. |
| Highest/lowest comparison | Presentation slide 7 and original narration describe highest versus lowest conditions | Current South Park UI permits date selection instead of a fixed two-day comparison | Team must decide whether to restore an explicit verified high/low comparison mode. |
| EPA reference | No traceable EPA citation found in old project image | EPA 2024 primary 24-hour NAAQS, 35 µg/m³, shown with full limitation | Complete; retain `pm25-reference-audit.md`. |
| Building heights | Internalised GIS `Height` field, 1,432 records | Per-building heights replace uniform 20 m extrusion | Hasif comparison and landmark-level sign-off still required. |
| Landmarks | Presentation confirms Concord activity context but does not provide all coordinates | No verified 3D landmark labels yet | Obtain official names/coordinates for school, library, bridge, community/neighborhood center before implementation. |

