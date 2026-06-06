import BookshelfService from "../services/bookshelfService.js";

const getRequestUserId = (req) => {
  const userId = req.user?.userId || req.user?.id;
  if (!userId) throw new Error("User ID not found in request");
  return userId;
};

class BookshelfController {
  
  static async addToBookshelf(req, res) {
    try {
      const result = await BookshelfService.addToBookshelf(getRequestUserId(req), req.params.bookId, req.body.status);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Add to bookshelf error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getUserBookshelf(req, res) {
    try {
      const result = await BookshelfService.getUserBookshelf(getRequestUserId(req), req.query.status);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get user bookshelf error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getBookshelfByUserId(req, res) {
    try {
      const result = await BookshelfService.getBookshelfByUserId(req.params.userId, req.query.status);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Admin get user bookshelf error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async adminAddToBookshelf(req, res) {
    try {
      const result = await BookshelfService.adminAddToBookshelf(req.params.userId, req.params.bookId, req.body.status);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Admin add to bookshelf error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async adminRemoveFromBookshelf(req, res) {
    try {
      const result = await BookshelfService.adminRemoveFromBookshelf(req.params.userId, req.params.bookId, req.query.status);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Admin remove from bookshelf error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async removeFromBookshelf(req, res) {
    try {
      const result = await BookshelfService.removeFromBookshelf(getRequestUserId(req), req.params.bookId, req.query.status);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Remove from bookshelf error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async checkBookInBookshelf(req, res) {
    try {
      const result = await BookshelfService.checkBookInBookshelf(getRequestUserId(req), req.params.bookId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Check book in bookshelf error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async saveReadingProgress(req, res) {
    try {
      const { chapterId, scrollPosition } = req.body;
      const result = await BookshelfService.saveReadingProgress(getRequestUserId(req), req.params.bookId, chapterId, scrollPosition);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Save progress error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getReadingProgress(req, res) {
    try {
      const result = await BookshelfService.getReadingProgress(getRequestUserId(req), req.params.bookId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get progress error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

export default BookshelfController;
