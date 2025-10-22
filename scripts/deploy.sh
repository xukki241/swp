#!/bin/bash

# PharmaFlow Deployment Script
# This script helps deploy the application to various environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    print_info "All prerequisites met"
}

# Function to backup database
backup_database() {
    print_info "Creating database backup..."
    
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    docker-compose exec -T db pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
    
    print_info "Backup created: $BACKUP_FILE"
}

# Function to deploy application
deploy() {
    local ENV=$1
    
    print_info "Deploying to $ENV environment..."
    
    # Load environment file
    if [ -f ".env.$ENV" ]; then
        export $(cat ".env.$ENV" | xargs)
    elif [ -f ".env" ]; then
        export $(cat ".env" | xargs)
    else
        print_error ".env file not found"
        exit 1
    fi
    
    # Backup database in production
    if [ "$ENV" = "production" ]; then
        backup_database
    fi
    
    # Pull latest images
    print_info "Pulling latest Docker images..."
    if [ "$ENV" = "production" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull
    else
        docker-compose pull
    fi
    
    # Stop old containers
    print_info "Stopping old containers..."
    docker-compose down
    
    # Start new containers
    print_info "Starting new containers..."
    if [ "$ENV" = "production" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    elif [ "$ENV" = "development" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    else
        docker-compose up -d
    fi
    
    # Wait for services to be healthy
    print_info "Waiting for services to be healthy..."
    sleep 10
    
    # Run migrations
    print_info "Running database migrations..."
    docker-compose exec -T api pnpm db:migrate
    
    # Health check
    print_info "Performing health check..."
    if curl -f http://localhost:${API_PORT:-3000}/health > /dev/null 2>&1; then
        print_info "API health check passed"
    else
        print_warning "API health check failed"
    fi
    
    print_info "Deployment completed successfully!"
}

# Function to rollback
rollback() {
    print_warning "Rolling back deployment..."
    
    # Stop current containers
    docker-compose down
    
    # Start previous version (you may need to adjust this based on your tagging strategy)
    docker-compose up -d
    
    print_info "Rollback completed"
}

# Function to view logs
view_logs() {
    local SERVICE=$1
    
    if [ -z "$SERVICE" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$SERVICE"
    fi
}

# Function to show status
show_status() {
    print_info "Service Status:"
    docker-compose ps
    
    print_info "\nResource Usage:"
    docker stats --no-stream
}

# Main script
case "$1" in
    deploy)
        check_prerequisites
        ENV=${2:-production}
        deploy "$ENV"
        ;;
    rollback)
        rollback
        ;;
    backup)
        backup_database
        ;;
    logs)
        view_logs "$2"
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|backup|logs|status} [environment|service]"
        echo ""
        echo "Commands:"
        echo "  deploy [environment]  - Deploy to environment (default: production)"
        echo "  rollback             - Rollback to previous version"
        echo "  backup               - Backup database"
        echo "  logs [service]       - View logs (all services or specific service)"
        echo "  status               - Show service status and resource usage"
        echo ""
        echo "Environments: development, staging, production"
        echo "Services: api, web, db, pgadmin"
        exit 1
        ;;
esac
