#!/bin/bash
# Setup Automated Backup - Linux/Mac Cron Job
# Run this script to setup automated backup

echo "========================================"
echo "🔧 Setting up Automated Database Backup"
echo "========================================"
echo ""

# Configuration
SCRIPT_PATH="/path/to/wecare-backend/scripts/backup-database.sh"
CRON_SCHEDULE="0 2 * * *"  # Daily at 2 AM

echo "📋 Configuration:"
echo "   Script Path: $SCRIPT_PATH"
echo "   Schedule: Daily at 2:00 AM"
echo ""

# Check if script exists
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Error: Backup script not found at $SCRIPT_PATH"
    echo "   Please update SCRIPT_PATH in this setup script."
    exit 1
fi

echo "✅ Backup script found"
echo ""

# Make script executable
chmod +x "$SCRIPT_PATH"
echo "✅ Script made executable"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "$SCRIPT_PATH"; then
    echo "⚠️  Cron job already exists for this script"
    read -p "Do you want to replace it? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remove existing cron job
        crontab -l 2>/dev/null | grep -v "$SCRIPT_PATH" | crontab -
        echo "🗑️  Existing cron job removed"
    else
        echo "❌ Setup cancelled"
        exit 0
    fi
fi

echo ""
echo "🔄 Adding cron job..."

# Add cron job
(crontab -l 2>/dev/null; echo "$CRON_SCHEDULE $SCRIPT_PATH") | crontab -

echo ""
echo "✅ Cron job added successfully!"
echo ""

# Show current crontab
echo "📋 Current Cron Jobs:"
echo "----------------------------------------"
crontab -l
echo "----------------------------------------"
echo ""

# Test backup now (optional)
read -p "🧪 Would you like to run a test backup now? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔄 Running test backup..."
    bash "$SCRIPT_PATH"
    echo ""
    echo "✅ Test backup completed!"
fi

echo ""
echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "📝 Next Steps:"
echo "   1. Verify backup directory exists"
echo "   2. Check backup logs regularly"
echo "   3. Test restore process"
echo "   4. Consider cloud backup (AWS S3)"
echo ""
echo "🔍 To verify cron job:"
echo "   crontab -l"
echo ""
echo "🗑️  To remove cron job:"
echo "   crontab -e  # Then delete the line"
echo ""
