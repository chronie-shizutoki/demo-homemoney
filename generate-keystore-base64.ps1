# Generate pure base64 encoding for keystore file
# This script generates pure base64 string without headers and footers

$keystorePath = "android\app\app-release.keystore"
$outputPath = "keystore-base64.txt"

if (Test-Path $keystorePath) {
    Write-Host "Generating base64 encoding for $keystorePath..."
    
    # Read file and convert to base64
    $bytes = [System.IO.File]::ReadAllBytes($keystorePath)
    $base64 = [System.Convert]::ToBase64String($bytes)
    
    # Save as pure base64 string
    $base64 | Out-File -FilePath $outputPath -Encoding ASCII
    
    Write-Host "Base64 encoding saved to $outputPath"
    Write-Host "Please copy the content of this file to GitHub Secrets as KEYSTORE_BASE64"
} else {
    Write-Host "Error: File not found: $keystorePath"
}