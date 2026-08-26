# Ag Brain

Admin-only rural management CRM for managing producers, farms, crops, harvests, and audit history.

## Architecture

- [`server`](server/README.md): NestJS 11, TypeORM, PostgreSQL 17, cookie-based sessions, and immutable audit logs.
- [`client`](client/README.md): React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, and TanStack Query.
- [`docs/postman`](docs/postman/README.md): Importable API collection and local environment.

## Run the complete stack

```bash
cp .env.example .env
# Edit .env before the first startup.
docker compose config
docker compose up -d --build
```

The browser uses one address for both the client and `/api`. The API and
PostgreSQL diagnostic ports only bind to the host loopback interface.

- Application: `http://localhost` in the default local configuration
- API diagnostics: `http://localhost:3334`
- PostgreSQL diagnostics: `localhost:5433`

Migrations and the idempotent initial seed run automatically before the API
starts. See [DEPLOYMENT.md](DEPLOYMENT.md) for the Ubuntu VM checklist, HTTPS,
updates, logs, and backups.
