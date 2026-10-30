# QuimiPort Backend

API de gestão de cargas químicas em um contexto portuário, inspirada em operações
logísticas do Porto de Santos. Projeto desenvolvido para o Tech Challenge da
Fase 2 da Pós Tech em Full Stack Development (FIAP).

Repositório: https://github.com/lucassilveira1/quimiport-backend

## Sumário

- [Contexto do problema](#contexto-do-problema)
- [Descrição da solução](#descrição-da-solução)
- [Tecnologias](#tecnologias)
- [Como executar](#como-executar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como executar os testes](#como-executar-os-testes)
- [Documentação da API](#documentação-da-api)
- [Principais endpoints](#principais-endpoints)
- [Regras de negócio](#regras-de-negócio)
- [Transição de Status da Carga](#transição-de-status-da-carga)
- [Banco de dados e modelagem](#banco-de-dados-e-modelagem)
- [Decisões arquiteturais](#decisões-arquiteturais)
- [Logs e tratamento de erros](#logs-e-tratamento-de-erros)
- [CI/CD](#cicd)
- [Integrantes do grupo](#integrantes-do-grupo)

## Contexto do problema

Em um porto, cargas químicas passam por várias etapas antes de deixar o terminal:
análise, inspeção, liberação e movimentação. Cada produto tem uma classe de risco
(modelo da ONU) e grupos de compatibilidade, e cada carga precisa de um responsável
técnico e de documentação completa antes de ser liberada. Quando esse controle fica
em planilhas ou processos manuais, é fácil liberar uma carga sem documentação,
movimentar uma carga bloqueada ou usar um produto que não deveria mais circular.

## Descrição da solução

O QuimiPort é uma API REST que centraliza esse controle. Ela permite:

- cadastrar, consultar, atualizar, inativar e reativar **produtos químicos**;
- registrar e consultar **cargas químicas** com um ou mais produtos;
- controlar o **status da carga** por uma máquina de estados que impede transições inválidas;
- **bloquear**, **liberar** e **cancelar** cargas, aplicando as regras de negócio;
- consultar as **classes de risco** e os **grupos de compatibilidade**, e cadastrar **responsáveis técnicos**.

Todas as regras ficam na camada de domínio, então valem igualmente para qualquer
endpoint que altere os dados.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| Node.js 20 + TypeScript | Linguagem e runtime |
| Express 4 | Framework HTTP |
| Zod | Validação dos dados de entrada (DTOs) |
| PostgreSQL 16 | Banco de dados |
| Drizzle ORM / Drizzle Kit | Acesso ao banco e migrations |
| OpenAPI 3.0 + Swagger UI | Documentação da API, servida em `/docs` |
| Jest + Supertest | Testes unitários, de API e de integração |
| Docker / Docker Compose | Containerização da API e do banco |
| GitHub Actions | Pipeline de CI |

**Por que Express:** é o framework Node.js mais difundido e o que o grupo já conhecia.
Ele não impõe estrutura, o que deixou o grupo livre para organizar o projeto em camadas
(domínio, aplicação, infraestrutura e API) sem depender de decorators ou de um container
de injeção de dependência. A injeção é feita à mão em `src/api/app.ts`, o que também
permite trocar os repositórios do PostgreSQL por repositórios em memória nos testes.

## Como executar

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### Com Docker

```bash
cp .env.example .env
docker compose up --build
```

O compose sobe dois serviços: `api` (porta 3000) e `db` (PostgreSQL, porta 5432).
A API só inicia depois que o healthcheck do banco passa. Ao iniciar, o container da API
aplica as migrations pendentes (criam as tabelas e cadastram as 9 classes de risco da ONU
e os 4 grupos de compatibilidade)
e só então sobe o servidor. Migrations já aplicadas não rodam de novo.

Teste se a API está no ar:

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

Para parar: `docker compose down` (os dados ficam no volume `postgres_data`;
use `docker compose down -v` para apagá-los).

### Localmente (API fora do Docker)

O banco continua no Docker; só a API roda na sua máquina, com recarga automática:

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run db:migrate
npm run dev
```

### Build de produção

```bash
npm run build
npm start
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste se necessário.

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta da API |
| `NODE_ENV` | `development` | Ambiente (`development`, `production` ou `test`; em `test` os logs de requisição ficam desligados) |
| `POSTGRES_USER` | `quimiport` | Usuário do PostgreSQL criado pelo container |
| `POSTGRES_PASSWORD` | `quimiport` | Senha do PostgreSQL |
| `POSTGRES_DB` | `quimiport` | Nome do banco |
| `POSTGRES_HOST` | `localhost` | Host do banco |
| `POSTGRES_PORT` | `5432` | Porta do banco exposta na sua máquina |
| `DATABASE_URL` | `postgres://quimiport:quimiport@localhost:5432/quimiport` | String de conexão usada pela API, pelas migrations e pelos testes de integração |

## Como executar os testes

```bash
# Testes unitários e de API (não precisam de banco)
npm test

# Testes de integração (usam o PostgreSQL de verdade)
docker compose up -d db
npm run db:migrate
npm run test:integration
```

Os testes estão organizados em:

| Pasta | O que testa |
| --- | --- |
| `tests/domain` | Entidades e regras de negócio (`ProdutoQuimico`, `CargaQuimica`, máquina de estados) |
| `tests/application` | Casos de uso encadeados, com repositórios em memória |
| `tests/api` | Endpoints HTTP com Supertest: status, validações, formato das respostas e erros |
| `tests/integration` | Endpoints contra o PostgreSQL real: gravação de vínculos, seed e uso dos grupos de compatibilidade |

Os cenários exigidos pelo desafio estão todos cobertos: cadastro de produto, bloqueio sem
nome e sem classe de risco, registro de carga, bloqueio com produto inativo e com quantidade
menor ou igual a zero, bloqueio de liberação sem documentação, atualização de status,
transições permitidas e proibidas, cancelamento e tentativa de movimentar carga bloqueada.

## Documentação da API

A documentação fica em dois lugares:

- **Swagger UI:** com a API no ar, acesse **http://localhost:3000/docs**. A página mostra
  cada endpoint com parâmetros, exemplos de request e response, códigos de erro e as regras
  de negócio aplicadas, e permite testar as rotas pelo navegador (**Try it out**). O contrato
  OpenAPI 3.0 está em [`docs/openapi.yaml`](docs/openapi.yaml) e também em
  `http://localhost:3000/docs/openapi.json`, para importar em outras ferramentas.
- **Postman:** a collection em
  [`docs/quimiport.postman_collection.json`](docs/quimiport.postman_collection.json) traz as
  requisições prontas. Importe o arquivo no Postman (**Import → File**) e ajuste a variável
  `baseUrl` (padrão: `http://localhost:3000`). A collection guarda os ids criados em
  variáveis, então dá para executar as requisições em sequência.

O `docs/openapi.yaml` é a referência do contrato. Um teste (`tests/api/docs.api.test.ts`)
confere que todos os endpoints da API estão documentados nele.

### Formato das respostas

Respostas de sucesso trazem os dados em `dados`; listagens trazem também `total`:

```json
{ "dados": [ { "id": "..." } ], "total": 1 }
```

Erros seguem sempre o mesmo formato:

```json
{
  "erro": {
    "codigo": "TRANSICAO_INVALIDA",
    "mensagem": "Não é possível transicionar a carga de \"bloqueada\" para \"em_movimentacao\"."
  }
}
```

Erros de validação (`DADOS_INVALIDOS`) trazem também `detalhes`, com o problema de cada campo.

### Códigos de erro

| HTTP | Quando | Códigos |
| --- | --- | --- |
| 400 | Dados de entrada inválidos | `DADOS_INVALIDOS`, `JSON_INVALIDO`, `NOME_OBRIGATORIO`, `CLASSE_RISCO_INVALIDA`, `STATUS_INVALIDO`, `PRODUTO_OBRIGATORIO`, `QUANTIDADE_INVALIDA`, `RESPONSAVEL_TECNICO_OBRIGATORIO` |
| 404 | Recurso ou rota não existe | `PRODUTO_NAO_ENCONTRADO`, `CARGA_NAO_ENCONTRADA`, `CLASSE_RISCO_NAO_ENCONTRADA`, `GRUPO_COMPATIBILIDADE_NAO_ENCONTRADO`, `RESPONSAVEL_TECNICO_NAO_ENCONTRADO`, `ROTA_NAO_ENCONTRADA` |
| 409 | Conflito com o estado atual | `PRODUTO_JA_INATIVO`, `PRODUTO_JA_ATIVO` |
| 413 | Corpo maior que 100 KB | `PAYLOAD_MUITO_GRANDE` |
| 422 | Regra de negócio violada | `PRODUTO_INATIVO`, `TRANSICAO_INVALIDA`, `DOCUMENTACAO_INCOMPLETA` |
| 500 | Erro inesperado (detalhes só no log) | `ERRO_INTERNO` |

## Principais endpoints

### Produtos químicos

| Método | Rota | Descrição | Sucesso |
| --- | --- | --- | --- |
| POST | `/produtos-quimicos` | Cria um produto | 201 |
| GET | `/produtos-quimicos` | Lista produtos (filtro opcional `?status=ativo\|inativo`) | 200 |
| GET | `/produtos-quimicos/:id` | Busca um produto pelo id | 200 |
| PUT | `/produtos-quimicos/:id` | Atualiza nome, descrição, classe de risco e grupos | 200 |
| PATCH | `/produtos-quimicos/:id/inativar` | Inativa o produto | 204 |
| PATCH | `/produtos-quimicos/:id/ativar` | Reativa um produto inativo | 204 |

Exemplo de criação:

```http
POST /produtos-quimicos
Content-Type: application/json

{
  "nome": "Ácido Sulfúrico",
  "descricao": "Ácido forte corrosivo",
  "numeroONU": "UN1830",
  "classeRisco": "<id de GET /classes-risco>",
  "gruposCompatibilidade": ["G1"]
}
```

```json
{
  "dados": {
    "id": "e685e030-af19-4f59-a7b1-0770d5c6ab35",
    "nome": "Ácido Sulfúrico",
    "descricao": "Ácido forte corrosivo",
    "numeroONU": "UN1830",
    "classeRisco": { "id": "4a3d93f8-...", "codigo": "classe_8_corrosivos", "descricao": "Substâncias corrosivas" },
    "gruposCompatibilidade": [{ "id": "9a11687f-...", "codigo": "G1", "descricao": "Ácidos" }],
    "status": "ativo",
    "createdAt": "2026-10-16T00:20:57.597Z",
    "updatedAt": "2026-10-16T00:20:57.597Z"
  }
}
```

- `classeRisco` recebe o **id** de uma classe cadastrada (veja `GET /classes-risco`).
- `gruposCompatibilidade` aceita o id ou o código (`"G1"`) de grupos cadastrados
  (veja `GET /grupos-compatibilidade`). Um grupo que não está cadastrado retorna
  `404 GRUPO_COMPATIBILIDADE_NAO_ENCONTRADO` e o produto não é gravado. No `PUT`, a lista
  enviada substitui a atual, `[]` remove todos e omitir o campo mantém os grupos como estão.
- O status muda só pelos endpoints `/inativar` e `/ativar`, não pelo `PUT`.

### Cargas químicas

| Método | Rota | Descrição | Sucesso |
| --- | --- | --- | --- |
| POST | `/cargas-quimicas` | Registra uma carga (nasce com status `registrada`) | 201 |
| GET | `/cargas-quimicas` | Lista cargas (filtros opcionais `?status=` e `?produtoQuimicoId=`) | 200 |
| GET | `/cargas-quimicas/:id` | Busca uma carga pelo id | 200 |
| PATCH | `/cargas-quimicas/:id/status` | Muda o status (corpo: `{ "status": "em_analise" }`) | 200 |
| PATCH | `/cargas-quimicas/:id/bloquear` | Bloqueia a carga (corpo opcional: `{ "motivo": "..." }`) | 200 |
| PATCH | `/cargas-quimicas/:id/liberar` | Libera a carga | 200 |
| PATCH | `/cargas-quimicas/:id/cancelar` | Cancela a carga | 200 |

Exemplo de registro:

```http
POST /cargas-quimicas
Content-Type: application/json

{
  "codigoCarga": "SSZ-2026-0001",
  "produtos": ["<id do produto>", "<id de outro produto>"],
  "quantidade": 1200,
  "unidadeMedida": "kg",
  "origem": "Terminal Alemoa",
  "destino": "Cubatão",
  "responsavelTecnico": "<id do responsável técnico>",
  "documentacaoObrigatoria": true,
  "dataEntrada": "2026-10-20T10:00:00Z"
}
```

```json
{
  "dados": {
    "id": "81b74dcb-ae2b-46a1-89df-0dfd965b417d",
    "codigoCarga": "SSZ-2026-0001",
    "quantidade": 1200,
    "unidadeMedida": "kg",
    "origem": "Terminal Alemoa",
    "destino": "Cubatão",
    "responsavelTecnico": { "id": "0c8c2542-...", "nome": "Maria Souza" },
    "documentacaoObrigatoria": true,
    "status": "registrada",
    "produtos": [
      { "id": "e685e030-...", "nome": "Ácido Sulfúrico", "numeroONU": "UN1830", "classeRisco": "classe_8_corrosivos" }
    ],
    "dataEntrada": "2026-10-20T10:00:00.000Z",
    "createdAt": "2026-10-20T10:00:01.000Z",
    "updatedAt": "2026-10-20T10:00:01.000Z"
  }
}
```

- `unidadeMedida` aceita `kg`, `tonelada`, `litro` e `metro_cubico`.
- `documentacaoObrigatoria` indica se toda a documentação exigida já foi entregue (padrão `false`).
- `dataEntrada` é opcional (padrão: momento do registro).
- `status` não é aceito no registro.

### Cadastros de apoio

| Método | Rota | Descrição | Sucesso |
| --- | --- | --- | --- |
| GET | `/classes-risco` | Lista as 9 classes de risco da ONU (somente leitura) | 200 |
| GET | `/grupos-compatibilidade` | Lista os 4 grupos de compatibilidade cadastrados (somente leitura) | 200 |
| POST | `/responsaveis-tecnicos` | Cadastra um responsável técnico (só `nome` é obrigatório; aceita `telefone`, `email`, `cpf`, `registroCrq`) | 201 |
| GET | `/responsaveis-tecnicos` | Lista os responsáveis técnicos | 200 |
| GET | `/responsaveis-tecnicos/:id` | Busca um responsável pelo id | 200 |
| GET | `/health` | Verifica se a API está no ar | 200 |
| GET | `/docs` | Documentação interativa (Swagger UI); o contrato em JSON fica em `/docs/openapi.json` | 200 |

## Regras de negócio

**Produto químico**

- Não pode ser cadastrado sem nome (nem com nome só de espaços).
- Não pode ser cadastrado sem classe de risco, e a classe precisa existir.
- Não pode ser cadastrado com status inválido (aceita só `ativo` e `inativo`).
- Produto inativo não pode ser usado em novas cargas. Ele pode ser reativado.

**Carga química**

- Não pode ser registrada sem ao menos um produto químico.
- Não pode ser registrada com produto inativo: se um dos produtos estiver inativo, a carga inteira é recusada.
- A quantidade deve ser maior que zero.
- Toda carga precisa de um responsável técnico cadastrado.
- Não pode ser liberada sem a documentação obrigatória completa, nem pelo `/liberar` nem pelo `/status`.
- Carga bloqueada não pode entrar em movimentação.
- Carga cancelada não pode ser liberada.
- Carga em inspeção não pode ser finalizada sem antes ser liberada.

## Transição de Status da Carga

O controlo do ciclo de vida das cargas no QuimiPort é gerido através de uma máquina de estados finitos baseada no tipo `StatusCargaType`. A tabela abaixo detalha as transições permitidas e proibidas para cada estado do processo.

### Tabela de Matriz de Transição

| Status Atual | Transições Permitidas | Transições Proibidas (Exemplos) | Descrição do Estado |
| :--- | :--- | :--- | :--- |
| **`registrada`** | `em_analise`, `cancelada` | `liberada`, `bloqueada`, `finalizada` | Carga registada no sistema, aguardando início da triagem documental. |
| **`em_analise`** | `em_inspecao`, `cancelada` | `registrada`, `liberada`, `finalizada` | Documentação sob avaliação técnica/fiscal. |
| **`em_inspecao`** | `liberada`, `bloqueada`, `cancelada` | `registrada`, `em_analise`, `finalizada` | Carga sob vistoria física/química no porto. |
| **`liberada`** | `em_movimentacao`, `cancelada` | `registrada`, `em_analise`, `bloqueada` | Inspeção concluída e carga autorizada para trânsito. |
| **`bloqueada`** | `cancelada` | `liberada`, `em_movimentacao`, `finalizada` | Carga com irregularidades detetadas na inspeção. |
| **`em_movimentacao`** | `finalizada` | `registrada`, `liberada`, `cancelada` | Carga em deslocamento/operação logística no terminal. |
| **`finalizada`** | *(Nenhuma - Estado Final)* | Qualquer transição | Processo concluído com sucesso. |
| **`cancelada`** | *(Nenhuma - Estado Final)* | Qualquer transição | Processo interrompido/anulado. |

## Banco de dados e modelagem

### Por que PostgreSQL

Os dados do QuimiPort são fortemente relacionais: uma carga tem vários produtos, um
produto aparece em várias cargas, cada produto tem uma classe de risco e vários grupos
de compatibilidade, e cada carga tem um responsável técnico. Um banco relacional
garante esses vínculos com chaves estrangeiras (não existe carga apontando para um
produto que não existe) e permite gravar a carga e seus vínculos numa única transação.
O esquema também acompanha bem a evolução prevista: novas tabelas (documentos,
histórico de status, usuários) entram como novas relações, sem reestruturar o que existe.

O acesso é feito com o **Drizzle ORM**, que gera consultas tipadas a partir do schema
em TypeScript (`src/infra/database/schema`), e as migrations ficam versionadas em SQL
em `src/infra/migrations`.

### Tabelas

| Tabela | Chave primária | Chaves estrangeiras | Demais campos |
| --- | --- | --- | --- |
| `classe_risco` | `id` (uuid) | — | `classe`, `descricao` |
| `grupo_compatibilidade` | `id` (uuid) | — | `grupo`, `descricao` |
| `produto_quimico` | `id` (uuid) | `classe_risco_id` → `classe_risco.id` | `nome`, `descricao`, `numero_onu`, `status` |
| `produto_grupo_compatibilidade` | `id` (uuid) | `produto_id` → `produto_quimico.id`<br>`grupo_compatibilidade_id` → `grupo_compatibilidade.id` | — |
| `responsavel_tecnico` | `id` (uuid) | — | `nome`, `telefone`, `email`, `cpf`, `registro_crq`, `status` |
| `carga_quimica` | `id` (uuid) | `responsavel_tecnico_id` → `responsavel_tecnico.id` | `codigo_carga`, `quantidade`, `unidade_medida`, `origem`, `destino`, `documentacao_obrigatoria`, `status`, `data_entrada`, `motivo_bloqueio` |
| `produto_carga_quimica` | `id` (uuid) | `produto_id` → `produto_quimico.id`<br>`carga_quimica_id` → `carga_quimica.id` | — |
| `documento` | `id` (uuid) | `carga_quimica_id` → `carga_quimica.id` | `arquivo`, `titulo` |

### Relacionamentos

| Relacionamento | Cardinalidade | Como é feito |
| --- | --- | --- |
| Classe de risco → produto químico | 1:N | FK `produto_quimico.classe_risco_id` |
| Produto químico ↔ grupo de compatibilidade | N:N | Tabela de ligação `produto_grupo_compatibilidade` |
| Produto químico ↔ carga química | N:N | Tabela de ligação `produto_carga_quimica` |
| Responsável técnico → carga química | 1:N | FK `carga_quimica.responsavel_tecnico_id` |
| Carga química → documento | 1:N | FK `documento.carga_quimica_id` |

Todas as tabelas têm também `created_at` e `updated_at`.

### Como os dados são armazenados

- **Produtos químicos** ficam em `produto_quimico`. A classe de risco é uma chave
  estrangeira para `classe_risco` (cadastrada pela migration `0002`), e os grupos de
  compatibilidade ficam na tabela de ligação `produto_grupo_compatibilidade` (N:N).
  Os grupos aceitos são os de `grupo_compatibilidade`, cadastrados pela migration `0003`:

  | Código | Descrição |
  | --- | --- |
  | `G1` | Ácidos |
  | `G2` | Bases (álcalis) |
  | `G3` | Oxidantes |
  | `G4` | Inflamáveis |

  A inativação é lógica: o produto nunca é apagado, só muda o `status`.
- **Cargas químicas** ficam em `carga_quimica`, com chave estrangeira para o
  `responsavel_tecnico`. O cancelamento também é lógico, pelo `status`.
- **Carga e produto** se relacionam pela tabela `produto_carga_quimica` (N:N): cada
  produto da carga vira uma linha, gravada na mesma transação da carga.
- **O status da carga** é uma coluna de texto, mas só é alterado pela máquina de estados
  do domínio: o caso de uso carrega a carga, a entidade valida a transição e só então
  o repositório grava o novo status. O motivo do bloqueio fica em `motivo_bloqueio`.

### Evolução nas próximas fases

- **Documentos da carga:** a tabela `documento` já existe no schema e permite trocar o
  booleano `documentacao_obrigatoria` por uma checagem dos documentos realmente anexados.
- **Histórico de status:** uma tabela `historico_status_carga` (carga, status anterior,
  novo status, data, usuário) para auditoria das movimentações.
- **Quantidade por produto:** mover a quantidade para `produto_carga_quimica`, permitindo
  quantidades diferentes para cada produto da carga.
- **Compatibilidade entre produtos:** usar os grupos de compatibilidade para impedir
  cargas com produtos incompatíveis.
- **Usuários e permissões:** autenticação e perfis (operador, inspetor, responsável técnico).

## Decisões arquiteturais

O projeto segue uma arquitetura em camadas inspirada em Clean Architecture. As
dependências apontam para dentro: o domínio não conhece Express nem banco de dados.

```
src/
  domain/          -> entidades, enums, máquina de estados e erros de domínio
  application/     -> casos de uso e contratos (interfaces) dos repositórios
  infra/           -> conexão com o banco, schema, migrations e repositórios Drizzle
  api/             -> rotas, controllers, DTOs (Zod), middlewares e montagem do app
  config/          -> variáveis de ambiente e logger
tests/             -> testes de domínio, casos de uso, API e integração
docs/              -> contrato OpenAPI (servido em /docs) e collection do Postman
```

- **Domínio** (`src/domain`): as entidades `ProdutoQuimico` e `CargaQuimica` validam as
  próprias regras e lançam `DomainError` com um código (ex.: `PRODUTO_INATIVO`). Não há
  regra de negócio nos controllers.
- **Casos de uso** (`src/application/use-cases`): cada operação é uma classe
  (`RegistrarCarga`, `LiberarCarga`, ...). Eles fazem o papel dos services: buscam o que
  for preciso nos repositórios, chamam a entidade e persistem o resultado.
- **Repositórios**: a aplicação depende só das interfaces (`src/application/repositories`);
  as implementações com Drizzle ficam em `src/infra/repositories`. Nos testes de API,
  entram repositórios em memória no lugar delas.
- **DTOs e validação** (`src/api/dtos`): o Zod valida formato, tipos e campos
  obrigatórios antes de chegar ao caso de uso, e recusa campos desconhecidos. As regras de
  negócio continuam no domínio, então valem mesmo se a entrada vier de outro lugar.
- **Tratamento de erros** (`src/api/middlewares/errorHandler.ts`): é o único lugar que
  traduz erros para HTTP, com uma tabela de código de erro para status.

## Logs e tratamento de erros

- Toda requisição gera uma linha de log com método, rota, status e tempo de resposta
  (`src/api/middlewares/requestLogger.ts`): `INFO` para sucesso, `WARN` para 4xx e `ERROR` para 5xx.
- Erros de validação e de regra de negócio são registrados como `WARN` com o código e a mensagem.
- Erros internos são registrados como `ERROR` com o stack trace completo, mas a resposta ao
  cliente traz só uma mensagem genérica, sem vazar detalhes.

## CI/CD

O workflow `.github/workflows/ci.yml` roda a cada push e pull request na `main`:

1. Instala as dependências (`npm ci`).
2. Compila o projeto e checa os tipos (`npm run build`).
3. Executa os testes (`npm test`).

Não há deploy nesta fase.

## Integrantes do grupo

- Paula — domínio e regras de negócio
- Vitor — API (rotas e controllers)
- Amanda / Samuel — persistência e banco de dados
- Lucas — Docker, CI/CD e documentação
- Testes automatizados — feitos por todo o grupo
