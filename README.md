# Ag Brain

Admin-only rural management CRM for managing producers, farms, crops, harvests, and audit history.

## Architecture

- [`server`](server/README.md): NestJS 11, TypeORM, PostgreSQL 17, cookie-based sessions, and immutable audit logs.
- [`client`](client/README.md): React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, and TanStack Query.
- [`postman`](postman/README.md): Importable API collection and local environment.

## Running with Docker Compose

```bash
docker compose up --build
```

- Client: `http://localhost:5173`
- Server API: `http://localhost:3334` (or `http://localhost:3333` in local dev)
- PostgreSQL: `localhost:5433`
