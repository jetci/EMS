param(
  [Parameter(Mandatory=$true)] [string]$FtpHost,
  [Parameter(Mandatory=$true)] [int]$FtpPort,
  [Parameter(Mandatory=$true)] [string]$Username,
  [Parameter(Mandatory=$true)] [string]$LocalDir,
  [Parameter(Mandatory=$true)] [string]$RemoteDir,
  [string]$PasswordEnvVar = "FTP_PASS",
  [switch]$Passive
)

# Safe FTP deploy script
# - Prompts for password if the specified env var is not set
# - Attempts to backup remote folder by RNFR/RNTO (rename) if supported
# - Recursively creates remote directories and uploads files in binary mode

$ErrorActionPreference = 'Stop'

function Get-PlainPassword {
  param([string]$EnvVar)
  $envItem = Get-Item -Path "Env:$EnvVar" -ErrorAction SilentlyContinue
  if ($null -ne $envItem -and [string]::IsNullOrEmpty($envItem.Value) -eq $false) {
    return $envItem.Value
  }
  $secure = Read-Host -AsSecureString "Enter FTP password for $Username@${FtpHost}:${FtpPort}"
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function Test-FtpLogin {
  try {
    Write-Host "[PRECHECK] Testing FTP login at ${FtpHost}:${FtpPort}..." -ForegroundColor Cyan
    $req = New-FtpRequest -uriPath '/' -method ([System.Net.WebRequestMethods+Ftp]::ListDirectory)
    $resp = $req.GetResponse(); $resp.Close()
    Write-Host "[PRECHECK] FTP login OK" -ForegroundColor Green
    return $true
  } catch {
    Write-Error "[PRECHECK] FTP login failed: $($_.Exception.Message)"
    return $false
  }
}

function New-FtpRequest {
  param(
    [string]$uriPath,
    [string]$method,
    [string]$renameTo
  )
  $uri = "ftp://$FtpHost`:$FtpPort$uriPath"
  $req = [System.Net.FtpWebRequest]::Create($uri)
  $req.Credentials = New-Object System.Net.NetworkCredential($Username, $PlainPassword)
  $req.Method = $method
  $req.UseBinary = $true
  $req.KeepAlive = $false
  $req.UsePassive = $Passive.IsPresent
  if ($renameTo) { $req.RenameTo = $renameTo }
  return $req
}

function Test-FtpPathExists {
  param([string]$remotePath)
  try {
    $req = New-FtpRequest -uriPath $remotePath -method ([System.Net.WebRequestMethods+Ftp]::ListDirectory)
    $resp = $req.GetResponse()
    $resp.Close()
    return $true
  } catch {
    return $false
  }
}

function New-FtpDirectoryRecursive {
  param([string]$remoteDir)
  $parts = $remoteDir -split "/" | Where-Object { $_ -ne '' }
  $curr = ''
  foreach ($p in $parts) {
    $curr = "$curr/$p"
    if (-not (Test-FtpPathExists -remotePath $curr)) {
      try {
        $req = New-FtpRequest -uriPath $curr -method ([System.Net.WebRequestMethods+Ftp]::MakeDirectory)
        $resp = $req.GetResponse(); $resp.Close()
        Write-Host "[MKDIR] Created remote dir: $curr" -ForegroundColor DarkGreen
      } catch {
        Write-Warning "[MKDIR] Could not create: $curr ($($_.Exception.Message))"
      }
    }
  }
}

function Invoke-FtpRenameDirectory {
  param([string]$remoteDir, [string]$newNameOnly)
  # $newNameOnly should be name without path (RNTO requires sibling path)
  $req = New-FtpRequest -uriPath $remoteDir -method ([System.Net.WebRequestMethods+Ftp]::Rename) -renameTo $newNameOnly
  $resp = $req.GetResponse(); $resp.Close()
}

function Backup-RemoteDirectory {
  param([string]$remoteDir)
  if (-not (Test-FtpPathExists -remotePath $remoteDir)) { return $false }
  $parent = [System.IO.Path]::GetDirectoryName($remoteDir.Replace('/', [System.IO.Path]::DirectorySeparatorChar)) -replace '\\','/'
  if (-not $parent -or $parent -eq '') { $parent = '/' }
  $name = [System.IO.Path]::GetFileName($remoteDir)
  $stamp = (Get-Date).ToString('yyyyMMdd_HHmmss')
  $backupName = "${name}_backup_${stamp}"
  Write-Host "Attempting remote backup: $remoteDir -> $backupName" -ForegroundColor Yellow
  try {
    Invoke-FtpRenameDirectory -remoteDir $remoteDir -newNameOnly $backupName
    Write-Host "Backup completed: $backupName" -ForegroundColor Green
    return $true
  } catch {
    Write-Warning "Backup via RNFR/RNTO not supported or failed: $($_.Exception.Message)"
    return $false
  }
}

function Upload-DirectoryRecursive {
  param([string]$localDir, [string]$remoteDir)
  if (-not (Test-Path -Path $localDir)) { throw "Local directory not found: $localDir" }
  New-FtpDirectoryRecursive -remoteDir $remoteDir
  $items = Get-ChildItem -Path $localDir -Recurse
  foreach ($it in $items) {
    $rel = $it.FullName.Substring($localDir.Length).TrimStart('\\','/')
    $remotePath = ($remoteDir.TrimEnd('/')) + '/' + ($rel -replace '\\','/')
    if ($it.PSIsContainer) {
      New-FtpDirectoryRecursive -remoteDir $remotePath
      continue
    }
    # Upload file
    $req = New-FtpRequest -uriPath $remotePath -method ([System.Net.WebRequestMethods+Ftp]::UploadFile)
    $bytes = [System.IO.File]::ReadAllBytes($it.FullName)
    $req.ContentLength = $bytes.Length
    $rs = $req.GetRequestStream()
    try {
      $rs.Write($bytes, 0, $bytes.Length)
    } finally {
      $rs.Close()
    }
    $resp = $req.GetResponse(); $resp.Close()
    Write-Host "[UPLOAD] $rel -> $remotePath"
  }
}

function Get-FtpList {
  param([string]$remoteDir)
  try {
    $req = New-FtpRequest -uriPath $remoteDir -method ([System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails)
    $resp = $req.GetResponse();
    $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $data = $sr.ReadToEnd();
    $sr.Close(); $resp.Close();
    return $data
  } catch {
    return $null
  }
}

# Entry
$PlainPassword = Get-PlainPassword -EnvVar $PasswordEnvVar

if (-not (Test-Path -Path $LocalDir)) { throw "LocalDir does not exist: $LocalDir" }

Write-Host "Connecting to ${FtpHost}:${FtpPort} as $Username" -ForegroundColor Cyan

# Preflight login
if (-not (Test-FtpLogin)) { throw "FTP login failed. Aborting." }

# Backup existing remote directory (best-effort)
$didBackup = Backup-RemoteDirectory -remoteDir $RemoteDir
if (-not $didBackup) {
  Write-Warning "Proceeding without server-side backup. Consider manual backup via control panel if required."
}

# Ensure remote directory exists
New-FtpDirectoryRecursive -remoteDir $RemoteDir

# Upload
Upload-DirectoryRecursive -localDir $LocalDir -remoteDir $RemoteDir

# Post-verify: list directory and check markers
$list = Get-FtpList -remoteDir $RemoteDir
if ($null -ne $list) {
  Write-Host "[VERIFY] Remote listing for ${RemoteDir}:" -ForegroundColor Cyan
  Write-Host $list
  $hasIndex = ($list -match 'index.html')
  $hasHtaccess = ($list -match '\.htaccess')
  if (-not $hasIndex) { Write-Warning "[VERIFY] index.html not found in remote listing." }
  if (-not $hasHtaccess) { Write-Warning "[VERIFY] .htaccess not found in remote listing." }
}

Write-Host "Deployment completed to $RemoteDir" -ForegroundColor Green
