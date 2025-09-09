#!/bin/bash

# Supabase Keep-Alive Cron Job
# This script can be added to your crontab to automatically keep Supabase alive
# 
# To add to crontab, run: crontab -e
# Then add this line (runs every 5 minutes):
# */5 * * * * /path/to/your/project/scripts/cron-keep-alive.sh

# Configuration
PROJECT_DIR="/Users/deepakpandey/Sih"
KEEP_ALIVE_URL="https://pathniti.vercel.app/api/keep-alive"
LOG_FILE="$PROJECT_DIR/logs/keep-alive.log"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Function to ping keep-alive endpoint
ping_keep_alive() {
    local response=$(curl -s -w "%{http_code}" -o /dev/null "$KEEP_ALIVE_URL" 2>/dev/null)
    local status_code=$?
    
    if [ $status_code -eq 0 ] && [ "$response" = "200" ]; then
        log "✅ Keep-alive successful (HTTP $response)"
        return 0
    else
        log "❌ Keep-alive failed (HTTP $response, curl exit code: $status_code)"
        return 1
    fi
}

# Main execution
log "🔄 Starting keep-alive ping to $KEEP_ALIVE_URL"

if ping_keep_alive; then
    log "✅ Keep-alive completed successfully"
    exit 0
else
    log "❌ Keep-alive failed"
    exit 1
fi
