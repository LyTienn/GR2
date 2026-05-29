import UserBookshelf from "../models/user-bookshelf-model.js";
import Book from "../models/book-model.js";
import Author from "../models/author-model.js";
import Subject from "../models/subject-model.js";
import { Op } from "sequelize";

class BookshelfService {
  static async addToBookshelf(userId, bookId, status) {
    if (!["FAVORITE", "READING"].includes(status)) {
      return { statusCode: 400, data: { success: false, message: "Status must be either FAVORITE or READING" } };
    }

    const book = await Book.findByPk(bookId);
    if (!book) {
      return { statusCode: 404, data: { success: false, message: "Book not found" } };
    }

    const [item, created] = await UserBookshelf.findOrCreate({
      where: { user_id: userId, book_id: bookId },
      defaults: {
        is_favorite: status === 'FAVORITE',
        is_reading: status === 'READING',
        added_at: new Date()
      }
    });

    if (!created) {
      if (status === 'FAVORITE') {
        if (item.is_favorite) {
          return { statusCode: 409, data: { success: false, message: "Book already in favorite list" } };
        }
        item.is_favorite = true;
      } else if (status === 'READING') {
        if (item.is_reading) {
          return { statusCode: 409, data: { success: false, message: "Book already in reading list" } };
        }
        item.is_reading = true;
      }
      await item.save();
    }

    return { statusCode: 201, data: { success: true, message: `Book added to ${status.toLowerCase()} successfully` } };
  }

  static async getUserBookshelf(userId, status) {
    const where = { user_id: userId };

    if (status === 'FAVORITE') {
      where.is_favorite = true;
    } else if (status === 'READING') {
      where.is_reading = true;
    } else {
      where[Op.or] = [
        { is_favorite: true },
        { is_reading: true }
      ];
    }

    const bookshelfItems = await UserBookshelf.findAll({
      where,
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "image_url", "summary", "type"],
          include: [
            { model: Author, as: "author", attributes: ["name"] },
            { model: Subject, as: "subjects", attributes: ["name"], through: { attributes: [] } },
          ],
        },
      ],
      order: [["added_at", "DESC"]],
    });

    const grouped = { FAVORITE: [], READING: [] };

    bookshelfItems.forEach((item) => {
      if (item.is_favorite) {
        grouped.FAVORITE.push({ ...item.book.toJSON(), addedAt: item.added_at });
      }
      if (item.is_reading) {
        grouped.READING.push({ ...item.book.toJSON(), addedAt: item.added_at });
      }
    });

    return {
      statusCode: 200,
      data: { success: true, data: { favorites: grouped.FAVORITE, reading: grouped.READING, total: bookshelfItems.length } }
    };
  }

  static async getBookshelfByUserId(userId, status) {
    const where = { user_id: userId };
    if (status === 'FAVORITE') {
      where.is_favorite = true;
    } else if (status === 'READING') {
      where.is_reading = true;
    } else {
      where[Op.or] = [
        { is_favorite: true },
        { is_reading: true }
      ];
    }

    const bookshelfItems = await UserBookshelf.findAll({
      where,
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "image_url", "summary", "type"],
          include: [
            { model: Author, as: "author", attributes: ["name"] },
            { model: Subject, as: "subjects", attributes: ["name"], through: { attributes: [] } },
          ],
        },
      ],
      order: [["added_at", "DESC"]],
    });

    const grouped = { FAVORITE: [], READING: [] };

    bookshelfItems.forEach((item) => {
      if (item.is_favorite) {
        grouped.FAVORITE.push({ ...item.book.toJSON(), addedAt: item.added_at });
      }
      if (item.is_reading) {
        grouped.READING.push({ ...item.book.toJSON(), addedAt: item.added_at });
      }
    });

    return {
      statusCode: 200,
      data: { success: true, data: { favorites: grouped.FAVORITE, reading: grouped.READING, total: bookshelfItems.length } }
    };
  }

  static async adminAddToBookshelf(userId, bookId, status) {
    if (!["FAVORITE", "READING"].includes(status)) {
      return { statusCode: 400, data: { success: false, message: "Status must be either FAVORITE or READING" } };
    }

    const book = await Book.findByPk(bookId);
    if (!book) {
      return { statusCode: 404, data: { success: false, message: "Book not found" } };
    }

    const [item, created] = await UserBookshelf.findOrCreate({
      where: { user_id: userId, book_id: bookId },
      defaults: {
        is_favorite: status === 'FAVORITE',
        is_reading: status === 'READING',
        added_at: new Date()
      }
    });

    if (!created) {
      if (status === 'FAVORITE') {
        if (item.is_favorite) {
          return { statusCode: 409, data: { success: false, message: `Book already in ${status.toLowerCase()} list` } };
        }
        item.is_favorite = true;
      } else if (status === 'READING') {
        if (item.is_reading) {
          return { statusCode: 409, data: { success: false, message: `Book already in ${status.toLowerCase()} list` } };
        }
        item.is_reading = true;
      }
      await item.save();
    }

    return { statusCode: 201, data: { success: true, message: `Book added to ${status.toLowerCase()} successfully` } };
  }

  static async adminRemoveFromBookshelf(userId, bookId, status) {
    if (!status || !["FAVORITE", "READING"].includes(status)) {
      return { statusCode: 400, data: { success: false, message: "Status query parameter is required (FAVORITE or READING)" } };
    }

    const item = await UserBookshelf.findOne({
      where: { user_id: userId, book_id: bookId }
    });

    if (!item) {
      return { statusCode: 404, data: { success: false, message: "Book not found in bookshelf" } };
    }

    let updated = false;
    if (status === 'FAVORITE' && item.is_favorite) {
      item.is_favorite = false;
      updated = true;
    } else if (status === 'READING' && item.is_reading) {
      item.is_reading = false;
      updated = true;
    }

    if (updated) {
      if (!item.is_favorite && !item.is_reading) {
        await item.destroy();
      } else {
        await item.save();
      }
      return { statusCode: 200, data: { success: true, message: `Book removed from ${status.toLowerCase()} successfully` } };
    } else {
      return { statusCode: 404, data: { success: false, message: `Book not found in ${status.toLowerCase()} list` } };
    }
  }

  static async removeFromBookshelf(userId, bookId, status) {
    if (!status || !["FAVORITE", "READING"].includes(status)) {
      return { statusCode: 400, data: { success: false, message: "Status query parameter is required (FAVORITE or READING)" } };
    }

    const item = await UserBookshelf.findOne({
      where: { user_id: userId, book_id: bookId }
    });

    if (!item) {
      return { statusCode: 404, data: { success: false, message: "Book not found in your bookshelf" } };
    }

    let updated = false;
    if (status === 'FAVORITE' && item.is_favorite) {
      item.is_favorite = false;
      updated = true;
    } else if (status === 'READING' && item.is_reading) {
      item.is_reading = false;
      updated = true;
    }

    if (updated) {
      if (!item.is_favorite && !item.is_reading) {
        await item.destroy();
      } else {
        await item.save();
      }
      return { statusCode: 200, data: { success: true, message: `Book removed from ${status.toLowerCase()} successfully` } };
    } else {
      return { statusCode: 404, data: { success: false, message: `Book not found in your ${status.toLowerCase()} list` } };
    }
  }

  static async checkBookInBookshelf(userId, bookId) {
    const item = await UserBookshelf.findOne({
      where: {
        user_id: userId,
        book_id: bookId,
      },
    });

    let statuses = [];
    if (item) {
      if (item.is_favorite) statuses.push("FAVORITE");
      if (item.is_reading) statuses.push("READING");
    }

    return {
      statusCode: 200,
      data: {
        success: true,
        data: {
          inBookshelf: statuses.length > 0,
          statuses: statuses,
          isFavorite: item ? item.is_favorite : false,
          isReading: item ? item.is_reading : false,
        },
      }
    };
  }

  static async saveReadingProgress(userId, bookId, chapterId, scrollPosition) {
    if (!chapterId) {
      return { statusCode: 400, data: { success: false, message: "Chapter ID is required" } };
    }

    const [item, created] = await UserBookshelf.findOrCreate({
      where: { user_id: userId, book_id: bookId },
      defaults: {
        is_reading: true, 
        is_favorite: false,
        added_at: new Date(),
        last_read_chapter_id: chapterId,
        last_read_scroll_position: scrollPosition !== undefined ? scrollPosition : 0,
        last_read_at: new Date()
      }
    });

    item.last_read_chapter_id = chapterId;
    if (scrollPosition !== undefined) {
      item.last_read_scroll_position = scrollPosition;
    }
    item.last_read_at = new Date();
    if (!item.is_reading) {
      item.is_reading = true; 
    }

    await item.save();

    return { statusCode: 200, data: { success: true, message: "Progress saved successfully" } };
  }

  static async getReadingProgress(userId, bookId) {
    const item = await UserBookshelf.findOne({
      where: {
        user_id: userId,
        book_id: bookId,
      },
      attributes: ['last_read_chapter_id', 'last_read_at', 'last_read_scroll_position'] 
    });

    if (!item || !item.last_read_chapter_id) {
      return { statusCode: 200, data: { success: true, data: { lastChapterId: null } } };
    }

    return {
      statusCode: 200,
      data: {
        success: true,
        data: {
          lastChapterId: item.last_read_chapter_id,
          lastReadAt: item.last_read_at,
          lastReadScrollPosition: item.last_read_scroll_position 
        }
      }
    };
  }
}

export default BookshelfService;