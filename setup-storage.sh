
#!/usr/bin/env bash

set -euo pipefail

ENV_FILE=".env"

DEFAULT_PATH="/mnt/server-drive/Storage"
DEFAULT_TARGET="/mnt/server-drive/Storage"

# Step 1: Check whether .env exists in the current directory
if [[ -f "$ENV_FILE" ]]; then
    echo "Found existing .env file: $(pwd)/$ENV_FILE"
else
    echo "No .env file found in: $(pwd)"

    read -r -p "Create a new .env file here? (y/n): " CREATE_ENV

    if [[ ! "$CREATE_ENV" =~ ^[Yy]$ ]]; then
        echo "Cancelled. No file created."
        exit 0
    fi

    touch "$ENV_FILE"
    echo "Created $ENV_FILE"
fi

echo
echo "=== Memories Storage Configuration ==="

# Step 2: Ask for storage paths
read -r -p "Enter MEDIA_STORAGE_PATH [$DEFAULT_PATH]: " STORAGE_PATH
STORAGE_PATH="${STORAGE_PATH:-$DEFAULT_PATH}"

read -r -p "Enter MEDIA_STORAGE_TARGET [$DEFAULT_TARGET]: " STORAGE_TARGET
STORAGE_TARGET="${STORAGE_TARGET:-$DEFAULT_TARGET}"

# Step 3: Validate inputs
if [[ -z "$STORAGE_PATH" || -z "$STORAGE_TARGET" ]]; then
    echo "Error: Storage paths cannot be empty." >&2
    exit 1
fi

# Step 4: Update existing variables or append missing ones
set_env() {
    local key="$1"
    local value="$2"

    if grep -q "^${key}=" "$ENV_FILE"; then
        sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
        printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
    fi
}

set_env "MEDIA_STORAGE_PATH" "$STORAGE_PATH"
set_env "MEDIA_STORAGE_TARGET" "$STORAGE_TARGET"

echo
echo "=== Saved Storage Configuration ==="
grep -E '^MEDIA_STORAGE_(PATH|TARGET)=' "$ENV_FILE"

echo
echo "Configuration saved successfully!"
