import assert from "node:assert/strict";
import test from "node:test";
import { AIR_QUALITY_DAYS, AIR_QUALITY_ROWS, AIR_QUALITY_SOURCE } from "../app/data/airQualityData.ts";

test("embeds the complete original Excel source in application code", () => {
  assert.equal(AIR_QUALITY_SOURCE.sha256, "80ea76c9f2ba4770d10339bbadd6f5302c23e4c987f3ada928cecd8cbe75f756");
  assert.equal(AIR_QUALITY_SOURCE.recordCount, 7791);
  assert.equal(AIR_QUALITY_ROWS.length, 7791);
  assert.equal(AIR_QUALITY_DAYS.length, 325);
  assert.equal(AIR_QUALITY_SOURCE.firstLocalHour, "2025-01-02 09:00");
  assert.equal(AIR_QUALITY_SOURCE.lastLocalHour, "2025-11-22 23:00");
});

test("preserves the complete 2025-01-29 Grasshopper sequence", () => {
  const rows = AIR_QUALITY_ROWS.filter((row) => String(row[0]).startsWith("20250129"));
  assert.equal(rows.length, 24);
  assert.deepEqual(rows.map((row) => Number(String(row[0]).slice(8, 10))), Array.from({ length: 24 }, (_, hour) => hour));
  assert.deepEqual(rows.slice(0, 4).map((row) => row[1]), [9.79, 9.54, 11.99, 12.88]);
  assert.equal(rows[6][2], null);
  assert.equal(rows[6][3], null);
});

test("embedded rows preserve nullable wind and valid numeric ranges", () => {
  for (const row of AIR_QUALITY_ROWS) {
    assert.ok(row[1] >= 0);
    assert.ok(row[2] === null || (row[2] >= 0 && row[2] <= 360));
    assert.ok(row[3] === null || row[3] >= 0);
  }
});
