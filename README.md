# Environment configuration

1. Copy the example file:
   ```sh
   cp apps/web/.env.local.example apps/web/.env.local
   ```

2. Edit .env.local with your values. Do not put secrets here (only NEXT_PUBLIC_*).
	3. Validate:
bash apps/web/scripts/preflight.sh || bash apps/web/scripts/preflight.sh --fix
