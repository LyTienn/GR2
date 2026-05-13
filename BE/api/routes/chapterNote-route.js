import { Router } from "express";
import { 
    createNote, 
    getNotesByChapter, 
    updateNote, 
    deleteNote 
} from '../controllers/note-controller.js';
import { authenticate } from "../middlewares/auth-middleware.js";

const router = Router();

router.get("/chapter/:chapterId", authenticate, getNotesByChapter);
router.post("/", authenticate, createNote);
router.put("/:id", authenticate, updateNote);
router.delete("/:id", authenticate, deleteNote);

export default router;