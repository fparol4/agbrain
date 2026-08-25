# Ag Brain

Aplicação de gestão rural construída como desafio técnico. O projeto combina uma interface React responsiva com uma API modular em AdonisJS e PostgreSQL.

## Executar o projeto

Suba banco, API, migrations, dados de demonstração e cliente de produção:

```bash
docker compose up --build
```

Para desenvolver o frontend com hot reload, suba apenas a infraestrutura e execute o Vite em outro terminal:

```bash
docker compose up -d postgres api
cd client
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API no Compose: http://localhost:3334
- Health check no Compose: http://localhost:3334/health

O frontend está conectado à API por um gateway tipado e envia o cookie de sessão com `credentials: 'include'`. Dashboard, produtores, fazendas, safras e auditoria usam dados persistidos no PostgreSQL; os dados em memória permanecem apenas como implementação injetada nos testes da interface.

Administradores entram pelo dashboard geral e podem alternar a visualização para um produtor no seletor da barra lateral. O contexto escolhido é mantido na URL e aplicado às abas Dashboard, Fazendas e Safras; na visão geral, essas páginas consolidam todos os produtores.

## Acessos de demonstração

| Papel         | E-mail            | Senha     |
| ------------- | ----------------- | --------- |
| Administrador | `admin@raiz.demo` | `demo123` |
| Produtor      | `joao@raiz.demo`  | `demo123` |
| Produtor      | `ana@raiz.demo`   | `demo123` |

## Estrutura

- `client/`: React, TypeScript, componentes no estilo shadcn/ui e Recharts.
- `server/`: AdonisJS, Lucid ORM, autenticação por sessão e API REST.
- `compose.yml`: ambiente PostgreSQL e API conteinerizada.

O detalhamento do backend, permissões e comandos de desenvolvimento está em [server/README.md](server/README.md). O contrato HTTP completo está em [server/openapi/openapi.yaml](server/openapi/openapi.yaml).
