# Shared typography

Inter (body and controls) and Space Grotesk (headings) are self-hosted variable WOFF2 fonts, weight range 400–700, with Latin and Latin Extended subsets.

- Reference typography: https://infrared.city/ (inspected 2026-11-12).
- WOFF2 files: https://infrared.city/assets/fonts/ (same open-font families/subsets as the reference).
- Inter license: https://github.com/google/fonts/blob/main/ofl/inter/OFL.txt
- Space Grotesk license: https://github.com/google/fonts/blob/main/ofl/spacegrotesk/OFL.txt

License texts are included alongside the fonts. Shared definitions live in `public/styles/type-foundations.css`; main semantic rules live in `src/typography.css`. The independent VR app carries the same font resources and definitions so it can deploy separately. Brand artwork retains its original lettering. Pre-recorded video pixels are not re-typeset.
