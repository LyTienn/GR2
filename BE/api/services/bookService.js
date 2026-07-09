import Book from "../models/book-model.js";
import Subject from "../models/subject-model.js";
import Author from "../models/author-model.js";
import UserBookshelf from "../models/user-bookshelf-model.js";
import BookSubject from "../models/book_subject-model.js";
import BookShelf from "../models/bookshelf-model.js";
import BookBookshelf from "../models/book_bookshelf-model.js";
import { User } from "../models/user-model.js";
import Chapter from "../models/chapter-model.js";
import { Op } from "sequelize";
import sequelize from "../config/db-config.js";

// Thiết lập association nếu chưa có (Giữ nguyên từ Controller cũ)
if (!Book.associations.Author) {
  Book.belongsTo(Author, { foreignKey: "author_id" });
}
if (!Book.associations.Subjects) {
  Book.belongsToMany(Subject, { through: BookSubject, foreignKey: "book_id", otherKey: "subject_id" });
}
if (!Book.associations.bookshelves) {
  Book.belongsToMany(BookShelf, {
    through: BookBookshelf,
    foreignKey: "book_id",
    otherKey: "bookshelf_id",
    as: "bookshelves"
  });
}

export const fetchAllBooks = async (queryParams) => {
  const { subjectId, authorId, keyword, q, type, sort } = queryParams;
  const pageNum = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  let where = { is_deleted: 0 }; 

  let order = [['created_at', 'DESC'], ['id', 'ASC']]; 
  
  if (sort) {
    switch (sort) {
      case 'id': order = [['id', 'ASC']]; break;
      case 'oldest': order = [['created_at', 'ASC'], ['id', 'ASC']]; break;
      case 'a-z': order = [['title', 'ASC'], ['id', 'ASC']]; break;
      case 'z-a': order = [['title', 'DESC'], ['id', 'ASC']]; break;
      case 'views': order = [['download_count', 'DESC'], ['id', 'ASC']]; break;
      case 'newest':
      default: order = [['created_at', 'DESC'], ['id', 'ASC']];
    }
  }

  const searchTerm = keyword || q;

  if (authorId) where.author_id = authorId;
  if (type) where.type = type;

  if (searchTerm) {
    const authors = await Author.findAll({
      where: { name: { [Op.iLike]: `%${searchTerm}%` } },
      attributes: ['id']
    });
    const matchedAuthorIds = authors.map(a => a.id);
    const subjects = await Subject.findAll({
      where: { name: { [Op.iLike]: `%${searchTerm}%` } },
      attributes: ['id']
    });
    const matchedSubjectIds = subjects.map(s => s.id);
    let booksBySubject = [];
    if (matchedSubjectIds.length > 0) {
      booksBySubject = await BookSubject.findAll({
        where: { subject_id: { [Op.in]: matchedSubjectIds } },
        attributes: ['book_id'],
        raw: true
      });
    }
    const bookIdsBySubject = booksBySubject.map(bs => bs.book_id);
    where = {
      ...where,
      [Op.or]: [
        { title: { [Op.iLike]: `%${searchTerm}%` } },
        { author_id: { [Op.in]: matchedAuthorIds } },
        { id: { [Op.in]: bookIdsBySubject } }
      ]
    };
  }

  let include = [
    { model: Author, as: "author", attributes: ["name"] },
    {
      model: Subject, as: "subjects", attributes: ["id", "name"], through: { attributes: [] },
      ...(subjectId && { where: { id: subjectId } }) 
    },
    { model: BookShelf, attributes: ["id", "name"], through: { attributes: [] }, as: "bookshelves" }
  ];

  const { count, rows } = await Book.findAndCountAll({
    where,
    include,
    attributes: {
      include: [[sequelize.literal('(SELECT COUNT(*) FROM chapters WHERE chapters.book_id = books.id)'), 'chapter_count']]
    },
    limit: limitNum,
    offset: offset,
    distinct: true, 
    order: order 
  });

  return { total: count, totalPages: Math.ceil(count / limitNum), currentPage: pageNum, books: rows };
};

export const fetchBookById = async (id) => {
  const book = await Book.findOne({
    where: { id, is_deleted: 0 },
    attributes: {
      include: [[sequelize.literal('(SELECT COUNT(*) FROM chapters WHERE chapters.book_id = books.id)'), 'chapter_count']]
    },
    include: [
      { model: Author, attributes: ["name"] },
      { model: Subject, attributes: ["id", "name"], through: { attributes: [] } },
      { model: BookShelf, attributes: ["id", "name"], through: { attributes: [] }, as: "bookshelves" }
    ],
  });
  if (!book) throw new Error("Không tìm thấy sách");
  return book;
};

export const fetchBookChapters = async (bookId, userId) => {
  const book = await Book.findOne({ where: { id: bookId, is_deleted: 0 } });
  if (!book) throw new Error("Sách không tồn tại");
  const chapters = await Chapter.findAll({ where: { book_id: bookId }, order: [['chapter_number', 'ASC'], ['id', 'ASC']] });

  if (book.type === "PREMIUM") {
    if (!userId) throw new Error("Vui lòng đăng nhập để đọc sách");
    const user = await User.findByPk(userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    if (user.role !== "ADMIN" && (
        user.tier !== "PREMIUM" ||
        user.isExpired === true || 
        (user.subscription_expiry && new Date(user.subscription_expiry) < new Date())
        )) {
      return chapters.map((ch, index) => {
        const chapterData = ch.toJSON();
        if (index < 3) return { ...chapterData, isLocked: false };
        return { ...chapterData, content: "Nội dung dành riêng cho hội viên Premium.", isLocked: true };
      });
    }
  }
  return chapters.map(ch => ({ ...ch.toJSON(), isLocked: false }));
};

export const createNewBook = async (bookData) => {
  const { title, author_id, summary, published_year, type, language, page_count, image_url, subjectIds, chapter_count } = bookData;
  if (!title || !author_id) throw new Error("Thiếu tiêu đề hoặc tác giả");

  const book = await Book.create({
    title, author_id, summary, published_year, type: type || 'FREE', language, page_count, image_url
  });

  if (subjectIds && Array.isArray(subjectIds)) await book.setSubjects(subjectIds);

  const chaptersToCreate = parseInt(chapter_count || 0);
  if (chaptersToCreate > 0) {
    const chapterData = [];
    for (let i = 1; i <= chaptersToCreate; i++) {
      chapterData.push({ book_id: book.id, chapter_number: i, title: `Chương ${i}`, content: "Nội dung đang được cập nhật..." });
    }
    await Chapter.bulkCreate(chapterData);
  }

  return await Book.findByPk(book.id, {
    include: [
      { model: Author, as: "author", attributes: ["name"] },
      { model: Subject, as: "subjects", attributes: ["id", "name"], through: { attributes: [] } },
    ],
  });
};

export const removeBook = async (id) => {
  const book = await Book.findOne({ where: { id, is_deleted: 0 } });
  if (!book) throw new Error("Không tìm thấy sách");
  return await book.update({ is_deleted: 1 });
};

export const modifyBook = async (id, bookData) => {
  const { title, author_id, summary, image_url, type, language, page_count, published_year, subjectIds } = bookData;
  const book = await Book.findOne({ where: { id, is_deleted: 0 } });
  if (!book) throw new Error("Không tìm thấy sách");
  await book.update({ title, author_id, summary, image_url, type, language, page_count, published_year });

  if (subjectIds && Array.isArray(subjectIds)) await book.setSubjects(subjectIds);

  return await Book.findByPk(book.id, {
    include: [
      { model: Author, as: "author", attributes: ["name"] },
      { model: Subject, as: "subjects", attributes: ["id", "name"], through: { attributes: [] } },
    ],
  });
};

export const fetchSimilarBooks = async (id) => {
  const [recommendation] = await sequelize.query(
    'SELECT similar_book_ids FROM book_recommendations WHERE book_id = :bookId',
    { replacements: { bookId: id }, type: sequelize.QueryTypes.SELECT }
  );

  let similarBookIds = [];
  if (recommendation && recommendation.similar_book_ids) {
    similarBookIds = recommendation.similar_book_ids;
    if (typeof similarBookIds === 'string') {
      try {
        const cleanString = similarBookIds.replaceAll('{', '[').replaceAll('}', ']');
        similarBookIds = JSON.parse(cleanString);
      } catch {
        similarBookIds = [];
      }
    }
  }

  if (!Array.isArray(similarBookIds) || similarBookIds.length === 0) {
    const popularItems = await UserBookshelf.findAll({
      attributes: [
        'book_id',
        [sequelize.fn('COUNT', sequelize.col('user_id')), 'read_count']
      ],
      where: {
        is_reading: true,
        book_id: { [Op.ne]: id }
      },
      group: ['book_id'],
      order: [[sequelize.literal('read_count'), 'DESC']],
      limit: 5,
      raw: true
    });

    if (popularItems.length === 0) return [];

    const popularBookIds = popularItems.map(item => item.book_id);

    return await Book.findAll({
      where: { id: { [Op.in]: popularBookIds }, is_deleted: 0 },
      include: [{ model: Author, as: "author", attributes: ["name"] }],
      attributes: ['id', 'title', 'image_url', 'type']
    });
  }

  const similarBooks = await Book.findAll({
    where: { id: { [Op.in]: similarBookIds }, is_deleted: 0 },
    include: [{ model: Author, as: "author", attributes: ["name"] }],
    attributes: ['id', 'title', 'image_url', 'type'] 
  });

  return similarBookIds.map(bookId => similarBooks.find(b => b.id === bookId)).filter(Boolean);
};
