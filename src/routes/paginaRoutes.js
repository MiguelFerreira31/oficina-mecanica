import { Router } from "express";
import { painel } from "../controllers/servicoController.js";
import { documentacao } from "../controllers/docController.js";

const router = Router();

router.get("/", painel);                    // painel inicial (HTML)
router.get("/documentacao", documentacao);  // documentação do projeto (HTML)

export default router;
