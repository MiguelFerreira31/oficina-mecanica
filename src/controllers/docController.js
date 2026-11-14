import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as Servico from "../models/servicoModel.js";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

// Arquivos lidos do disco a cada acesso: a documentação mostra sempre o código atual
const arquivos = {
  pacote: "package.json",
  env: ".env.example",
  server: "src/server.js",
  schema: "prisma/schema.prisma",
  prismaConfig: "prisma.config.ts",
  conexao: "src/config/prisma.js",
  model: "src/models/servicoModel.js",
  rotas: "src/routes/servicoRoutes.js",
  api: "src/routes/apiRoutes.js",
  paginas: "src/routes/paginaRoutes.js",
  controller: "src/controllers/servicoController.js",
  erros: "src/middlewares/erros.js",
  header: "src/views/partials/header.ejs",
  placa: "src/views/partials/placa.ejs",
  tabela: "src/views/partials/tabela.ejs",
  detalhes: "src/views/servicos/detalhes.ejs",
  form: "src/views/servicos/form.ejs",
  http: "client.http",
};

// Recorta do texto da linha que contém `inicio` até a primeira linha igual a `fim` (padrão: "}" que fecha a função)
export function trecho(texto, inicio, fim = "}") {
  const linhas = texto.split("\n");
  const de = linhas.findIndex((l) => l.includes(inicio));
  if (de < 0) return texto;
  const ate = linhas.findIndex((l, i) => i >= de && l.trimEnd() === fim);
  return linhas.slice(de, ate < 0 ? undefined : ate + 1).join("\n");
}

export async function documentacao(req, res) {
  try {
    const codigo = {};
    for (const [chave, arquivo] of Object.entries(arquivos)) {
      codigo[chave] = (await readFile(path.join(raiz, arquivo), "utf8")).replace(/\r\n/g, "\n").trimEnd();
    }
    const [exemplo] = await Servico.listar();
    res.render("documentacao", { codigo, arquivos, trecho, exemplo: exemplo ?? null });
  } catch (erro) {
    console.error(erro);
    res.status(500).render("erro", { titulo: "Erro", mensagem: "Não foi possível montar a documentação." });
  }
}
