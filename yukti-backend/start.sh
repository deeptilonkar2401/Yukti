#!/bin/bash
# YUKTI Backend Reliable Launcher Script
cd "$(dirname "$0")"
export PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1
echo "Starting YUKTI FastAPI Backend on http://127.0.0.1:8000..."

if [ -f "./venv/bin/uvicorn" ]; then
    ./venv/bin/python -m uvicorn app.main:app --reload --port 8000
else
    python3 -m uvicorn app.main:app --reload --port 8000
fi
