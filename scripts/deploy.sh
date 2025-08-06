#!/bin/bash

# WIMM Backend Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environments: development, staging, production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-development}

echo -e "${BLUE}🚀 WIMM Backend Deployment Script${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo -e "${RED}❌ Invalid environment. Use: development, staging, or production${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if required files exist
if [[ ! -f "docker-compose.yml" ]]; then
    echo -e "${RED}❌ docker-compose.yml not found${NC}"
    exit 1
fi

# Environment-specific configurations
case $ENVIRONMENT in
    "development")
        COMPOSE_FILE="docker-compose.dev.yml"
        echo -e "${YELLOW}📝 Using development configuration${NC}"
        ;;
    "staging")
        COMPOSE_FILE="docker-compose.yml"
        echo -e "${YELLOW}📝 Using staging configuration${NC}"
        ;;
    "production")
        COMPOSE_FILE="docker-compose.yml"
        echo -e "${YELLOW}📝 Using production configuration${NC}"
        ;;
esac

# Check if compose file exists
if [[ ! -f "$COMPOSE_FILE" ]]; then
    echo -e "${RED}❌ $COMPOSE_FILE not found${NC}"
    exit 1
fi

# Pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Check environment variables
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo -e "${YELLOW}⚠️  Production deployment detected${NC}"
    echo -e "${YELLOW}⚠️  Make sure to update environment variables in docker-compose.yml${NC}"
    echo -e "${YELLOW}⚠️  Especially JWT_SECRET and database passwords${NC}"
    read -p "Continue with production deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose -f $COMPOSE_FILE down --remove-orphans

# Pull latest images (for production)
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo -e "${BLUE}📥 Pulling latest images...${NC}"
    docker-compose -f $COMPOSE_FILE pull
fi

# Build and start services
echo -e "${BLUE}🏗️  Building and starting services...${NC}"
docker-compose -f $COMPOSE_FILE up -d --build

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check service health
echo -e "${BLUE}🏥 Checking service health...${NC}"

# Check API health
API_HEALTH=$(docker-compose -f $COMPOSE_FILE exec -T api wget --no-verbose --tries=1 --spider http://localhost:3010/health 2>&1 || echo "failed")
if [[ "$API_HEALTH" == *"failed"* ]]; then
    echo -e "${RED}❌ API health check failed${NC}"
    docker-compose -f $COMPOSE_FILE logs api
    exit 1
else
    echo -e "${GREEN}✅ API is healthy${NC}"
fi

# Check database health
DB_HEALTH=$(docker-compose -f $COMPOSE_FILE exec -T mysql mysqladmin ping -h localhost -u root -proot_password_change_me 2>&1 || echo "failed")
if [[ "$DB_HEALTH" == *"failed"* ]]; then
    echo -e "${RED}❌ Database health check failed${NC}"
    docker-compose -f $COMPOSE_FILE logs mysql
    exit 1
else
    echo -e "${GREEN}✅ Database is healthy${NC}"
fi

# Show running services
echo -e "${BLUE}📋 Running services:${NC}"
docker-compose -f $COMPOSE_FILE ps

# Show logs
echo -e "${BLUE}📝 Recent logs:${NC}"
docker-compose -f $COMPOSE_FILE logs --tail=20

# Deployment summary
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}📍 API URL: http://localhost:3010${NC}"
echo -e "${GREEN}📚 API Docs: http://localhost:3010/api-docs${NC}"
echo -e "${GREEN}🏥 Health Check: http://localhost:3010/health${NC}"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo -e "  View logs: ${YELLOW}docker-compose -f $COMPOSE_FILE logs -f${NC}"
echo -e "  Stop services: ${YELLOW}docker-compose -f $COMPOSE_FILE down${NC}"
echo -e "  Restart API: ${YELLOW}docker-compose -f $COMPOSE_FILE restart api${NC}"
echo -e "  Shell into API: ${YELLOW}docker-compose -f $COMPOSE_FILE exec api sh${NC}"
echo ""