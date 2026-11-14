import "dotenv/config";
import express from "express";
import methodOverride from "method-override";
import path from "node:path";
import { fileURLToPath } from "node:url";
import servicoRoutes from "./routes/servicoRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import paginaRoutes from "./routes/paginaRoutes.js";
import { paginaNaoEncontrada, tratarErros } from "./middlewares/erros.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Disponível em todas as views: formatação de moeda e caminho atual (menu ativo).
// Fica antes dos parsers para existir até quando o corpo da requisição é inválido.
app.locals.moeda = (valor) => Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const AVISOS = { criada: "Ordem de serviço aberta.", salva: "Alterações salvas.", excluida: "Ordem de serviço excluída." };
app.use((req, res, next) => {
  res.locals.caminho = req.path;
  res.locals.aviso = AVISOS[req.query.ok] ?? null; // confirmação após criar, editar ou excluir
  next();
});

// Middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Rotas
app.use("/", paginaRoutes);
app.use("/servicos", servicoRoutes);
app.use("/api", apiRoutes);

// Erros (sempre por último)
app.use(paginaNaoEncontrada);
app.use(tratarErros);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
