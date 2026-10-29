
#!/usr/bin/env bash

set -euo pipefail

ENV_FILE=".env"

if [[ -f "$ENV_FILE" ]]; then
    echo "Environment file already exists. No need to create it again."
    exit 0
fi

cat > "$ENV_FILE" <<'EOF'
NEXT_PUBLIC_URL=/api
INTERNAL_API_URL=/api

JWT_SECRET=
EOF

chmod 600 "$ENV_FILE"

echo "Environment file created successfully."
