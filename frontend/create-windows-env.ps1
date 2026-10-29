$ErrorActionPreference = "Stop"

$ENV_FILE = ".env"

if (Test-Path $ENV_FILE) {
    Write-Host "Environment file already exists. No need to create it again."
    exit 0
}

$content = @'
NEXT_PUBLIC_URL=/api
INTERNAL_API_URL=/api

JWT_SECRET=
'@

# Write UTF-8 without a BOM (compatible with Windows PowerShell 5.1)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText(
    (Join-Path (Get-Location).Path $ENV_FILE),
    $content + "`n",
    $utf8NoBom
)

Write-Host "Environment file created successfully."