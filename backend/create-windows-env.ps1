
$ErrorActionPreference = "Stop"

$ENV_FILE = ".env"

# Step 1: Check whether .env already exists
if (Test-Path -LiteralPath $ENV_FILE -PathType Leaf) {
    Write-Host "Environment file already exists. No need to create it again."
    exit 0
}

# Step 2: Create the environment file with default values
$ENV_CONTENT = @'
# Storage paths based on your Operating system
STORAGE_PATH_LINUX=
STORAGE_PATH_WINDOWS=

STORAGE_PROFILE_PATH=Profile

FRONTEND_URL=http://frontend:3000

JWT_SECRET=
COOKIE_SECRET_KEY=

EMAIL_API=
FRONTEND_DOMAIN_RESET_PASSWORD=/api/pages/resetPassword

# Mongo Database
MONGODB_URL=mongodb://mongodb:27017/mydatabase

# GOOGLE AUTH2.0
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=/api/auth/google/callback

# AI MODEL API
AI_QWEN_API_URL=http://api.api:8000

# ADMIN EMAIL
ADMIN_EMAIL=
'@

# Step 3: Write the .env file
Set-Content -LiteralPath $ENV_FILE -Value $ENV_CONTENT -Encoding utf8

# Step 4: Restrict file permissions on Windows
try {
    $CurrentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name

    & icacls.exe $ENV_FILE /inheritance:r /grant:r `
        "${CurrentUser}:(F)" "SYSTEM:(F)" | Out-Null

    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Could not fully restrict .env permissions. Check the file's Windows ACL."
    }
}
catch {
    Write-Warning "Could not configure file permissions: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Environment file created successfully."
