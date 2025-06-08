#!/bin/bash

echo "🍷 Wine Inventory Management System - Local Setup"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed and running."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the DATABASE_URL in .env file with your PostgreSQL credentials"
else
    echo "✅ .env file already exists"
fi

# Create uploads directory
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir uploads
fi

# Check if database is accessible (optional)
echo "🔍 Testing database connection..."
if npm run db:push --silent 2>/dev/null; then
    echo "✅ Database connection successful"
else
    echo "⚠️  Database connection failed. Please check your DATABASE_URL in .env"
    echo "   Example: postgresql://postgres:password@localhost:5432/wine_inventory"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with correct database credentials"
echo "2. Run 'npm run db:push' to set up the database schema"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "The application will be available at: http://localhost:5000"