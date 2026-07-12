# VeloKinetix

AI-powered MTB bike fit analysis. Upload a few rider/bike photos, pick your riding style, and get
structured fit recommendations — rider position tweaks and bike adjustments, split by cost — via
Google Gemini vision.

Budget-conscious alternative to a paid professional bike fit, and a full-stack + AI portfolio piece.

## Stack

| Layer | Tech | Location |
|---|---|---|
| Frontend | React + Vite (TypeScript) | `client/` |
| Backend | C# / .NET 10 Web API | `service/` |
| AI | Google Gemini (vision, structured JSON output) | called from `service/` via `HttpClient` |
| Frontend hosting | GitHub Pages | — |
| API hosting | Azure App Service (free tier) | — |

No official Gemini SDK — the backend makes a direct `HttpClient` call against the Gemini REST
endpoint, using `responseSchema` to get structured JSON back instead of parsing free text.

## Repository structure

```
velo-kinetix/
├── client/    # React + Vite SPA
└── service/   # .NET 10 Web API
    └── VeloKinetix.Api/
        ├── Controllers/    # FitAnalysisController — /health, /analyse
        ├── Models/         # Request/response shapes
        ├── Services/       # ValidationService, PromptService, GeminiService
        └── Middleware/     # RequestLoggingMiddleware
```

## Running locally

### Backend

```
cd service/VeloKinetix.Api
dotnet run --launch-profile http
```

Listens on `http://localhost:5030`. Needs a Gemini API key — copy your key into
`appsettings.Development.json`:

```json
{
  "Gemini": { "ApiKey": "YOUR_KEY_HERE" }
}
```

Free key: [aistudio.google.com](https://aistudio.google.com). This file is git-ignored.

### Frontend

```
cd client
npm install
npm run dev
```

Serves on `http://localhost:5173` (already whitelisted in the backend's dev CORS config) and
points at the local API via `client/.env.development`.

## API

```
POST /api/fitanalysis/analyse
GET  /api/fitanalysis/health
```

Request body:

```json
{
  "ridingStyle": "Trail",
  "riderNotes": "Lower back pain on long rides, right knee tracks inward",
  "photos": [
    { "photoType": "profile_drive", "base64Data": "<base64, no data URI prefix>", "mimeType": "image/jpeg" }
  ]
}
```

`ridingStyle` is one of: `Commuter`, `Adventure/Gravel`, `Cross Country`, `Trail`, `Enduro`,
`Downhill`, `Road`. `photoType` is one of: `profile_drive`, `front_on`, `bike_static`.
`profile_drive` is required; `front_on` and `bike_static` are recommended but optional.

Success response:

```json
{
  "success": true,
  "ridingStyle": "Trail",
  "riderAdjustments": [{ "title": "...", "detail": "...", "impact": "High|Medium|Low", "zone": "..." }],
  "bikeAdjustments": { "free": [], "lowCost": [], "highCost": [] },
  "analysisLimitations": ["..."],
  "disclaimer": "..."
}
```

Errors: `400` with `{ "errors": [...] }` for validation failures, `502` with `{ "error": "..." }`
for Gemini upstream failures.

## Deployment

Manual for v1 — API to Azure App Service (F1 free tier), frontend to GitHub Pages. No CI/CD yet
(backlog item, along with unit tests).

## Disclaimer

Fit recommendations are AI-generated from photos and are not a substitute for a professional
in-person bike fit.
