# Test News API endpoints
Write-Host "=== Testing News API Endpoints ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: GET /api/news
Write-Host "Test 1: GET /api/news" -ForegroundColor Yellow
$response1 = Invoke-RestMethod -Uri "http://localhost:3001/api/news" -Method Get
Write-Host "Response: $($response1 | ConvertTo-Json -Depth 3)" -ForegroundColor Green
Write-Host ""

# Test 2: GET /api-proxy/news.php
Write-Host "Test 2: GET /api-proxy/news.php" -ForegroundColor Yellow
$response2 = Invoke-RestMethod -Uri "http://localhost:3001/api-proxy/news.php" -Method Get
Write-Host "Response: $($response2 | ConvertTo-Json -Depth 3)" -ForegroundColor Green
Write-Host ""

# Test 3: Create a test news item (requires authentication)
Write-Host "Test 3: Login as admin to create news" -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@wecare.ems"
        password = "Admin@123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login successful! Token: $($token.Substring(0, 20))..." -ForegroundColor Green
    Write-Host ""

    # Create news item
    Write-Host "Test 4: Create news item" -ForegroundColor Yellow
    $newsBody = @{
        title = "Welcome to WeCare EMS"
        content = "This is a test news article for the WeCare Emergency Medical Services system. We are excited to announce the launch of our new platform!"
        author_name = "Admin"
        category = "announcement"
        tags = @("system", "announcement")
        is_published = $true
        published_date = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $createResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/news" -Method Post -Body $newsBody -Headers $headers
    Write-Host "News created: $($createResponse.id)" -ForegroundColor Green
    Write-Host ""

    # Test 5: GET news again to verify
    Write-Host "Test 5: GET /api-proxy/news.php (should now have 1 item)" -ForegroundColor Yellow
    $response3 = Invoke-RestMethod -Uri "http://localhost:3001/api-proxy/news.php" -Method Get
    Write-Host "Response: $($response3 | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    Write-Host ""

    # Test 6: GET single news item
    Write-Host "Test 6: GET /api-proxy/news_item.php?id=$($createResponse.id)" -ForegroundColor Yellow
    $response4 = Invoke-RestMethod -Uri "http://localhost:3001/api-proxy/news_item.php?id=$($createResponse.id)" -Method Get
    Write-Host "Response: $($response4 | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    Write-Host ""

    Write-Host "=== All Tests Passed! ===" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
}
