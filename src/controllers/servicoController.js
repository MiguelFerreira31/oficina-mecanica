import * as Servico from "../models/servicoModel.js";

// Campos de texto: rótulo mostrado ao usuário e tamanho máximo (igual ao schema.prisma)
const CAMPOS = {
  cliente: { rotulo: "Cliente", max: 100 },
  veiculo: { rotulo: "Veículo", max: 100 },
  placa: { rotulo: "Placa", max: 10 },
  descricao: { rotulo: "Serviço a executar", max: 2000 },
};
const VALOR_MAXIMO = 99999999.99; // limite de Decimal(10, 2)

// Lê e valida os campos enviados pelo formulário (ou JSON)
function lerDados(body) {
  const dados = {};
  const faltando = [];

  for (const [campo, { rotulo, max }] of Object.entries(CAMPOS)) {
    const bruto = body[campo];
    if (bruto !== undefined && typeof bruto !== "string") {
      return { erro: `O campo ${rotulo} é inválido.` };
    }
    dados[campo] = (bruto ?? "").trim();
    if (!dados[campo]) faltando.push(rotulo);
    else if (dados[campo].length > max) {
      return { erro: `O campo ${rotulo} aceita no máximo ${max} caracteres.` };
    }
  }

  // Valor aceita número (JSON) ou texto (formulário), com até 2 casas decimais
  const valor = typeof body.valor === "number" ? String(body.valor) : (body.valor ?? "");
  if (typeof valor !== "string" || !valor.trim()) faltando.push("Valor");

  if (faltando.length) {
    return { erro: `Preencha todos os campos. Faltando: ${faltando.join(", ")}.` };
  }
  // Aceita o formato brasileiro digitado no formulário: "1.350,50" vira "1350.50"
  let numero = valor.trim();
  if (numero.includes(",")) numero = numero.replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(numero) || Number(numero) > VALOR_MAXIMO) {
    return { erro: "O valor deve ser um número positivo com até 2 casas decimais, até R$ 99.999.999,99." };
  }

  dados.placa = dados.placa.toUpperCase();
  dados.valor = Number(numero);
  return { dados };
}

// Converte o :id da URL em número inteiro positivo (ou null se for inválido, ex.: "abc", "1abc", "-1")
function lerId(req) {
  const id = Number(req.params.id);
  return /^\d+$/.test(req.params.id) && id > 0 && id <= 2147483647 ? id : null;
}

function naoEncontrado(res) {
  return res.status(404).render("erro", {
    titulo: "Ordem não encontrada",
    mensagem: "Essa ordem de serviço não existe ou já foi excluída.",
  });
}

function idInvalido(res) {
  return res.status(400).render("erro", {
    titulo: "Endereço inválido",
    mensagem: "O número da ordem no endereço precisa ser um número inteiro, como /servicos/5.",
  });
}

// Painel inicial: resumo e últimas ordens em HTML
export async function painel(req, res) {
  try {
    const servicos = await Servico.listar();
    const total = servicos.reduce((soma, s) => soma + Number(s.valor), 0);
    res.render("painel", { recentes: servicos.slice(0, 5), quantidade: servicos.length, total });
  } catch (erro) {
    console.error(erro);
    res.status(500).render("erro", { titulo: "Erro", mensagem: "Não foi possível carregar o painel." });
  }
}

// READ - lista em HTML
export async function index(req, res) {
  try {
    const servicos = await Servico.listar();
    res.render("servicos/index", { servicos });
  } catch (erro) {
    console.error(erro);
    res.status(500).render("erro", { titulo: "Erro", mensagem: "Não foi possível listar as ordens de serviço." });
  }
}

// READ - detalhes em HTML
export async function show(req, res) {
  try {
    const id = lerId(req);
    if (!id) return idInvalido(res);
    const servico = await Servico.buscarPorId(id);
    if (!servico) return naoEncontrado(res);
    res.render("servicos/detalhes", { servico });
  } catch (erro) {
    console.error(erro);
    res.status(500).render("erro", { titulo: "Erro", mensagem: "Não foi possível carregar a ordem de serviço." });
  }
}

// Formulário de cadastro
export function novo(req, res) {
  try {
    res.render("servicos/form", { servico: {}, erro: null, acao: "/servicos" });
  } catch (erro) {
    console.error(erro);
    res.status(500).render("erro", { titulo: "Erro", mensagem: "Não foi possível abrir o formulário." });
  }
}

// CREATE
export async function store(req, res) {
  try {
    const { dados, erro } = lerDados(req.body);
    if (erro) {
      return res.status(400).render("servicos/form", { servico: req.body, erro, acao: "/servicos" });
    }
    const criado = await Servico.criar(dados);
    res.redirect(`/servicos/${criado.id}?ok=criada`);
  } catch (erro) {
    console.error(erro);
    res.status(500).render("servicos/form", { servico: req.body, erro: "Erro ao salvar.", acao: "/servicos" });
  }
}

// Formulário de edição
export async function editar(req, res) {
  try {
    const id = lerId(req);
    if (!id) return idInvalido(res);
    const servico = await Servico.buscarPorId(id);
    if (!servico) return naoEncontrado(res);
    res.render("servicos/form", { servico, erro: null, acao: `/servicos/${id}?_method=PUT` });
  } catch (erro) {
    console.error(erro);
    res.status(500).render("erro", { titulo: "Erro", mensagem: "Não foi possível abrir a edição." });
  }
}

// UPDATE
export async function update(req, res) {
  const id = lerId(req);
  const acao = `/servicos/${id}?_method=PUT`;
  try {
    if (!id) return idInvalido(res);
    const { dados, erro } = lerDados(req.body);
    if (erro) {
      return res.status(400).render("servicos/form", { servico: { ...req.body, id }, erro, acao });
    }
    await Servico.atualizar(id, dados);
    res.redirect(`/servicos/${id}?ok=salva`);
  } catch (erro) {
    console.error(erro);
    if (erro.code === "P2025") return naoEncontrado(res);
    res.status(500).render("servicos/form", { servico: { ...req.body, id }, erro: "Erro ao atualizar.", acao });
  }
}

// DELETE
export async function destroy(req, res) {
  try {
    const id = lerId(req);
    if (!id) return idInvalido(res);
    const { count } = await Servico.excluir(id);
    if (count === 0) return naoEncontrado(res);
    res.redirect("/servicos?ok=excluida");
  } catch (erro) {
    console.error(erro);
    if (erro.code === "P2025") return naoEncontrado(res);
    res.status(500).render("erro", { titulo: "Erro", mensagem: "Não foi possível excluir a ordem de serviço." });
  }
}

// API - respostas em JSON
export async function apiIndex(req, res) {
  try {
    const servicos = await Servico.listar();
    res.status(200).json(servicos);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao listar as ordens de serviço." });
  }
}

export async function apiShow(req, res) {
  try {
    const id = lerId(req);
    if (!id) return res.status(400).json({ erro: "ID inválido." });
    const servico = await Servico.buscarPorId(id);
    if (!servico) return res.status(404).json({ erro: "Ordem de serviço não encontrada." });
    res.status(200).json(servico);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar a ordem de serviço." });
  }
}
