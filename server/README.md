# Ag Brain API

Small NestJS API for an administrator to manage producers, farms, harvests, and view a general or producer-filtered dashboard.

## Stack

- Node.js 24, NestJS, TypeScript
- TypeORM and PostgreSQL 17
- Opaque database sessions in an `HttpOnly` cookie
- `validation-br` for CPF and numeric/alphanumeric CNPJ validation
- Vitest for direct-method unit tests and live-server E2E tests

## Structure

```text
src/
├── core/       # authentication guard, errors, HTTP behavior
├── modules/    # auth, producers, farms, harvests, dashboard, audit, health
├── shared/     # document, decimal, and pagination helpers
└── settings/   # environment, database, migrations, seed
```

Handlers only handle HTTP. Use cases express application behavior. Module services contain persistence and reusable module operations. TypeORM repositories are injected directly; there are no custom repository classes.

## Run locally

```bash
docker compose up -d postgres
cd server
cp .env.example .env
npm install
npm run db:seed
npm run dev
```

Migrations run automatically when the datasource starts. The API listens on `http://localhost:3333`. The default seed credentials come from `ADMIN_EMAIL` and `ADMIN_PASSWORD`; change them outside local development.

## API

- `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `DELETE /api/v1/auth/session`
- CRUD `/api/v1/producers`
- CRUD `/api/v1/farms`, filterable by `idProducer`, `state`, and `search`
- CRUD `/api/v1/harvests`, filterable by `idProducer`, `idFarm`, and `year`
- `GET /api/v1/dashboard?year=2026&idProducer=<optional UUID>`
- `GET /api/v1/audits`, filterable by `operation`, `resource`, `outcome`, `idActor`, `from`, `to`, `search`
- `GET /health`

The static contract is in [`openapi/openapi.yaml`](openapi/openapi.yaml). Tests take precedence if documentation and tested behavior ever disagree.

## Quality

```bash
npm run format:check
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
```

Unit tests call methods directly with plain mocks. E2E tests start the complete HTTP server on an ephemeral port and use the real PostgreSQL test database. Every intentional application error branch has one focused test.
