
#!/usr/bin/env bash

set -euo pipefail

ENV_FILE=".env"

if [[ -f "$ENV_FILE" ]]; then
    echo "Environment file already exists. No need to create it again."
    exit 0
fi

cat > "$ENV_FILE" <<'EOF'
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
EOF

chmod 600 "$ENV_FILE"

echo "Environment file created successfully."
