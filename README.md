# DecarbCityTwin frontend prototype

A responsive static React/Vite research platform prototype for the South Park / Duwamish Valley digital twin.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Clarity Air Monitoring data

Recent DAISY air-quality measurements are available on `/analytics` through the
server-only `/api/clarity` endpoint.

1. In the Clarity Air Dashboard, open the user profile and copy the active API key.
2. Copy `.env.example` to `.env.local`.
3. Add the key and organization locally:

   ```text
   CLARITY_API_KEY=your-api-key
   CLARITY_ORG_ID=daisy4I1NK
   ```

4. Restart `npm run dev` and open `/analytics`.

Never prefix the key with `VITE_`, place it in client code, or commit `.env.local`.
The backend uses the Clarity Air Monitoring v2 datasource and recent-measurement
endpoints and caches successful responses for 4 hours 45 minutes.

For a Vercel deployment, add `CLARITY_API_KEY` and `CLARITY_ORG_ID` under the
project's environment variables. The `api/clarity.js` serverless function will be
detected automatically.

## VR application link

The `/vr` module contains clickable Concord and South Park scene previews. Set
`VITE_VR_URL` to the public URL of the separately deployed WebXR application.
Local development defaults to `http://localhost:3000`.

## Production build

```bash
npm run build
```

## Notes

- The ArcGIS 3D viewer is embedded on `/dashboard` and requires network access.
- All scientific metrics and chart forms are explicitly illustrative placeholders.
- The external air-quality platform URL remains a placeholder.
- The only public backend endpoint is the server-side Clarity analytics proxy.
- No database, application authentication, LLM API, or custom 3D engine is included.
