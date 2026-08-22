# Raiz — definição do projeto

## Objetivo

Entregar uma aplicação full stack pequena, clara e demonstrável para gestão de
produtores rurais. O foco é transformar os requisitos do desafio em um produto
coeso, com regras de negócio no backend e uma interface que facilite a leitura
dos dados.

## Escopo do MVP

### Autenticação e autorização

- Login por e-mail e senha.
- Dois papéis: `ADMIN` e `PRODUCER`.
- `PRODUCER` acessa e mantém apenas os próprios dados.
- `ADMIN` lista produtores e visualiza o dashboard de qualquer produtor.
- O papel vem da sessão autenticada; nunca é escolhido no formulário de login.
- Recuperação de senha e criação pública de conta ficam fora do primeiro MVP.

### Gestão rural

- Cadastrar, editar, listar e excluir o perfil de produtor.
- Validar CPF ou CNPJ.
- Um produtor pode possuir zero ou mais fazendas.
- Cadastrar, editar e excluir fazendas.
- Validar `agriculturalArea + vegetationArea <= totalArea`.
- Uma fazenda pode possuir zero ou mais safras.
- Uma safra pode possuir zero ou mais culturas plantadas.

### Dashboard

- Quantidade total de fazendas.
- Soma da área total em hectares.
- Distribuição de fazendas por estado.
- Distribuição por cultura plantada.
- Distribuição do uso do solo entre área agricultável e vegetação.
- O dashboard do produtor usa implicitamente o produtor da sessão.
- O dashboard administrativo exige a seleção explícita de um produtor.

## Convenção de identificadores

Todo identificador de domínio usa `id<Domain>` em TypeScript e nos contratos da
API:

- `idUser`
- `idProducer`
- `idFarm`
- `idHarvest`
- `idCrop`

Os valores devem ser opacos (UUID v7, UUID v4 ou CUID2), nunca sequenciais nem
interpretados pelo cliente. No Postgres, os nomes podem ser mapeados para
`id_user`, `id_producer` etc., sem vazar essa convenção para o contrato JSON.

`Producer` e `Product` são conceitos diferentes: para o produtor rural, o nome
correto é sempre `idProducer`, não `idProduct`.

## Casos essenciais de autenticação e papéis

| Caso | Resultado esperado |
| --- | --- |
| Produtor entra com credenciais válidas | Recebe sessão e abre o próprio dashboard |
| Admin entra com credenciais válidas | Recebe sessão e pode selecionar um produtor |
| Credencial inválida | Retorna `401` com mensagem genérica |
| Usuário inativo tenta entrar | Retorna `401`, sem revelar o estado da conta |
| Produtor solicita dashboard de outro produtor | Retorna `403` |
| Admin solicita dashboard de um produtor existente | Retorna `200` |
| Usuário tenta recurso sem sessão | Retorna `401` |
| Usuário encerra a sessão | Refresh token é invalidado e cookies são removidos |

## Telas do primeiro incremento

### Login

- E-mail e senha.
- Mostrar/ocultar senha.
- Estado de carregamento e erro genérico.
- Acessos de demonstração para avaliação local.
- Papel resolvido pela conta autenticada.

### Dashboard do produtor

- Resumo com fazendas, hectares e culturas ativas.
- Três gráficos de rosca: estado, cultura e uso do solo.
- Gráfico de linha com a evolução mensal da área total das fazendas.
- Navegação preparada para fazendas, safras, culturas e cadastros.
- Layout responsivo para desktop e mobile.

### Variação administrativa

- Mesma estrutura do dashboard para evitar duplicação.
- Banner de contexto administrativo.
- Seletor de produtor visível e explícito.
- Sem permissão de escrita no primeiro MVP administrativo.

## Arquitetura proposta

### Frontend

- React + TypeScript + Vite.
- Componentes source-owned no padrão shadcn/ui (Radix + CVA).
- Context API apenas para sessão e contexto do produtor selecionado.
- Recharts para os gráficos.
- Uma camada `api` substituirá os mocks sem alterar os componentes visuais.

### Backend

- NestJS + TypeScript.
- PostgreSQL + Prisma ORM.
- API REST documentada com OpenAPI.
- Senhas com Argon2id.
- Access token curto em memória e refresh token rotativo em cookie `HttpOnly`,
  `Secure` e `SameSite`.
- Autorização aplicada no servidor por guard/policy; esconder botões não é
  controle de acesso.
- Logs estruturados com `requestId`, `idUser`, rota, status e duração, sem dados
  sensíveis.

### Endpoints iniciais

```text
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me

GET    /producers
POST   /producers
GET    /producers/:idProducer
PATCH  /producers/:idProducer
DELETE /producers/:idProducer

GET    /producers/:idProducer/farms
POST   /producers/:idProducer/farms
PATCH  /farms/:idFarm
DELETE /farms/:idFarm

POST   /farms/:idFarm/harvests
PATCH  /harvests/:idHarvest
DELETE /harvests/:idHarvest

POST   /harvests/:idHarvest/crops
DELETE /harvests/:idHarvest/crops/:idCrop

GET    /producers/:idProducer/dashboard
```

## Fora do primeiro MVP

- Auto cadastro, confirmação de e-mail e recuperação de senha.
- Gestão granular de permissões.
- Mapas, clima, produtividade preditiva e integrações externas.
- Upload de documentos ou imagens.
- Operações administrativas de escrita.
- Microfrontend, filas ou microsserviços.

Esses itens podem ser evoluções, mas não aumentam a qualidade da primeira
entrega na mesma proporção que testes, documentação, observabilidade e um fluxo
principal polido.
