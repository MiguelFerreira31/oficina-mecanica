export function paginaNaoEncontrada(req, res) {
  res.status(404).render("erro", {
    titulo: "Página não encontrada",
    mensagem: "O endereço que você acessou não existe.",
  });
}

export function tratarErros(err, req, res, next) {
  console.error(err);
  // JSON malformado enviado no corpo (ex.: pelo REST Client): erro do cliente, não do servidor
  if (err.type === "entity.parse.failed") {
    return res.status(400).render("erro", {
      titulo: "Requisição inválida",
      mensagem: "O corpo da requisição não é um JSON válido.",
    });
  }
  // Corpo acima do limite de 100kb dos parsers do Express (413)
  if (err.type === "entity.too.large") {
    return res.status(413).render("erro", {
      titulo: "Dados grandes demais",
      mensagem: "O conteúdo enviado passa do limite de 100 KB. Encurte a descrição e tente de novo.",
    });
  }
  // Outros erros que o Express já marca como do cliente (4xx) mantêm o próprio status
  const status = err.status ?? err.statusCode;
  if (status >= 400 && status < 500) {
    return res.status(status).render("erro", {
      titulo: "Requisição inválida",
      mensagem: "Não foi possível processar o que foi enviado.",
    });
  }
  res.status(500).render("erro", {
    titulo: "Erro interno",
    mensagem: "Algo deu errado. Tente novamente mais tarde.",
  });
}
