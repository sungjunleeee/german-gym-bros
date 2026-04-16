#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up German Gym Bros..."

# 1. Setup Backend
echo "📦 Setting up Backend (apps/api)..."
cd ./apps/api
if [ ! -d "venv" ]; then
    python -m venv venv
    echo "   Created virtual environment."
fi
source venv/bin/activate
pip install -r requirements.txt
echo "   Backend dependencies installed."
cd ../..

# 2. Setup Frontend
echo "🎨 Setting up Frontend (apps/web)..."
cd apps/web
npm install
echo "   Frontend dependencies installed."
cd ../..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: cd apps/api && source venv/bin/activate && python main.py"
echo "2. Frontend: cd apps/web && npm run dev"
