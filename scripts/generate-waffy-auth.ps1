# Script to generate Waffy OAuth Basic Auth header
# Usage: .\generate-waffy-auth.ps1 -ClientId "your-client-id" -ClientPassword "your-client-password"

param(
    [Parameter(Mandatory=$true)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$true)]
    [string]$ClientPassword
)

# Combine client_id and client_password with colon
$credentials = "${ClientId}:${ClientPassword}"

# Convert to bytes
$bytes = [System.Text.Encoding]::UTF8.GetBytes($credentials)

# Encode to Base64
$base64 = [System.Convert]::ToBase64String($bytes)

# Create the Authorization header value
$authHeader = "Basic $base64"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Waffy OAuth Basic Auth Header Generator" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Client ID:        " -NoNewline; Write-Host $ClientId -ForegroundColor Yellow
Write-Host "Client Password:  " -NoNewline; Write-Host $ClientPassword -ForegroundColor Yellow
Write-Host ""
Write-Host "Credentials:      " -NoNewline; Write-Host $credentials -ForegroundColor Green
Write-Host "Base64 Encoded:   " -NoNewline; Write-Host $base64 -ForegroundColor Green
Write-Host ""
Write-Host "Authorization Header:" -ForegroundColor Cyan
Write-Host $authHeader -ForegroundColor Magenta
Write-Host ""
Write-Host "Add this to your .env file:" -ForegroundColor Cyan
Write-Host "WAFFY_OAUTH_CLIENT_AUTH=$authHeader" -ForegroundColor White
Write-Host ""

# Copy to clipboard if possible
try {
    Set-Clipboard -Value $authHeader
    Write-Host "✓ Authorization header copied to clipboard!" -ForegroundColor Green
} catch {
    Write-Host "Note: Could not copy to clipboard automatically" -ForegroundColor Yellow
}

Write-Host ""
