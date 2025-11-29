# German Gym Bros

A fitness application for generating and managing workout plans for squads.

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS v4, TypeScript
- **Backend**: Python, FastAPI

## Getting Started

### 1. Backend (API)

The backend runs on port `8000`.

```bash
cd apps/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt  # or pip install fastapi uvicorn numpy
python main.py
```

### 2. Frontend (Web)

The frontend runs on port `3000`.

```bash
cd apps/web
npm install
npm run dev
```

## Features

- **Daily Plan**: Dashboard for PT schedules and squad readiness.
- **Build New Plan**: Interactive AI chat to generate custom workout plans.
