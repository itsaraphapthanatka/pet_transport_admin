#!/bin/bash

# ====================================================
# PetGo Admin Deployment Script
# ====================================================

set -e  # Exit on error

echo "🚀 Starting PetGo Admin deployment..."

# Configuration
APP_DIR="/var/www/admin.petgo.asia/pet_transport_admin"
LOG_DIR="/var/www/admin.petgo.asia/logs"
PM2_APP_NAME="petgo-admin"
CURRENT_DIR=$(pwd)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ====================================================
# Check if running from production directory
# ====================================================
if [ "$CURRENT_DIR" = "$APP_DIR" ]; then
    echo -e "${YELLOW}⚠️  Running from production directory${NC}"
    RUNNING_IN_PROD=true
else
    echo -e "${YELLOW}📍 Running from: $CURRENT_DIR${NC}"
    RUNNING_IN_PROD=false
fi

# ====================================================
# Step 1: Build the application
# ====================================================
echo -e "${YELLOW}📦 Building Next.js application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# ====================================================
# Step 2: Create necessary directories on server
# ====================================================
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p "$LOG_DIR"

# ====================================================
# Step 3: Copy files to production directory
# ====================================================
if [ "$RUNNING_IN_PROD" = false ]; then
    echo -e "${YELLOW}📤 Copying files to production...${NC}"

    # Copy standalone build
    cp -r .next/standalone/* "$APP_DIR/"

    # Copy static files to standalone directory
    mkdir -p "$APP_DIR/.next"
    cp -r .next/static "$APP_DIR/.next/"
    
    # Copy public files to standalone directory
    cp -r public "$APP_DIR/"

    # Copy configuration files
    cp ecosystem.config.js "$APP_DIR/"
    cp .env.production "$APP_DIR/.env.production"

    echo -e "${GREEN}✅ Files copied${NC}"
else
    echo -e "${YELLOW}⏭️  Skipping file copy (already in production directory)${NC}"
    
    # When running in prod, still need to ensure static files are in place
    echo -e "${YELLOW}📦 Ensuring static files are in place...${NC}"
    mkdir -p "$APP_DIR/.next"
    cp -r .next/static "$APP_DIR/.next/" 2>/dev/null || true
    cp -r public "$APP_DIR/" 2>/dev/null || true
fi

# ====================================================
# Step 4: Navigate to production directory
# ====================================================
cd "$APP_DIR"

# ====================================================
# Step 5: Restart PM2 process
# ====================================================
echo -e "${YELLOW}🔄 Restarting PM2 process...${NC}"

if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
    echo "Reloading existing PM2 process..."
    pm2 reload ecosystem.config.js
else
    echo "Starting new PM2 process..."
    pm2 start ecosystem.config.js
fi

pm2 save

echo -e "${GREEN}✅ PM2 process restarted${NC}"

# ====================================================
# Step 6: Show status
# ====================================================
echo -e "${YELLOW}📊 Application status:${NC}"
pm2 status "$PM2_APP_NAME"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Update nginx configuration: sudo cp nginx-config-standalone.conf /etc/nginx/sites-available/admin.petgo.asia"
echo "2. Restart nginx: sudo systemctl restart nginx"
echo "3. Check logs: pm2 logs $PM2_APP_NAME"
echo ""
