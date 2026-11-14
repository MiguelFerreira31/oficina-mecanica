# Oficina Mecânica — CRUD com Node.js

[![CI](https://github.com/MiguelFerreira31/oficina-mecanica/actions/workflows/ci.yml/badge.svg)](https://github.com/MiguelFerreira31/oficina-mecanica/actions/workflows/ci.yml)
[![CD](https://github.com/MiguelFerreira31/oficina-mecanica/actions/workflows/cd.yml/badge.svg)](https://github.com/MiguelFerreira31/oficina-mecanica/actions/workflows/cd.yml)

CRUD de ordens de serviço de uma oficina, com Express, Prisma (MySQL), EJS e arquitetura MVC.

## Como rodar

1. Copie `.env.example` para `.env` e ajuste usuário/senha do MySQL.
2. Execute:

```bash
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

Acesse http://localhost:3000. A página `/documentacao` explica em detalhes como o projeto funciona.

## Rotas

| CRUD   | Verbo  | Rota                                 | Resposta |
|--------|--------|--------------------------------------|----------|
| Painel | GET    | `/`                                  | HTML     |
| Docs   | GET    | `/documentacao`                      | HTML     |
| Create | POST   | `/servicos`                          | redirect |
| Read   | GET    | `/servicos`, `/servicos/:id`         | HTML     |
| Update | PUT    | `/servicos/:id`                      | redirect |
| Delete | DELETE | `/servicos/:id`                      | redirect |
| API    | GET    | `/api/servicos`, `/api/servicos/:id` | JSON     |

## Testes

- `client.http`: requisições manuais pela extensão REST Client do VS Code.
- `npm test`: testes de integração automáticos (`test/rotas.test.mjs`). Com o servidor rodando (`npm run dev`), cobrem os 4 verbos do CRUD, as respostas em HTML e JSON, a validação e os erros 400, 404 e 413.

## CI/CD (GitHub Actions)

| Workflow | Quando roda | O que faz |
|----------|-------------|-----------|
| **CI** (`.github/workflows/ci.yml`) | Em todo Pull Request para a `main` e em todo push na `main` | Sobe um MySQL 8, aplica as migrations, inicia o servidor e roda `npm test` |
| **CD** (`.github/workflows/cd.yml`) | Depois que o CI passa num push para a `main` | Empacota o commit testado e publica uma nova versão em **Releases** com o `.zip` do projeto |

A `main` é protegida: um Pull Request só pode ser mesclado com o CI verde.
