import { Router } from "express";
import { getAllBooks, getBookById, getBookChapters, createBook, updateBook, deleteBook, getSimilarBooks } from "../controllers/book-controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth-middleware.js";

const router = Router();

// Public routes
router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.get("/:id/chapters", authenticate, getBookChapters);
router.get("/:id/similar", getSimilarBooks); // lấy sách tương tự dựa trên AI Recommendation

// Admin routes
router.post("/", authenticate, authorizeRoles("ADMIN"), createBook);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), updateBook);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteBook);

export default router;
