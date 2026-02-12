# Create Sample News Items for Testing
Write-Host "Creating sample news items..." -ForegroundColor Cyan

# Login as admin
$loginBody = @{
    email = "admin@wecare.ems"
    password = "Admin@123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Sample news items
$newsItems = @(
    @{
        title = "New Emergency Response Protocol"
        content = "We are pleased to announce the implementation of a new emergency response protocol that will improve our response times by 30%. This protocol includes enhanced communication systems and optimized routing algorithms."
        author_name = "Dr. Somchai Prasert"
        category = "protocol"
        tags = @("emergency", "protocol", "update")
        is_published = $true
        published_date = (Get-Date).AddDays(-2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    },
    @{
        title = "Community Health Workshop - February 2026"
        content = "Join us for a free community health workshop on emergency preparedness. Learn basic first aid, CPR, and how to respond in medical emergencies. Registration is now open!"
        author_name = "Community Relations Team"
        category = "event"
        tags = @("community", "workshop", "training")
        is_published = $true
        published_date = (Get-Date).AddDays(-5).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    },
    @{
        title = "Fleet Expansion: 5 New Ambulances"
        content = "WeCare EMS is expanding our fleet with 5 state-of-the-art ambulances equipped with advanced life support systems. This expansion will help us serve more communities across the region."
        author_name = "Operations Director"
        category = "announcement"
        tags = @("fleet", "expansion", "equipment")
        is_published = $true
        published_date = (Get-Date).AddDays(-7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    },
    @{
        title = "Monthly Performance Report - January 2026"
        content = "Our team successfully completed 1,247 emergency calls in January with an average response time of 8.5 minutes. Thank you to all our dedicated staff and volunteers!"
        author_name = "Executive Team"
        category = "report"
        tags = @("performance", "statistics", "report")
        is_published = $true
        published_date = (Get-Date).AddDays(-10).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    }
)

foreach ($news in $newsItems) {
    try {
        $newsBody = $news | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/news" -Method Post -Body $newsBody -Headers $headers
        Write-Host "Created: $($response.id) - $($news.title)" -ForegroundColor Green
    } catch {
        Write-Host "Failed to create: $($news.title)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Sample news items created successfully!" -ForegroundColor Green
Write-Host "Visit http://localhost:5173/news to view them" -ForegroundColor Yellow
