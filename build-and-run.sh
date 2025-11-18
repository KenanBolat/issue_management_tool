#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Building Satellite Ticket Management System${NC}"

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
echo -e "${YELLOW}📍 Detected Server IP: ${SERVER_IP}${NC}"

# Update frontend environment file
echo -e "${YELLOW}📝 Updating frontend configuration...${NC}"
echo "VITE_API_BASE_URL=http://${SERVER_IP}:5221/api" > client/.env.production

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

# Build and start services
echo -e "${YELLOW}🏗️  Building containers...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check service status
echo -e "${GREEN}✅ Service Status:${NC}"
docker-compose ps

echo -e "\n${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}Frontend: http://${SERVER_IP}${NC}"
echo -e "${GREEN}Backend API: http://${SERVER_IP}:5221${NC}"
echo -e "${GREEN}Database: ${SERVER_IP}:5434${NC}"
echo -e "\n${YELLOW}Access from other computers: http://${SERVER_IP}${NC}"