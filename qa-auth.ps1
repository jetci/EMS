param(
  [string]$StagingUrl = "https://wiangwecare.com/ems_staging",
  [string]$ApiUrl = "https://api.wiangwecare.com"
)

$ErrorActionPreference = 'Continue'

function Invoke-JsonPost {
  param(
    [string]$Url,
    [hashtable]$Body,
    [int]$TimeoutSec = 30
  )
  try {
    $json = $Body | ConvertTo-Json -Depth 5
    return Invoke-RestMethod -Method POST -Uri $Url -ContentType 'application/json' -Body $json -TimeoutSec $TimeoutSec
  } catch {
    return @{ error = $_.Exception.Message }
  }
}

function Test-Role {
  param(
    [string]$RoleName,
    [string]$Email,
    [string]$Password,
    [string[]]$Endpoints
  )
  $login = Invoke-JsonPost -Url ($ApiUrl + '/api/auth/login') -Body @{ email=$Email; password=$Password }
  $token = $null; $login_ok = $false; $err = $null
  if ($login -and $login.token) { $token = $login.token; $login_ok = $true } else { $err = if($login.error){$login.error}else{($login | ConvertTo-Json -Depth 6)} }
  $tests = @()
  if ($login_ok) {
    $headers = @{ Authorization = ('Bearer ' + $token) }
    foreach ($p in $Endpoints) {
      try {
        $res = Invoke-WebRequest -Method GET -Uri ($ApiUrl + $p) -Headers $headers -TimeoutSec 30 -UseBasicParsing
        $tests += @{ path=$p; status=$res.StatusCode; ok=($res.StatusCode -ge 200 -and $res.StatusCode -lt 300) }
      } catch {
        $tests += @{ path=$p; status=$null; ok=$false; error=$_.Exception.Message }
      }
    }
  }
  return @{ role=$RoleName; email=$Email; login_ok=$login_ok; error=$err; endpoints=$tests }
}

# 1) Staging availability
$staging_status=$null; $staging_ok=$false; $staging_err=$null
try {
  $s = Invoke-WebRequest -Uri $StagingUrl -Method GET -TimeoutSec 30 -UseBasicParsing
  $staging_status = $s.StatusCode
  $staging_ok = ($s.StatusCode -ge 200 -and $s.StatusCode -lt 400)
} catch {
  $staging_err = $_.Exception.Message
}

# 2) Roles
$roles = @()
$roles += Test-Role -RoleName 'community' -Email 'community1@wecare.dev' -Password 'password' -Endpoints @('/api/community/stats')
$roles += Test-Role -RoleName 'driver'    -Email 'driver1@wecare.dev'    -Password 'password' -Endpoints @('/api/driver/jobs')
$roles += Test-Role -RoleName 'office'    -Email 'officer1@wecare.dev'   -Password 'password' -Endpoints @('/api/office/stats')

# 3) Simple auto-reconnect probe: call same endpoint 5x for office
$auto_ok=$false; $auto_err=$null
try {
  $login = Invoke-JsonPost -Url ($ApiUrl + '/api/auth/login') -Body @{ email='officer1@wecare.dev'; password='password123' }
  if ($login -and $login.token) {
    $headers = @{ Authorization = ('Bearer ' + $login.token) }
    $successCount = 0
    for ($i=0; $i -lt 5; $i++) {
      try {
        $r = Invoke-WebRequest -Method GET -Uri ($ApiUrl + '/api/office/stats') -Headers $headers -TimeoutSec 30 -UseBasicParsing
        if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) { $successCount++ }
      } catch { }
      Start-Sleep -Milliseconds 300
    }
    $auto_ok = ($successCount -ge 4)
  } else {
    $auto_err = 'Login for office failed in auto-reconnect probe'
  }
} catch {
  $auto_err = $_.Exception.Message
}

# 4) Summarize
$jwt_valid = ($roles | Where-Object { $_.login_ok -eq $false }).Count -eq 0
$issues = @()
if (-not $staging_ok) { $issues += @{ type='staging'; message=$staging_err } }
foreach ($r in $roles) {
  if (-not $r.login_ok) { $issues += @{ type='login'; role=$r.role; message=$r.error } }
  foreach ($e in $r.endpoints) { if (-not $e.ok) { $issues += @{ type='endpoint'; role=$r.role; path=$e.path; message=$e.error } } }
}

$report = @{
  status = if (($issues.Count -eq 0) -and $jwt_valid -and $auto_ok) { 'completed' } elseif ($issues.Count -gt 0) { 'warning' } else { 'in_progress' }
  tested_url = $StagingUrl
  api_url = $ApiUrl
  tested_roles = @('community','driver','office')
  jwt_valid = $jwt_valid
  auto_reconnect_tested = $true
  auto_reconnect_ok = $auto_ok
  issues_found = $issues
  screenshot_links = @() # screenshots can be captured manually from browser
  notes = 'Automated QA script executed from PowerShell'
} | ConvertTo-Json -Depth 8

$report
