# Oficina Mecânica — CRUD com Node.js

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

Acesse http://localhost:3000

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

Testes das rotas: arquivo `client.http` (extensão REST Client).
