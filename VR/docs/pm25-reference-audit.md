# PM2.5 reference-line audit

Last verified: 2026-08-06

## Historical project value

The existing project image `Website/src/assets/vr/high-low-pollution-chart.png` labels a dashed line as `Acceptance Level (9 µg/m³)`. No presentation, poster, source note, bibliography, or editable chart file was present in the accessible project workspace, so the historical author intent and cited source cannot be established from the image alone.

## EPA verification

- EPA's 2024 primary annual PM2.5 NAAQS is **9.0 µg/m³**. Its form is the annual arithmetic mean averaged over three years. It is not a one-hour limit.
- EPA retained the primary 24-hour PM2.5 NAAQS at **35 µg/m³**. Its form is the annual 98th percentile of 24-hour concentrations averaged over three years.
- EPA's 2024 PM2.5 AQI breakpoints use 0.0-9.0 µg/m³ for Good and 9.1-35.4 µg/m³ for Moderate. These are 24-hour PM2.5 concentration breakpoints used to calculate AQI, not one-hour concentration standards.
- EPA publishes no one-hour PM2.5 NAAQS. Individual points in the VR chart are hourly values and must not be described as meeting or violating an EPA standard.

## Interface decision

The VR chart uses two context lines: the **9.0 µg/m³** EPA annual mean NAAQS and the **35 µg/m³** EPA 24-hour NAAQS. The interface explicitly states that neither line is an hourly limit and that a single hourly or daily profile cannot determine annual-standard attainment. Above/below status is calculated only for a complete displayed 24-hour mean against the 35 µg/m³ reference, never from an individual hourly point. No annual attainment status is calculated.

The historical 9 µg/m³ line is not labeled `acceptable`, because 9 µg/m³ is an annual NAAQS and an AQI breakpoint, not an EPA one-hour acceptable level.

## Formal sources

1. U.S. EPA, **NAAQS Table**, PM2.5 primary standards: 9.0 µg/m³ annual and 35 µg/m³ 24-hour. https://www.epa.gov/criteria-air-pollutants/naaqs-table
2. U.S. EPA, **Final Reconsideration of the National Ambient Air Quality Standards for Particulate Matter**, finalized February 7, 2024. https://www.epa.gov/pm-pollution/final-reconsideration-national-ambient-air-quality-standards-particulate-matter-pm
3. U.S. EPA Air Quality System, **AQI Breakpoints**, PM2.5 duration: 24 HOUR. https://aqs.epa.gov/aqsweb/documents/codetables/aqi_breakpoints.html
