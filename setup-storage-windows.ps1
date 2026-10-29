
$ErrorActionPreference = "Stop"

$ENV_FILE = ".env"

$DEFAULT_PATH = "/mnt/server-drive/Storage"
$DEFAULT_TARGET = "/mnt/server-drive/Storage"

# Step 1: Check whether .env exists in the current directory
if (Test-Path -LiteralPath $ENV_FILE -PathType Leaf) {
    Write-Host "Found existing .env file: $((Get-Location).Path)\$ENV_FILE"
}
else {
    Write-Host "No .env file found in: $((Get-Location).Path)"

    $CREATE_ENV = Read-Host "Create a new .env file here? (y/n)"

    if ($CREATE_ENV -notmatch '^[Yy]$') {
        Write-Host "Cancelled. No file created."
        exit 0
    }

    New-Item -ItemType File -Path $ENV_FILE | Out-Null
    Write-Host "Created $ENV_FILE"
}

Write-Host ""
Write-Host "=== Memories Storage Configuration ==="

# Step 2: Ask for storage paths
$STORAGE_PATH = Read-Host "Enter MEDIA_STORAGE_PATH [$DEFAULT_PATH]"
if ([string]::IsNullOrWhiteSpace($STORAGE_PATH)) {
    $STORAGE_PATH = $DEFAULT_PATH
}

$STORAGE_TARGET = Read-Host "Enter MEDIA_STORAGE_TARGET [$DEFAULT_TARGET]"
if ([string]::IsNullOrWhiteSpace($STORAGE_TARGET)) {
    $STORAGE_TARGET = $DEFAULT_TARGET
}

# Step 3: Validate inputs
if ([string]::IsNullOrWhiteSpace($STORAGE_PATH) -or
    [string]::IsNullOrWhiteSpace($STORAGE_TARGET)) {
    Write-Error "Storage paths cannot be empty."
    exit 1
}

# Step 4: Update existing variables or append missing ones
function Set-Env {
    param(
        [string]$Key,
        [string]$Value
    )

    $lines = @(Get-Content -LiteralPath $ENV_FILE)

    $pattern = "^$([regex]::Escape($Key))="
    $found = $false

    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match $pattern) {
            $lines[$i] = "$Key=$Value"
            $found = $true
        }
    }

    if ($found) {
        Set-Content -LiteralPath $ENV_FILE -Value $lines -Encoding utf8
    }
    else {
        Add-Content -LiteralPath $ENV_FILE -Value "$Key=$Value" -Encoding utf8
    }
}

Set-Env -Key "MEDIA_STORAGE_PATH" -Value $STORAGE_PATH
Set-Env -Key "MEDIA_STORAGE_TARGET" -Value $STORAGE_TARGET

Write-Host ""
Write-Host "=== Saved Storage Configuration ==="

Get-Content -LiteralPath $ENV_FILE |
    Where-Object { $_ -match '^MEDIA_STORAGE_(PATH|TARGET)=' }

Write-Host ""
Write-Host "Configuration saved successfully!"
