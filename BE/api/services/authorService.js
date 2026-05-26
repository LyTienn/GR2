import Author from "../models/author-model.js";
import Book from "../models/book-model.js";
import { Op } from "sequelize";
import sequelize from "../config/db-config.js";

export const fetchAllAuthors = async (queryParams) => {
  const { page = 1, limit = 10, q, sort, order } = queryParams;
  const offset = (page - 1) * limit;

  let where = { is_deleted: 0 };
  if (q) {
    where.name = sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        'LIKE',
        `%${q.toLowerCase()}%`
    );
  }

  let orderClause = [['name', 'ASC']];
  if (sort === 'books_count') {
    orderClause = [[sequelize.literal('books_count'), order === 'ASC' ? 'ASC' : 'DESC']];
  } else if (sort === 'birth_year' || sort === 'name') {
    orderClause = [[sort, order === 'DESC' ? 'DESC' : 'ASC']];
  }

  const { count, rows } = await Author.findAndCountAll({
    where,
    attributes: {
        include: [
            [
            sequelize.literal(
                `(SELECT COUNT(*) FROM books WHERE books.author_id = ${sequelize.escape(sequelize.col('authors.id'))} AND books.is_deleted = 0)`
            ), 
            'books_count'
            ]
        ]
    },
    order: orderClause,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  return {
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    authors: rows
  };
};

export const fetchAuthorById = async (id) => {
  const author = await Author.findOne({ where: { id, is_deleted: 0 } });
  if (!author) throw new Error("Không tìm thấy tác giả");
  return author;
};

export const fetchBooksByAuthor = async (authorId) => {
  return await Book.findAll({ where: { author_id: authorId, is_deleted: 0 } });
};

export const createNewAuthor = async (authorData) => {
  let { name, birth_year, death_year } = authorData;
  if (!name) throw new Error("Tên tác giả không được để trống");

  birth_year = birth_year ? parseInt(birth_year) : null;
  death_year = death_year ? parseInt(death_year) : null;

  return await Author.create({ name, birth_year, death_year });
};

export const modifyAuthor = async (id, authorData) => {
  let { name, birth_year, death_year } = authorData;
  const author = await Author.findOne({ where: { id, is_deleted: 0 } });
  
  if (!author) throw new Error("Không tìm thấy tác giả");

  birth_year = birth_year ? parseInt(birth_year) : null;
  death_year = death_year ? parseInt(death_year) : null;

  return await author.update({ name, birth_year, death_year });
};

export const removeAuthor = async (id) => {
  const t = await sequelize.transaction(); 
  try {
    const author = await Author.findOne({ 
      where: { id, is_deleted: 0 }, 
      transaction: t 
    });
    
    if (!author) {
      throw new Error("Không tìm thấy tác giả");
    }
    const bookCount = await Book.count({ 
      where: { author_id: id, is_deleted: 0 }, 
      transaction: t 
    });
    
    if (bookCount > 0) {
      throw new Error(`Không thể xóa tác giả vì còn ${bookCount} sách liên quan`);
    }

    await author.update({ is_deleted: 1 }, { transaction: t });
    await t.commit();
    return true;
    
  } catch (error) {
    await t.rollback();
    throw error;
  }
};