import process from "node:process";
import { getClarityData } from "../server/clarity-data.js";

const result = await getClarityData({
  apiKey: process.env.CLARITY_API_KEY || process.env.CLARITY_API_TOKEN,
  org: process.env.CLARITY_ORG_ID || "daisy4I1NK",
});

console.log(JSON.stringify({
  status: "connected",
  period: result.period,
  fetchedAt: result.fetchedAt,
  newestMeasurementAt: result.newestMeasurementAt,
  summary: result.summary,
  sourceCount: result.sources.length,
  sourcesWithPm25: result.sources.filter((source) => Number.isFinite(source.metrics.pm25?.value)).length,
}, null, 2));
