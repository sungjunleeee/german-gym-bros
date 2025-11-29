# German Gym Bros

A fitness application for generating and managing workout plans for squads.

## Quick Start

We provide a setup script to get you up and running quickly.

```bash
./setup.sh
```

This will install all dependencies for both the backend and frontend.

## Manual Setup

If you prefer to set up the environment manually, follow these steps:

### 1. Backend (API)

Navigate to the API directory, create a virtual environment, and install dependencies.

```bash
cd apps/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Frontend (Web)

Navigate to the Web directory and install Node.js dependencies.

```bash
cd apps/web
npm install
```

## Running the App

You need to run the backend and frontend in separate terminals.

### 1. Backend (API)

The backend runs on port `8000`. The database is automatically initialized on startup.

```bash
cd apps/api
source venv/bin/activate
python main.py
```

### 2. Frontend (Web)

The frontend runs on port `3000`.

```bash
cd apps/web
npm run dev
```

## Features

- **Daily Plan**: Dashboard for PT schedules and squad readiness.
- **Build New Plan**: Interactive AI chat to generate custom workout plans with a full-screen preview.
- **Weekly Plan**: View and manage your active weekly workout schedule.
