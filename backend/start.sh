#!/bin/bash

# SIFUT Backend Startup Script

echo "🚀 Starting SIFUT Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before running this script again."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Check if Docker services are running
echo "🐳 Checking Docker services..."
if ! docker-compose ps | grep -q "Up"; then
    echo "🐳 Starting Docker services (PostgreSQL + Redis)..."
    docker-compose up -d
    echo "⏳ Waiting for database to be ready..."
    sleep 5
fi

# Run migrations
echo "🗄️  Running database migrations..."
alembic upgrade head

# Start the server
echo "✅ Starting FastAPI server..."
echo "📚 API Documentation will be available at:"
echo "   - Swagger UI: http://localhost:8000/docs"
echo "   - ReDoc: http://localhost:8000/redoc"
echo ""
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
