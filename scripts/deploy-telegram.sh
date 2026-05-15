#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/deploy-telegram.sh [--set-webhook] [--project-ref <ref>] [--token <telegram_bot_token>]

Options:
  --set-webhook         Also set Telegram webhook after deploy.
  --project-ref <ref>   Supabase project ref (optional if already linked).
  --token <token>       Telegram bot token (required with --set-webhook if env var is not set).
  -h, --help            Show help.

Environment:
  TELEGRAM_BOT_TOKEN    Used when --set-webhook is enabled and --token is not provided.
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT_DIR}"

SET_WEBHOOK=false
PROJECT_REF=""
TOKEN="${TELEGRAM_BOT_TOKEN:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --set-webhook)
      SET_WEBHOOK=true
      shift
      ;;
    --project-ref)
      PROJECT_REF="${2:-}"
      shift 2
      ;;
    --token)
      TOKEN="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

if ! command -v supabase >/dev/null 2>&1; then
  echo "Error: supabase CLI not found. Install it first."
  echo "  brew install supabase/tap/supabase"
  exit 1
fi

echo "Deploying Supabase function: telegram-webhook"
if [[ -n "${PROJECT_REF}" ]]; then
  supabase functions deploy telegram-webhook --project-ref "${PROJECT_REF}"
else
  supabase functions deploy telegram-webhook
fi

echo "Deploy complete."

if [[ "${SET_WEBHOOK}" != "true" ]]; then
  echo "Skipping webhook update (use --set-webhook to enable)."
  exit 0
fi

if [[ -z "${TOKEN}" ]]; then
  echo "Error: Telegram token is required for --set-webhook."
  echo "Pass --token <token> or export TELEGRAM_BOT_TOKEN."
  exit 1
fi

if [[ -n "${PROJECT_REF}" ]]; then
  REF="${PROJECT_REF}"
else
  REF="$(supabase status 2>/dev/null | awk '/Project ref/ {print $3}')"
fi

if [[ -z "${REF}" ]]; then
  echo "Error: Could not determine project ref."
  echo "Pass --project-ref <ref>."
  exit 1
fi

WEBHOOK_URL="https://${REF}.functions.supabase.co/telegram-webhook"
echo "Setting Telegram webhook to: ${WEBHOOK_URL}"

RESPONSE="$(curl -sS "https://api.telegram.org/bot${TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"${WEBHOOK_URL}\"}")"

echo "Telegram API response: ${RESPONSE}"
echo "Done."
