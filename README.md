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

## Integrantes do grupo

- Paula — domínio e regras de negócio
- Vitor — API (rotas e controllers)
- Amanda / Samuel — persistência e banco de dados
- Lucas — Docker, CI/CD e documentação
- Testes automatizados — feitos por todo o grupo ao final

> TODO: completar com descrição da solução, decisões arquiteturais, banco de dados
> escolhido (com justificativa) e link da documentação da API, conforme a entrega final.
