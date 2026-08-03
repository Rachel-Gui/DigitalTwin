import {
  ClarityConfigurationError,
  getClarityData,
} from "../server/clarity-data.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed." });
  }

  try {
    const data = await getClarityData({
      apiKey: process.env.CLARITY_API_KEY || process.env.CLARITY_API_TOKEN,
      org: process.env.CLARITY_ORG_ID || "daisy4I1NK",
    });
    response.setHeader(
      "Cache-Control",
      "public, s-maxage=17100, stale-while-revalidate=1800",
    );
    return response.status(200).json(data);
  } catch (error) {
    const configurationError = error instanceof ClarityConfigurationError;
    return response.status(configurationError ? 503 : error.status || 502).json({
      error: configurationError ? "Clarity Air API is not configured." : "Unable to load Clarity air-quality data.",
      detail: error.message,
    });
  }
}
