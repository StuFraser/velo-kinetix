# VeloKinetix

**Photo-based bike fit analysis for recreational cyclists.**

VeloKinetix helps riders find out if their bike setup is in the right ballpark — before they ride 1000km on a position that's wrecking their knees. Upload four photos, get specific things to try. No fitter required to get started.

---

## What It Does

A rider uploads four photos and their wheel size. VeloKinetix uses computer vision to extract body angles and bike geometry, then produces a small set of specific, actionable experiments to try — not just a list of measurements.

> *"Your knee angle suggests your saddle may be slightly high — try dropping it 10–15mm and ride for a week."*

This is not a replacement for a professional bike fit. It's the thing you do before spending 1000km on a setup that might be obviously wrong.

---

## Target User

Recreational riders, newer cyclists, people who bought a bike and just ride it. Not experienced riders chasing 2.5mm stem adjustments — they're already deep in the rabbit hole.

---

## Photo Set

| # | Photo | Purpose |
|---|---|---|
| 1 | Rider profile — drive side, pedals horizontal | Knee angle, hip angle, back angle, reach |
| 2 | Rider profile — non-drive side, pedals horizontal | Left-side keypoints, asymmetry detection |
| 3 | Rider front on, seated | Knee tracking, symmetry, shoulder vs bar width |
| 4 | Bike only, ~45° angle | Bike geometry via ellipse calibration |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Frontend (React + Vite + TypeScript + Tailwind) │
│  Deployed: GitHub Pages                          │
└─────────────────────┬───────────────────────────┘
                      │ HTTP
┌─────────────────────▼───────────────────────────┐
│  Backend (FastAPI / Python)                      │
│  Deployed: Cloud (TBD — Google Cloud Run)        │
│                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │  RTMPose    │  │ Gemini Vision│  │  Groq   │ │
│  │  (Docker)   │  │  (bike geo)  │  │ (text)  │ │
│  │             │  │              │  │         │ │
│  │ Photos 1,2,3│  │   Photo 4    │  │Analysis │ │
│  │ Pose + conf │  │ Ellipse cal. │  │ & recs  │ │
│  └─────────────┘  └──────────────┘  └─────────┘ │
└─────────────────────────────────────────────────┘
```

### Layer 1 — Rider Pose (RTMPose)
Photos 1, 2, 3 are processed by RTMPose running in a Docker container. Extracts joint keypoints and confidence scores. Confidence uses a weakest-link model — critical joints (knee, hip, ankle) weighted more heavily than non-critical. Thresholds: >70% proceed, 50–70% warn, <50% hard stop.

### Layer 2 — Bike Geometry (Gemini Vision)
Photo 4 (bike at ~45°) is sent to Gemini Vision with the known wheel diameter as a reference. The wheel appears as an ellipse in the angled photo — using Pythagoras on the major/minor axes derives the camera angle, which is then used to extract real-world measurements (bar width, stem length, saddle height, BB height, Q-factor approximation).

### Layer 3 — Fit Analysis (Groq)
Combined rider pose data and bike geometry are sent as a structured text prompt to Groq. The LLM produces specific actionable experiments, calibrated to the confidence level of each measurement. Items outside scope (cleat position, brake lever angle, bar roll) are explicitly referred out rather than ignored.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| Pose estimation | RTMPose (Docker container) |
| Bike geometry | Gemini Vision API |
| Fit analysis | Groq API (text LLM) |
| Frontend hosting | GitHub Pages |
| Backend hosting | TBD (Google Cloud Run candidate) |
| Version control | GitHub |

---

## Repo Structure

```
velokinetix/
├── frontend/          # React/Vite/TS app
│   ├── src/
│   ├── public/
│   └── vite.config.ts
├── backend/           # FastAPI service
│   ├── app/
│   │   ├── routers/
│   │   ├── services/  # RTMPose, Gemini, Groq integrations
│   │   └── models/    # Pydantic schemas
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml # Local dev: FastAPI + RTMPose
└── README.md
```

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker + Docker Compose
- API keys: Gemini, Groq (see `.env.example`)

### Setup

```bash
# Clone
git clone https://github.com/your-username/velokinetix.git
cd velokinetix

# Backend
cp backend/.env.example backend/.env
# Add your API keys to backend/.env

# Start backend + RTMPose via Docker Compose
docker-compose up

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:8000`.

---

## Metadata Inputs

| Field | Required | Source |
|---|---|---|
| Rear wheel size (e.g. `29x2.4`) | Yes | Printed on tyre sidewall |
| Crank length (e.g. `175mm`) | No | Stamped on crank arm |
| Bar width (e.g. `780mm`) | No | Measure across bars |
| Bike make / model / year / size | No | Used for geometry lookup |

---

## What VeloKinetix Measures

| Measurement | Source | Confidence |
|---|---|---|
| Knee angle (both sides) | Photos 1 + 2 | High |
| Hip angle | Photos 1 + 2 | High |
| Back / torso angle | Photos 1 + 2 | High |
| Knee tracking / symmetry | Photo 3 | High |
| Shoulder vs bar width | Photo 3 | Medium |
| Bar width | Photo 4 | Medium |
| Saddle height from BB | Photo 4 | Medium |
| Stem length | Photo 4 | Medium |
| Q-factor (approximate) | Photo 4 | Low |

## What VeloKinetix Does Not Measure

These require a professional fitter:

- Cleat position
- Brake lever angle and reach
- Bar roll
- Saddle tilt (precisely)
- Dynamic fit under load and fatigue

---

## Confidence System

VeloKinetix uses RTMPose keypoint confidence scores to determine whether results are reliable enough to act on.

- **Above 70%** — results shown, proceed with recommendations
- **50–70%** — results shown with warning, professional validation recommended
- **Below 50%** — hard stop, user asked to retake the affected photo

A confident "we can't tell" builds more trust than a hedged answer that turns out to be wrong.

---

## Project Status

Early development. Architecture validated, CV pipeline in progress.

See `VeloKinetix-Kanban.xlsx` for full backlog.

---

## Scope

VeloKinetix is not "replace a bike fitter." It's "before you ride 1000km on a setup that's wrecking your knees, spend 10 minutes finding out if you're even close."

A proper fit costs $200–400 and can feel intimidating for casual riders. VeloKinetix bridges that gap.
