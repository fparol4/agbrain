# Ag Brain Client

Administrator-only rural management interface built with React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, and TanStack Query.

## Stack

- **React 19** & **TypeScript** with **Vite**
- **Tailwind CSS v4** & **shadcn/ui** (Radix primitives)
- **TanStack Query** for remote data, session state, and cache invalidation
- **React Hook Form** + **Zod** for schema validation
- **validation-br** for Brazilian CPF and alphanumeric CNPJ validation
- **Recharts** for accessible charts without gradients
- **Sonner** for toast notifications
- **Vitest** and **Playwright** for unit and E2E testing

## Features

- **Dashboard**: General and producer-scoped views with farm and hectare KPIs plus state, crop, and soil-use charts.
- **Produtores**: Full CRUD for rural producers with CPF and alphanumeric CNPJ support.
- **Fazendas**: Full CRUD for farms with real-time live area allocation validation (accessible green/red indicators).
- **Safras**: Annual harvests and crop management with normalization.
- **Trilha de Auditoria**: Read-only immutable event log with multi-criteria filters and detailed request snapshot modals.

## Development

```bash
cd client
npm install
npm run dev
```

The client starts at `http://localhost:5173` and proxies `/api` and `/health` requests to `http://127.0.0.1:3333`.

The production image uses Caddy to serve the static build, proxy the API on the
same origin, and manage HTTPS when `APP_ADDRESS` contains a domain. The root
Compose file owns this runtime configuration; no client build-time API URL is
needed.

## Source Architecture

```text
src/
├── app/       # routes, providers, query client, layout, URL scope
├── modules/   # auth, dashboard, producers, farms, harvests, audit
└── shared/
    ├── api/        # HTTP client and public error handling
    ├── components/ # reusable AgBrain components
    ├── lib/        # stable framework-independent helpers
    └── ui/         # shadcn components only
tests/
├── unit/      # mirrors src/ without mixing tests into production code
└── e2e/       # browser flows with mocked API responses
```

Each business module owns its API functions, model/schema, page, and module-specific UI. `shared/ui` must not import application modules or business types.

## Quality Commands

```bash
npm run format:check  # Check formatting with Prettier
npm run lint          # Lint codebase with Oxlint
npm run typecheck     # Verify TypeScript types with tsc
npm run test:unit     # Run unit tests with Vitest
npm run test:e2e      # Run browser tests with Playwright
npm run build         # Build production bundle with Vite
```
