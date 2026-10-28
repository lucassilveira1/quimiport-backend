# QuimiPort Backend

API de gestão de cargas químicas em um contexto portuário, inspirada em operações
logísticas do Porto de Santos. Projeto desenvolvido para o Tech Challenge da
Fase 2 da Pós Tech em Full Stack Development.

Repositório: https://github.com/lucassilveira1/quimiport-backend

## Status

Repositório em construção — Fase 2 (implementação da primeira versão do backend).

## Tecnologias

- Node.js + TypeScript
- Express (a confirmar/justificar)
- PostgreSQL (a confirmar/justificar)
- Docker / Docker Compose
- Jest (testes)
- GitHub Actions (CI)

## Estrutura do projeto

```
src/
  domain/          -> entidades e regras de negócio (Paula)
  application/      -> casos de uso + contratos de repositório (Paula)
  infra/            -> banco de dados e implementação dos repositórios (Amanda/Samuel)
  api/              -> rotas, controllers, middlewares (Vitor)
  config/           -> variáveis de ambiente, logger
tests/              -> testes unitários e de integração (todo o grupo, ao final)
docs/               -> documentação da API (Lucas)
```

## Como executar localmente

```bash
npm install
cp .env.example .env
npm run dev
```

## Como buildar

```bash
npm run build
npm start
```

## Como executar com Docker

```bash
docker compose up --build
```

## Como executar os testes

```bash
npm test
```

## Transição de Status da Carga

O controlo do ciclo de vida das cargas no QuimiPort é gerido através de uma máquina de estados finitos baseada no tipo `StatusCargaType`. A tabela e o diagrama abaixo detalham as transições permitidas e proibidas para cada estado do processo.

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

---

### Diagrama da Máquina de Estados (Mermaid)

```mermaid
stateDiagram-v2
    [*] --> registrada
    
    registrada --> em_analise: Iniciar análise
    registrada --> cancelada: Cancelar
    
    em_analise --> em_inspecao: Encaminhar p/ inspeção
    em_analise --> cancelada: Cancelar
    
    em_inspecao --> liberada: Aprovar inspeção
    em_inspecao --> bloqueada: Reprovar inspeção
    em_inspecao --> cancelada: Cancelar
    
    liberada --> em_movimentacao: Iniciar transporte
    liberada --> cancelada: Cancelar
    
    bloqueada --> cancelada: Anular/Descartar
    
    em_movimentacao --> finalizada: Concluir operação
    
    finalizada --> [*]
    cancelada --> [*]

---

## Integrantes do grupo

- Paula — domínio e regras de negócio
- Vitor — API (rotas e controllers)
- Amanda / Samuel — persistência e banco de dados
- Lucas — Docker, CI/CD e documentação
- Testes automatizados — feitos por todo o grupo ao final

> TODO: completar com descrição da solução, decisões arquiteturais, banco de dados
> escolhido (com justificativa) e link da documentação da API, conforme a entrega final.

