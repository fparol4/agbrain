# Ag Brain

Aplicação de gestão rural construída como desafio técnico. O projeto combina uma interface React responsiva com uma API modular em AdonisJS e PostgreSQL.

## Executar o projeto

Suba a API, o banco, as migrations e os dados de demonstração:

```bash
docker compose up --build
```

Em outro terminal, execute o frontend:

```bash
cd client
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3333
- Health check: http://localhost:3333/health

O frontend está conectado à API por um gateway tipado e envia o cookie de sessão com `credentials: 'include'`. Dashboard, produtores, fazendas, safras e auditoria usam dados persistidos no PostgreSQL; os dados em memória permanecem apenas como implementação injetada nos testes da interface.

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
