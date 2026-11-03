# Digital Twin review preview — 3 November 2026

This revision uses the v4 preview as its functional baseline and replaces internal-review wording with concise English and Spanish public explanations.

## Preview on your computer

Unzip the Website folder, open it in VS Code, and use a terminal in that folder:

```bash
npm ci
npm run dev
```

Open the Local URL printed by Vite, then navigate to `/dashboard`.

`npm run build` performs the production build check.

## Changes to inspect

1. Energy, Retrofit and Renewable: published color scales and short reading steps
   on the left; plain-language metric definitions on the right.
2. Renewable: estimated annual PV electricity and its assumptions are the primary
   information. The household comparison is a secondary, default-collapsed
   optional reference below the indicator definitions; results use plain text
   rather than a large highlighted household count. The PV input starts empty and
   does not follow building selection. No household-equivalence result is displayed
   until a valid value is entered. Annual-total equivalence is explicitly separated
   from continuous electricity supply. Open Reference & calculation for the EIA
   denominator and formula. 277.7 MWh/year at 10,791 kWh/year gives about 25.7
   home-equivalents; zero remains zero and blank/invalid input has no result.
3. Air Quality: short pollutant definitions and the DAISY source link.
4. EN/ES: newly added explanations, legends and comparison controls are bilingual.
5. Existing building popup: year formatting and missing-value handling are applied
   inside this website's scene viewer, without saving changes to ArcGIS Online.

## Validation and limits

- Production build and JavaScript syntax checks pass.
- Information controls, module switching, definition expansion, annual PV
  comparison (including zero and missing values), EN/ES and dark mode were checked
  in the browser.
- The cloud preview browser lacks WebGL2. Native 3D interaction and the actual
  popup appearance must still be verified on a compatible computer/browser.
- No Clarity credentials are bundled. Local observations show the existing
  unavailable-data state unless `.env.local` is configured with your API key.
  Never commit this file. Tableau and ArcGIS need internet access.
- Calculation methodology remains with the source ArcGIS project. Source values were not changed.

The VR application and the homepage were not changed in this revision.
