import { Router } from "express";
import * as servico from "../controllers/servicoController.js";

const router = Router();

router.get("/", servico.index);              // READ (lista)
router.get("/novo", servico.novo);           // formulário
router.post("/", servico.store);             // CREATE
router.get("/:id", servico.show);            // READ (um)
router.get("/:id/editar", servico.editar);   // formulário
router.put("/:id", servico.update);          // UPDATE
router.delete("/:id", servico.destroy);      // DELETE

export default router;
