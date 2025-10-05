param(
  [Parameter(Mandatory=$true)] [string]$FtpHost,
  [Parameter(Mandatory=$true)] [int]$FtpPort,
  [Parameter(Mandatory=$true)] [string]$Username,
  [Parameter(Mandatory=$true)] [string]$RemoteDir,
  [string]$PasswordEnvVar = "FTP_PASS",
  [switch]$Passive
)

$ErrorActionPreference = 'Stop'

function Get-PlainPassword {
  param([string]$EnvVar)
  $envItem = Get-Item -Path "Env:$EnvVar" -ErrorAction SilentlyContinue
  if ($null -ne $envItem -and [string]::IsNullOrEmpty($envItem.Value) -eq $false) { return $envItem.Value }
  $secure = Read-Host -AsSecureString "Enter FTP password for $Username@${FtpHost}:${FtpPort}"
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function New-FtpRequest {
  param([string]$uriPath,[string]$method)
  $uri = "ftp://$FtpHost`:$FtpPort$uriPath"
  $req = [System.Net.FtpWebRequest]::Create($uri)
  $req.Credentials = New-Object System.Net.NetworkCredential($Username, $PlainPassword)
  $req.Method = $method
  $req.UseBinary = $true
  $req.KeepAlive = $false
  $req.UsePassive = $Passive.IsPresent
  return $req
}

$PlainPassword = Get-PlainPassword -EnvVar $PasswordEnvVar

Write-Host "[VERIFY] Listing ${RemoteDir} on ${FtpHost}:${FtpPort} as $Username" -ForegroundColor Cyan
try {
  $req = New-FtpRequest -uriPath $RemoteDir -method ([System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails)
  $resp = $req.GetResponse();
  $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
  $data = $sr.ReadToEnd();
  $sr.Close(); $resp.Close();
  Write-Host $data
  $hasIndex = ($data -match 'index.html')
  $hasHtaccess = ($data -match '\.htaccess')
  $summary = @{ path=$RemoteDir; has_index=$hasIndex; has_htaccess=$hasHtaccess }
  $summary | ConvertTo-Json
} catch {
  Write-Error "[VERIFY] Failed to list directory: $($_.Exception.Message)"
}
