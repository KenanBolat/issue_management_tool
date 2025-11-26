#!/bin/sh
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"

# Create directories

echo "=========================================="
echo "Backup Started: $(date)"
echo "=========================================="

# Daily backup
DAILY_BACKUP="${BACKUP_DIR}/satellite_tickets_${TIMESTAMP}.sql.gz"
echo "Creating daily backup: $DAILY_BACKUP"

PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=plain --clean --if-exists --create --blobs --encoding=UTF8 --verbose 2>&1 | gzip > "$DAILY_BACKUP"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$DAILY_BACKUP" | cut -f1)
    echo "✓ Daily backup completed successfully: $BACKUP_SIZE"
else
    echo "✗ Daily backup failed!"
    exit 1
fi


# Show backup statistics
echo "=========================================="
echo "Backup Statistics:"
echo "Daily backups: $(ls -1 $DAILY_DIR | wc -l)"
echo "Total disk usage: $(du -sh $BACKUP_DIR | cut -f1)"
echo "=========================================="
echo "Backup Completed: $(date)"
echo "=========================================="