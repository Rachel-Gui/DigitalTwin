import { AIR_QUALITY_DAYS, AIR_QUALITY_ROWS, AIR_QUALITY_SOURCE } from "../../app/data/airQualityData.ts";

const errors = [];
if (AIR_QUALITY_SOURCE.recordCount !== 7791 || AIR_QUALITY_ROWS.length !== 7791) errors.push("Embedded record count must be 7,791");
if (AIR_QUALITY_DAYS.length !== 325) errors.push("Embedded day count must be 325");
if (AIR_QUALITY_SOURCE.sha256 !== "80ea76c9f2ba4770d10339bbadd6f5302c23e4c987f3ada928cecd8cbe75f756") errors.push("Unexpected Excel source fingerprint");

for (const [index, row] of AIR_QUALITY_ROWS.entries()) {
  if (!Number.isInteger(row[0]) || String(row[0]).length !== 10) errors.push(`Invalid local date-hour at row ${index}`);
  if (!Number.isFinite(row[1]) || row[1] < 0) errors.push(`Invalid PM2.5 at row ${index}`);
  if (row[2] !== null && (row[2] < 0 || row[2] > 360)) errors.push(`Invalid wind direction at row ${index}`);
  if (row[3] !== null && row[3] < 0) errors.push(`Invalid wind speed at row ${index}`);
  if (errors.length > 20) break;
}

const demo = AIR_QUALITY_ROWS.filter((row) => String(row[0]).startsWith("20250129"));
if (demo.length !== 24) errors.push(`Expected 24 records for 2025-01-29, found ${demo.length}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${AIR_QUALITY_ROWS.length} embedded Excel records across ${AIR_QUALITY_DAYS.length} days.`);
}
