import express from "express";
import CommentController from "../controllers/comment-controller.js";
import { authenticate, authorizeRoles, optionalAuth } from "../middlewares/auth-middleware.js";
import { body } from "express-validator";

const router = express.Router();

// Admin: Lấy tất cả comments
router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.getAllComments
);

// Tạo comment cho sách
router.post(
  "/books/:bookId/comments",
  authenticate,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("content").optional().trim(),
  ],
  CommentController.createComment
);

// Lấy comments của sách
router.get("/books/:bookId/comments", optionalAuth, CommentController.getBookComments);

// Lấy comments của user hiện tại
router.get("/my-comments", authenticate, CommentController.getUserComments);

// Cập nhật comment
router.put(
  "/:commentId",
  authenticate,
  [
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("content").optional().trim(),
  ],
  CommentController.updateComment
);

// Xóa comment
router.delete(
  "/:commentId",
  authenticate,
  CommentController.deleteComment
);

// Get Sentiment Stats
router.get(
  "/sentiment-stats",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.getSentimentStats
);

// Get Books with Comments (Admin Filter)
router.get(
  "/books-with-comments",
  authenticate,
  authorizeRoles("ADMIN"),
  CommentController.getBooksWithComments
);

// Moderation routes moved to top

// Like/Dislike comment
router.post(
  "/:commentId/react",
  authenticate,
  CommentController.reactToComment
);

export default router;
