#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "preflight failed on line $LINENO"; exit 1' ERR

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_EXAMPLE="$APP_DIR/.env.local.example"
ENV_FILE="$APP_DIR/.env.local"

# --fix: create .env.local from example if missing
if [[ "${1:-}" == "--fix" && ! -f "$ENV_FILE" ]]; then
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "Created $ENV_FILE from example."
fi

# Load .env.local (KEY=VALUE, ignore comments/blank lines)
if [[ -f "$ENV_FILE" ]]; then
  while IFS='=' read -r key value; do
    [[ -z "${key// }" || "${key:0:1}" == "#" ]] && continue
    value="${value%$'\r'}"
    export "$key=$value"
  done < "$ENV_FILE"
fi

required_vars=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  NEXT_PUBLIC_SITE_URL
)

missing=()
printf "%-35s | %s\n" "Variable" "Status"
printf -- "-----------------------------------+--------\n"
for key in "${required_vars[@]}"; do
  if [[ -n "${!key-}" ]]; then
    printf "%-35s | OK\n" "$key"
  else
    printf "%-35s | MISSING\n" "$key"
    missing+=("$key")
  fi
done

if (( ${#missing[@]} > 0 )); then
  echo
  echo "Missing: ${missing[*]}"
  exit 1
fi

echo "All required variables present."
