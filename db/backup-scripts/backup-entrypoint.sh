#!/bin/sh
set -e

echo "=========================================="
echo "PostgreSQL Backup Service Starting"
echo "=========================================="
echo "Database Host: $POSTGRES_HOST"
echo "Database Name: $POSTGRES_DB"
echo "Backup Schedule: Daily at 02:00 AM"
echo "Timezone: $TZ"
echo "=========================================="

# Install dcron (alpine's cron)
apk add --no-cache dcron

# Create cron job - runs daily at 2 AM
echo "0 2 * * * /scripts/backup.sh >> /var/log/cron.log 2>&1" > /etc/crontabs/root
# echo "* * * * * /scripts/backup.sh >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# Create log file
touch /var/log/cron.log

# Run initial backup
echo "Running initial backup..."
/scripts/backup.sh

# Start cron in foreground
echo "Starting cron daemon..."
crond -f -l 2