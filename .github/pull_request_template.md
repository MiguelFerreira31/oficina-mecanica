## O que muda

<!-- Descreva a alteração em poucas linhas. -->

## Como testar

1. `npm install`, `npx prisma migrate dev`, `npx prisma generate`
2. `npm run dev` e, em outro terminal, `npm test`

## Checklist

- [ ] O CI passou (testes de integração com MySQL)
- [ ] Rotas novas passam por Rota → Controller → Model
- [ ] Erros tratados no controller (validação 400, inexistente 404)
- [ ] `client.http` e documentação atualizados, se a rota mudou
