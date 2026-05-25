import express from "express";
import { chat, syncBook } from "../controllers/chatbot-controller.js";

const router = express.Router();

router.post("/chat", chat);
router.post("/sync", syncBook);

export default router;
