import { Router } from "express";
import * as servico from "../controllers/servicoController.js";

const router = Router();

router.get("/servicos", servico.apiIndex);
router.get("/servicos/:id", servico.apiShow);

export default router;
