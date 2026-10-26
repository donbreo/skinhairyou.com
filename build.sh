#!/usr/bin/env bash
set -euo pipefail

APP_NAME="skinhairyou"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required but not found."
  exit 1
fi

if command -v pm2 >/dev/null 2>&1; then
  PM2_CMD=(pm2)
else
  PM2_CMD=(npx --yes pm2)
fi

echo "Installing production dependencies..."
npm ci --omit=dev

echo "Removing existing PM2 deployment..."
"${PM2_CMD[@]}" delete all >/dev/null 2>&1 || true
"${PM2_CMD[@]}" kill >/dev/null 2>&1 || true

echo "Starting app with PM2..."
"${PM2_CMD[@]}" start server.js --name "$APP_NAME" --update-env
"${PM2_CMD[@]}" save

echo "PM2 status:"
"${PM2_CMD[@]}" status
