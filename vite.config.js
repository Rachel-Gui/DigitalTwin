import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import {
  ClarityConfigurationError,
  getClarityData,
} from "./server/clarity-data.js";

function clarityApi(token) {
  return {
    name: "local-clarity-api",
    configureServer(server) {
      server.middlewares.use("/api/clarity", async (request, response) => {
        if (request.method !== "GET") {
          response.statusCode = 405;
          response.end(JSON.stringify({ error: "Method not allowed." }));
          return;
        }
        try {
          const data = await getClarityData({
            apiKey: token,
            org: process.env.CLARITY_ORG_ID || "daisy4I1NK",
          });
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify(data));
        } catch (error) {
          response.statusCode = error instanceof ClarityConfigurationError
            ? 503
            : error.status || 502;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({
            error: error instanceof ClarityConfigurationError
              ? "Clarity Air API is not configured."
              : "Unable to load Clarity air-quality data.",
            detail: error.message,
          }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), clarityApi(
      env.CLARITY_API_KEY
      || env.CLARITY_API_TOKEN
      || process.env.CLARITY_API_KEY
      || process.env.CLARITY_API_TOKEN
    )],
  };
});
