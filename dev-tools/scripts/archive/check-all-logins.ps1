$baseUrl = "http://localhost:5000/api"
$users = @(
    @{ role = "DEVELOPER"; email = "jetci.jm@gmail.com"; pass = "g0KEk,^],k;yo" },
    @{ role = "ADMIN"; email = "admin@wecare.dev"; pass = "password" },
    @{ role = "OFFICE"; email = "office1@wecare.dev"; pass = "password" },
    @{ role = "DRIVER"; email = "driver1@wecare.dev"; pass = "password" },
    @{ role = "COMMUNITY"; email = "community1@wecare.dev"; pass = "password" },
    @{ role = "OFFICER"; email = "officer1@wecare.dev"; pass = "password" },
    @{ role = "EXECUTIVE"; email = "executive1@wecare.dev"; pass = "password" }
)

foreach ($u in $users) {
    $body = @{ email = $u.email; password = $u.pass } | ConvertTo-Json
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
        Write-Host "Login $($u.role): PASS" -ForegroundColor Green
    }
    catch {
        Write-Host "Login $($u.role): FAIL ($($_.Exception.Message))" -ForegroundColor Red
    }
}
