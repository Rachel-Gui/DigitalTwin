# Community PM2.5 and VR FAQ

Use the short answer first. Use the follow-up only when asked. Always include the limitation when it affects interpretation.

## Is this live data?

**Short answer:** The two VR scenes are historical visualizations, not live sensor feeds.

**Follow-up:** Concord represents PurpleAir data from 23 April 2024. South Park uses selectable historical hourly PM2.5 and wind records from the project dataset.

**Limitation:** The separate Clarity webpage shows the latest measurements returned by its API, but the server snapshot may be cached for up to 4 hours 45 minutes. The Clarity data do not currently drive the VR scenes.

## What is PM2.5?

**Short answer:** PM2.5 is fine airborne particulate matter 2.5 micrometers wide or smaller that can be inhaled deep into the lungs.

**Follow-up:** The interface reports PM2.5 Concentration in micrograms per cubic meter (µg/m³).

**Limitation:** PM2.5 is a size category containing many kinds of particles; it is not one single chemical substance.

## Are the moving dots real particles?

**Short answer:** No. They are visual symbols for changing PM2.5 Concentration.

**Follow-up:** Dot number, size, density, and movement help make changes visible.

**Limitation:** One dot is not one physical particle, and dots are not shown at actual size or count.

## What does the dashed 35 µg/m³ line mean?

**Short answer:** It is the U.S. EPA primary 24-hour PM2.5 NAAQS shown for context.

**Follow-up:** The interface compares a complete displayed 24-hour mean with the reference. It does not compare a single hourly value.

**Limitation:** EPA has no one-hour PM2.5 NAAQS. The regulatory form is the annual 98th percentile of 24-hour concentrations averaged over three years, so this visualization is not an attainment determination.

## Why is the value different at 09:00 and 11:00?

**Short answer:** The historical profile contains different PM2.5 Concentration values at those hours, but the visualization alone cannot determine why.

**Follow-up:** Real concentration can be affected by emissions, traffic, wind, weather, atmospheric mixing, and other factors.

**Limitation:** Do not identify any one of those factors as the cause unless a separate analysis supports it.

## Does the model include wind?

**Short answer:** South Park uses historical hourly wind direction and speed; Concord does not use an hourly wind field.

**Follow-up:** In South Park, wind inputs influence simplified particle movement inside the restored road volume.

**Limitation:** Neither scene is a complete CFD or atmospheric dispersion model. Emissions, temperature, turbulence, chemistry, and every building-scale airflow effect are not fully represented.

## Are the five Concord zones monitoring stations?

**Short answer:** No confirmed station identity is available for those five profiles.

**Follow-up:** The interface calls them Particle Zone 1–5 because they are recovered Grasshopper particle regions.

**Limitation:** Do not give them station names or locations until the original project team confirms a sensor mapping.

## Where do the data come from?

**Short answer:** Concord is documented as PurpleAir data from 23 April 2024; South Park uses the project `pm25_with_wind.xlsx` historical dataset.

**Follow-up:** South Park wind preparation is documented in `PHI T3 pm 2.5.ipynb`, including NOAA/NCEI wind data processing.

**Limitation:** The accessible notebook does not identify the upstream provider of its input `data.csv`; that PM2.5 provenance still needs team confirmation.

