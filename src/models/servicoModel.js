import prisma from "../config/prisma.js";

export const listar = () =>
  prisma.servico.findMany({ orderBy: { criadoEm: "desc" } });

export const buscarPorId = (id) =>
  prisma.servico.findUnique({ where: { id } });

export const criar = (dados) =>
  prisma.servico.create({ data: dados });

export const atualizar = (id, dados) =>
  prisma.servico.update({ where: { id }, data: dados });

// deleteMany executa um único DELETE atômico e devolve { count }: com dois pedidos simultâneos,
// só um apaga (count 1) e o outro recebe count 0, que o controller transforma em 404
export const excluir = (id) =>
  prisma.servico.deleteMany({ where: { id } });
