# Client simplification and functionality diagrams

## Objective

Keep the client small, feature-oriented, and easy to navigate while preserving the current UI and API behavior. This plan changes organization first; it does not redesign screens or API contracts.

## 1. shadcn boundary

shadcn components are source files copied into the project, not a normal runtime component package. They therefore remain in the repository, but they can have a strict boundary.

Recommended rules:

- Keep generated/adapted shadcn primitives only in `src/shared/ui/`.
- Configure `components.json` so the shadcn `ui` alias points to `@/shared/ui`.
- Never import application modules, API code, or domain types from `shared/ui`.
- Put application-specific reusable components in `src/shared/components/`.
- Prefer direct imports such as `@/shared/ui/button`; do not add a large barrel file.
- Treat `shared/ui` as replaceable infrastructure. Domain behavior belongs in modules.

Fully excluding shadcn files from the codebase would require generating them during installation or maintaining a separate package. That adds complexity and is not recommended for this application.

## 2. Recommended architecture

```text
src/
├── app/
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── query-client.ts
│   ├── routes.tsx
│   └── producer-scope.ts
├── modules/
│   ├── auth/
│   │   ├── api.ts
│   │   ├── model.ts
│   │   ├── use-auth.ts
│   │   └── login-page.tsx
│   ├── dashboard/
│   │   ├── api.ts
│   │   ├── model.ts
│   │   ├── charts.tsx
│   │   └── page.tsx
│   ├── producers/
│   │   ├── api.ts
│   │   ├── model.ts
│   │   ├── dialog.tsx
│   │   └── page.tsx
│   ├── farms/
│   │   ├── api.ts
│   │   ├── model.ts
│   │   ├── area-validator.tsx
│   │   ├── dialog.tsx
│   │   └── page.tsx
│   ├── harvests/
│   │   ├── api.ts
│   │   ├── model.ts
│   │   ├── dialog.tsx
│   │   └── page.tsx
│   └── audit/
│       ├── api.ts
│       ├── model.ts
│       ├── labels.ts
│       ├── detail-dialog.tsx
│       └── page.tsx
├── shared/
│   ├── ui/                 # shadcn only
│   ├── components/         # reusable application components
│   ├── api/
│   │   ├── client.ts
│   │   └── errors.ts
│   └── lib/
│       ├── brazilian-states.ts
│       ├── format.ts
│       ├── pagination.ts
│       └── cn.ts
├── index.css
└── main.tsx
tests/
├── setup.ts
├── unit/                    # mirrors the production source tree
└── e2e/
```

### Simplification rules

- Each module starts with `api.ts`, `model.ts`, and `page.tsx`.
- Combine the current feature `types` and `schema` files into `model.ts` when both are small.
- Add a separate component file only when it is reusable or keeps the page readable.
- Keep every test under `tests/`, mirroring the behavior it covers.
- Do not create generic global folders named `hooks`, `services`, `types`, or `utils`.
- Use TanStack Query for remote state; do not add another store unless genuine client-only shared state appears.

## 3. Dependency direction

```mermaid
flowchart TD
    App[app: routes, providers, layout] --> Modules[modules: business screens]
    App --> Shared[shared: infrastructure and reusable UI]
    Modules --> Shared
    SharedUI[shared/ui: shadcn primitives] --> Radix[Radix + Tailwind]
    Shared --> SharedUI
    Modules -. forbidden .-> App
    Shared -. forbidden .-> Modules
```

## 4. Functionality diagrams

### Authentication

```mermaid
sequenceDiagram
    actor Admin
    participant Login as Login page
    participant Auth as Auth module
    participant API as Nest API
    Admin->>Login: Submit email and password
    Login->>Auth: login(input)
    Auth->>API: POST /api/v1/auth/login
    API-->>Auth: User + HTTP-only session cookie
    Auth-->>Login: Cache session user
    Login-->>Admin: Navigate to dashboard
    Auth->>API: GET /api/v1/auth/me on reload
```

### Dashboard and producer scope

```mermaid
flowchart LR
    Scope[Topbar producer filter] --> URL[idProducer + year in URL]
    URL --> Query[Dashboard query]
    Query --> API[GET /api/v1/dashboard]
    API --> KPIs[Total farms + hectares]
    API --> States[Pie: states]
    API --> Crops[Pie: crops]
    API --> Soil[Pie: soil use]
```

### Producers

```mermaid
flowchart LR
    Page[Producers page] --> List[GET producers]
    Page --> Dialog[Create/edit dialog]
    Dialog --> Validate[CPF/CNPJ + form validation]
    Validate --> Mutation[POST/PATCH producer]
    Page --> Delete[DELETE producer]
    Mutation --> Refresh[Invalidate producers + dashboard]
    Delete --> Refresh
```

### Farms

```mermaid
flowchart LR
    Producer[Selected producer] --> Dialog[Farm dialog]
    Dialog --> Areas[Area validation]
    Areas --> Mutation[POST/PATCH farm with idProducer]
    Mutation --> Relation[Farm belongs to producer]
    Relation --> Refresh[Invalidate farms + dashboard]
    List[Farm table] --> Relation
```

### Harvests

```mermaid
flowchart LR
    Farm[Selected farm] --> Dialog[Harvest dialog]
    Dialog --> Normalize[Normalize unique crop names]
    Normalize --> Mutation[POST/PATCH harvest]
    Mutation --> Join[Replace harvest-crop relations]
    Join --> Refresh[Invalidate harvests + dashboard]
```

### Audit

```mermaid
flowchart LR
    Operation[Authenticated operation] --> Log[Server audit record]
    Filters[Audit page filters] --> Query[GET /api/v1/audits]
    Query --> Table[Read-only log table]
    Table --> Detail[Centered detail dialog]
    Log --> Query
```

## 5. Execution plan

1. Record the current passing baseline: format, typecheck, lint, unit tests, build, and browser smoke tests.
2. Move `components/ui` to `shared/ui` and update `components.json` plus imports. Make no visual changes.
3. Move application-level reusable components to `shared/components`; move the shell to `app/layout.tsx`.
4. Move `lib/api.ts` and error handling to `shared/api`; move remaining stable helpers to `shared/lib`.
5. Rename `features` to `modules`, one module at a time, keeping routes working after every move.
6. Merge small `*.types.ts` and `*.schema.ts` pairs into module `model.ts` files.
7. Remove empty folders and old files only after import searches confirm they are unused.
8. Run all client checks and exercise login, dashboard scope, producer CRUD, farm ownership, harvest crop replacement, and audit details.
9. Rebuild the Docker client image or use the Vite development server to verify the final UI.

## 6. Acceptance criteria

- `shared/ui` contains only shadcn-style primitives and their UI-only helpers.
- Modules never import from one another except for explicit domain dependencies such as farms using producer option types/API and harvests using farm options.
- No API contract or visible behavior changes during the reorganization.
- Every route remains lazy-loaded.
- Existing unit and E2E tests pass.
- A developer can locate any feature entry point within two directory levels under `modules/`.
