# Setup Automated Backup - Windows Task Scheduler
# Run this script to create automated backup task

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up Automated Database Backup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$SCRIPT_PATH = "D:\EMS\wecare-backend\scripts\backup-database.ps1"
$TASK_NAME = "WeCare Database Backup"
$BACKUP_TIME = "02:00"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "   Script Path: $SCRIPT_PATH"
Write-Host "   Task Name: $TASK_NAME"
Write-Host "   Backup Time: $BACKUP_TIME daily"
Write-Host ""

# Check if script exists
if (-not (Test-Path $SCRIPT_PATH)) {
    Write-Host "Error: Backup script not found at $SCRIPT_PATH" -ForegroundColor Red
    Write-Host "Please ensure the backup script exists first." -ForegroundColor Yellow
    exit 1
}

Write-Host "Backup script found" -ForegroundColor Green
Write-Host ""

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $TASK_NAME -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Task '$TASK_NAME' already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to replace it? (Y/N)"
    
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host "Removing existing task..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TASK_NAME -Confirm:$false
        Write-Host "Existing task removed" -ForegroundColor Green
    }
    else {
        Write-Host "Setup cancelled" -ForegroundColor Red
        exit 0
    }
}

Write-Host ""
Write-Host "Creating scheduled task..." -ForegroundColor Cyan

try {
    # Create action
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$SCRIPT_PATH`""

    # Create trigger (daily at 2 AM)
    $trigger = New-ScheduledTaskTrigger -Daily -At $BACKUP_TIME

    # Create settings
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable:$false

    # Register task
    Register-ScheduledTask -TaskName $TASK_NAME -Action $action -Trigger $trigger -Settings $settings -Description "Automated daily backup of WeCare database" -User "SYSTEM" -RunLevel Highest

    Write-Host ""
    Write-Host "Scheduled task created successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Show task details
    Write-Host "Task Details:" -ForegroundColor Cyan
    Write-Host "   Name: $TASK_NAME"
    Write-Host "   Schedule: Daily at $BACKUP_TIME"
    Write-Host "   Script: $SCRIPT_PATH"
    Write-Host "   Status: Ready"
    Write-Host ""
    
    # Test backup now (optional)
    Write-Host "Would you like to run a test backup now? (Y/N)" -ForegroundColor Yellow
    $testResponse = Read-Host
    
    if ($testResponse -eq "Y" -or $testResponse -eq "y") {
        Write-Host ""
        Write-Host "Running test backup..." -ForegroundColor Cyan
        & $SCRIPT_PATH
        Write-Host ""
        Write-Host "Test backup completed!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Setup Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Verify backup directory exists"
    Write-Host "   2. Check backup logs regularly"
    Write-Host "   3. Test restore process"
    Write-Host "   4. Consider cloud backup (AWS S3/Azure Blob)"
    Write-Host ""
    Write-Host "To verify task:" -ForegroundColor Yellow
    Write-Host "   Get-ScheduledTask -TaskName '$TASK_NAME'"
    Write-Host ""
    Write-Host "To remove task:" -ForegroundColor Yellow
    Write-Host "   Unregister-ScheduledTask -TaskName '$TASK_NAME'"
    Write-Host ""

}
catch {
    Write-Host ""
    Write-Host "Error creating scheduled task:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Run PowerShell as Administrator"
    Write-Host "   2. Check script path is correct"
    Write-Host "   3. Ensure Task Scheduler service is running"
    Write-Host ""
    exit 1
}
