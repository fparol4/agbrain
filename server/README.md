# Ag Brain API

API REST modular para gestão de produtores, fazendas, safras anuais, dashboard e auditoria.

## Stack e decisões

- AdonisJS 7 e TypeScript para HTTP, validação, autenticação e ciclo de vida da aplicação.
- Lucid ORM sobre PostgreSQL. Ele foi escolhido em vez do Drizzle porque integra nativamente migrations, models, transações, sessões e os utilitários de teste do AdonisJS, sem perder as consultas SQL explícitas necessárias ao dashboard.
- Sessão armazenada no banco e enviada em cookie `HttpOnly`.
- UUID em todos os identificadores de domínio, nomeados pelo recurso: `idUser`, `idProducer`, `idFarm`, `idHarvest`, `idCrop` e `idAudit`.
- VineJS na borda HTTP e constraints no PostgreSQL como segunda camada de integridade.
- Culturas normalizadas no catálogo `crops`; safras representam anos fechados, como Safra 2025 e Safra 2026.
- Histórico de área em `farm_area_events`, usado na série mensal do dashboard.
- Auditoria imutável para login, logout, criação, alteração, exclusão e visualização do dashboard.

## Arquitetura

```text
app/
├── core/
│   ├── auth/              # regras de autorização entre papéis
│   ├── errors/            # erros de domínio transportáveis por HTTP
│   └── http/              # concerns da camada HTTP, como request logging
├── modules/
│   └── <module>/
│       ├── use-cases/     # orquestração de cada ação da aplicação
│       ├── services/      # regras e consultas específicas do domínio
│       ├── *.controller.ts
│       ├── *.model.ts
│       ├── *.repository.ts
│       ├── *.routes.ts
│       └── *.validator.ts
└── shared/
    ├── documents/         # CPF/CNPJ
    ├── ids/               # UUID
    └── pagination/
```

Os controllers apenas validam a entrada, acionam um caso de uso e formatam a resposta. Autorização e regras de negócio não ficam nas rotas.

## Permissões

| Recurso    | Administrador                               | Produtor                                  |
| ---------- | ------------------------------------------- | ----------------------------------------- |
| Produtores | listar, criar, consultar, alterar e remover | consultar o próprio cadastro              |
| Fazendas   | consultar qualquer produtor                 | consultar e gerenciar somente as próprias |
| Safras     | consultar qualquer produtor                 | consultar e gerenciar somente as próprias |
| Dashboard  | visualizar qualquer produtor                | visualizar somente o próprio              |
| Auditoria  | visualizar todos os eventos                 | sem acesso                                |

## Desenvolvimento local

Requisitos: Node.js 24, npm 11, Docker e Docker Compose.

```bash
docker compose up -d postgres
cd server
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

O PostgreSQL fica disponível em `localhost:5432` e a API em `localhost:3333`.

Se o volume do PostgreSQL já existia antes da criação do banco de testes, crie-o uma única vez:

```bash
docker compose exec postgres createdb -U agbrain agbrain_test
```

## Ambiente completo com Docker

Na raiz do repositório:

```bash
docker compose up --build
```

Nesse modo, a API aguarda o PostgreSQL, executa migrations e o seed idempotente, e então inicia o servidor. `SESSION_SECURE_COOKIE=false` existe apenas para permitir a demonstração local via HTTP; em um deploy HTTPS, use `true`.

## Qualidade e testes

```bash
npm run format
npm run lint
npm run typecheck
npm test
npm run build
```

Os testes unitários cobrem CPF/CNPJ, alocação de área e normalização de culturas. Os funcionais usam PostgreSQL real e cobrem sessão, papéis, isolamento entre produtores, CRUD, safras, dashboard e auditoria. Cada teste funcional roda em transação e é revertido ao final.

## Contrato HTTP

O contrato OpenAPI 3.1 está em [openapi/openapi.yaml](openapi/openapi.yaml). Rotas principais:

- `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `DELETE /api/v1/auth/session`
- `/api/v1/producers`
- `/api/v1/producers/{idProducer}/farms` e `/api/v1/farms/{idFarm}`
- `/api/v1/producers/{idProducer}/harvests`, `/api/v1/farms/{idFarm}/harvests` e `/api/v1/harvests/{idHarvest}`
- `GET /api/v1/producers/{idProducer}/dashboard`
- `GET /api/v1/audit`
- `GET /health`

Para chamadas do navegador, envie credenciais com `credentials: 'include'`. CORS aceita somente a origem definida em `CLIENT_URL`.

## Respostas de erro

Erros de domínio seguem o formato:

```json
{
  "error": {
    "code": "E_FORBIDDEN",
    "message": "Você não possui permissão para executar esta ação."
  },
  "requestId": "..."
}
```

O `requestId` também aparece nos logs estruturados e facilita rastrear uma chamada ponta a ponta.
