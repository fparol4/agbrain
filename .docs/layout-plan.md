# Plano de layout — Fazendas, Safras e Cadastros

## Princípios

- Reutilizar o shell, sidebar, cabeçalho de página e componentes shadcn já
  presentes no dashboard.
- Manter ações perto do conteúdo ao qual pertencem; não haverá busca global no
  topbar.
- Usar tabelas no desktop e cartões no mobile para os mesmos dados.
- Usar `Sheet` lateral para criação e edição simples, preservando o contexto da
  lista.
- Exibir validações de negócio junto ao campo responsável pelo erro.
- Todo estado de dados terá variações de carregamento, vazio, erro e sucesso.
- O produtor nunca escolhe outro produtor. O `idProducer` vem da sessão.
- Apenas o admin recebe um contexto/seletor de produtor.

## Estrutura compartilhada

As três telas usarão esta composição:

```text
AppShell
├── Sidebar
├── Topbar simplificado
└── PageContent
    ├── PageHeader (título, descrição, ação principal)
    ├── ContextBar opcional (somente admin)
    ├── LocalToolbar (filtros específicos da tela)
    └── ContentState (loading | empty | error | data)
```

Componentes reutilizáveis a criar:

- `PageHeader`
- `AdminProducerContext`
- `LocalToolbar`
- `DataTable`
- `MobileEntityCard`
- `EmptyState`
- `ConfirmDeleteDialog`
- `EntityFormSheet`
- `AreaAllocationBar`
- `FormErrorSummary`

## 1. Fazendas

### Objetivo

Permitir que o produtor encontre, cadastre, edite e remova propriedades sem
precisar navegar por várias páginas.

### Rota

`/farms`

### Layout da lista

- Cabeçalho: “Fazendas”, quantidade cadastrada e botão `Nova fazenda`.
- Toolbar local: filtro por estado e ordenação por nome ou área.
- Desktop: tabela com nome, cidade/UF, área total, área agricultável, vegetação
  e menu de ações.
- Mobile: um cartão por fazenda com localização, área total e resumo do uso do
  solo.
- Clique na linha/cartão abre os detalhes da fazenda.

### Criação e edição

Abrir um `Sheet` lateral com três blocos:

1. Identificação: nome da fazenda.
2. Localização: cidade e estado.
3. Áreas: total, agricultável e vegetação em hectares.

Enquanto as áreas são digitadas, `AreaAllocationBar` mostra a proporção de uso
e o saldo disponível. Se a soma ultrapassar a área total, os campos ficam em
erro e o envio é bloqueado.

### Exclusão

- Menu da linha abre `ConfirmDeleteDialog`.
- O texto cita o nome da fazenda e informa o impacto nas safras relacionadas.
- Nenhuma exclusão ocorre sem confirmação explícita.

### Estados importantes

- Sem fazendas: ilustração leve, explicação e CTA `Cadastrar primeira fazenda`.
- Falha ao carregar: mensagem curta e botão `Tentar novamente`.
- Salvando: botão com loading, mantendo os campos visíveis.

## 2. Safras

### Objetivo

Visualizar safras por fazenda e gerenciar as culturas plantadas em cada uma.

### Rota

`/harvests`

### Layout principal

- Cabeçalho: “Safras” e botão `Nova safra`.
- Toolbar local: filtro obrigatório/opcional de fazenda e filtro de período.
- Lista agrupada por safra, usando cartões expansíveis.
- Cada cartão mostra nome da safra, fazenda, número de culturas e status.
- A expansão revela as culturas como linhas compactas ou tags com ação de
  remover.

### Fluxo de criação

`Nova safra` abre um `Sheet` com:

- Fazenda.
- Nome/período, por exemplo `Safra 2025/2026`.
- Culturas iniciais, adicionadas por um campo repetível.

Ao editar uma safra existente, o usuário pode adicionar ou remover culturas sem
recriar a safra. Não serão adicionadas métricas que o desafio não solicita,
como produtividade ou custo.

### Relações visíveis

- Uma fazenda pode aparecer em várias safras.
- Uma safra pertence a exatamente uma fazenda.
- Uma safra pode começar sem culturas e receber culturas posteriormente.
- Links contextuais permitem ir da safra à fazenda correspondente.

### Estados importantes

- Produtor sem fazendas: CTA direciona primeiro para `Nova fazenda`.
- Fazenda sem safra: empty state contextual, sem parecer erro.
- Safra sem cultura: mensagem e ação `Adicionar cultura` dentro do cartão.

## 3. Cadastros

### Definição

“Cadastros” representa os dados cadastrais do produtor. Não repetirá o CRUD de
fazendas ou safras, que já possuem telas próprias.

### Rota

`/registrations`

### Visão do produtor

- Título: “Dados cadastrais”.
- Card de identificação com nome e CPF/CNPJ.
- Card de acesso com e-mail da conta.
- Estado normal é leitura; botão `Editar dados` habilita o formulário.
- CPF/CNPJ recebe máscara visual, mas o valor enviado à API contém apenas
  dígitos.
- Não existe seletor de produtor.

### Visão do administrador

- Título: “Produtores cadastrados”.
- Contexto administrativo claramente identificado.
- Tabela somente leitura com produtor, CPF/CNPJ mascarado, quantidade de
  fazendas e área total.
- Filtro local por nome/documento e estado vazio.
- Ação da linha: `Ver dashboard`.
- O MVP não oferece edição administrativa; isso preserva a regra de admin
  somente leitura definida para esta entrega.

## Comportamento por papel

| Tela | Producer | Admin |
| --- | --- | --- |
| Fazendas | CRUD das próprias fazendas | Visualização no contexto do produtor selecionado |
| Safras | CRUD das safras das próprias fazendas | Visualização no contexto do produtor selecionado |
| Cadastros | Visualiza/edita os próprios dados | Lista produtores e abre dashboards, sem editar |

O backend continuará responsável por essa autorização. A interface apenas
reflete permissões já resolvidas pela sessão.

## Ordem de implementação

1. Adicionar roteamento e extrair `AppShell`, `PageHeader` e
   `AdminProducerContext` do dashboard atual.
2. Implementar a lista responsiva de fazendas com dados mockados.
3. Implementar `FarmFormSheet`, validação das áreas e diálogo de exclusão.
4. Implementar a lista expansível de safras e o fluxo de culturas.
5. Implementar as duas variações de Cadastros, governadas pelo papel da sessão.
6. Adicionar estados loading/empty/error e feedback por toast.
7. Cobrir navegação, permissões visuais, formulários e responsividade com React
   Testing Library.
8. Trocar os mocks pela camada REST sem alterar os componentes de apresentação.

## Critérios de aceite do layout

- Todos os fluxos podem ser demonstrados com mocks, sem backend.
- Nenhuma tela depende de busca global ou configurações.
- O produtor não vê nem controla qualquer seleção de produtor.
- O admin sempre sabe qual produtor está visualizando.
- Formulários funcionam por teclado e possuem labels e mensagens associadas.
- Tabelas se tornam cartões utilizáveis abaixo de `700px`.
- Exclusões possuem confirmação e ações assíncronas mostram progresso.
