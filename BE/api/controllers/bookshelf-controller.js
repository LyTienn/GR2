import BookshelfService from "../services/bookshelfService.js";

class BookshelfController {
  
  static async addToBookshelf(req, res) {
    try {
      const result = await BookshelfService.addToBookshelf(req.user.userId, req.params.bookId, req.body.status);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Add to bookshelf error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getUserBookshelf(req, res) {
    try {
      const result = await BookshelfService.getUserBookshelf(req.user.userId, req.query.status);
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
      const result = await BookshelfService.removeFromBookshelf(req.user.userId, req.params.bookId, req.query.status);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Remove from bookshelf error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async checkBookInBookshelf(req, res) {
    try {
      const result = await BookshelfService.checkBookInBookshelf(req.user.userId, req.params.bookId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Check book in bookshelf error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async saveReadingProgress(req, res) {
    try {
      const { chapterId, scrollPosition } = req.body;
      const result = await BookshelfService.saveReadingProgress(req.user.userId, req.params.bookId, chapterId, scrollPosition);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Save progress error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getReadingProgress(req, res) {
    try {
      const result = await BookshelfService.getReadingProgress(req.user.userId, req.params.bookId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get progress error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

export default BookshelfController;