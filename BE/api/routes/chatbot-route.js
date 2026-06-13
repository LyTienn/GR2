import express from "express";
import { authenticate } from "../middlewares/auth-middleware.js";
import {
  chat,
  syncBook,
  getConversations,
  getConversationById,
  createNewConversation,
  deleteConversation,
} from "../controllers/chatbot-controller.js";

const router = express.Router();

router.post("/chat", authenticate, chat);
router.post("/sync", authenticate, syncBook);

router.get("/conversations", authenticate, getConversations);
router.get("/conversations/:id", authenticate, getConversationById);
router.post("/conversations", authenticate, createNewConversation);
router.delete("/conversations/:id", authenticate, deleteConversation);

export default router;
