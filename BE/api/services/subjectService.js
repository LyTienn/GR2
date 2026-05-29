import Subject from "../models/subject-model.js";
import BookSubject from "../models/book_subject-model.js";
import Book from "../models/book-model.js";
import { Op } from "sequelize";
import sequelize from "../config/db-config.js";

class SubjectService {
  static async getAllSubjects(query) {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
    const q = query.q;
    const sort = query.sort;
    const order = query.order;
    const offset = (page - 1) * limit;

    let where = { is_deleted: 0 }; 
    if (q) {
      where.name = { [Op.iLike]: `%${q}%` };
    }

    let orderClause = [['name', 'ASC']];
    if (sort === 'books_count') {
      orderClause = [[sequelize.literal('(SELECT COUNT(*) FROM book_subjects WHERE book_subjects.subject_id = "subjects"."id")'), order === 'ASC' ? 'ASC' : 'DESC']];
    } else if (sort === 'name') {
      orderClause = [['name', order === 'DESC' ? 'DESC' : 'ASC']];
    }

    const { count, rows } = await Subject.findAndCountAll({
      where,
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM book_subjects WHERE book_subjects.subject_id = "subjects"."id")'), 'books_count']
        ]
      },
      order: orderClause,
      limit: limit,
      offset: offset
    });

    return {
      statusCode: 200,
      data: {
        success: true,
        data: {
          total: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          subjects: rows
        }
      }
    };
  }

  static async getSubjectById(id) {
    const subject = await Subject.findOne({ where: { id: id, is_deleted: 0 } });
    if (!subject) {
      return { statusCode: 404, data: { success: false, message: "Không tìm thấy chủ đề" } };
    }
    return { statusCode: 200, data: { success: true, data: subject } };
  }

  static async getBooksBySubject(id) {
    const subject = await Subject.findOne({ where: { id, is_deleted: 0 } });
    if (!subject) {
      return { statusCode: 404, data: { success: false, message: "Không tìm thấy chủ đề" } };
    }
    
    const bookSubjects = await BookSubject.findAll({ where: { subject_id: id } });
    const bookIds = bookSubjects.map(bs => bs.book_id);
    
    if (bookIds.length === 0) {
      return { statusCode: 200, data: { success: true, data: [] } };
    }
    
    const books = await Book.findAll({ where: { id: bookIds, is_deleted: 0 } });
    return { statusCode: 200, data: { success: true, data: books } };
  }

  static async createSubject(body) {
    const { name } = body;
    if (!name) {
      return { statusCode: 400, data: { success: false, message: "Tên chủ đề không được để trống" } };
    }
    
    // Check duplicate active subject
    const existingActive = await Subject.findOne({ 
      where: { name, is_deleted: 0 } 
    });
    if (existingActive) {
      return { statusCode: 400, data: { success: false, message: "Chủ đề đã tồn tại" } };
    }

    // ✅ Cố reactivate soft-deleted
    let subject = await Subject.findOne({ 
      where: { name, is_deleted: 1 } 
    });
    
    if (subject) {
      await subject.update({ is_deleted: 0 });
      return { statusCode: 201, data: { success: true, data: subject, message: "Tạo chủ đề thành công" } };
    }
    
    // ✅ Tạo mới nếu chưa từng tồn tại
    subject = await Subject.create({ name });
    return { statusCode: 201, data: { success: true, data: subject, message: "Tạo chủ đề thành công" } };
  }

  static async updateSubject(id, body) {
    const { name } = body;
    if (!name) {
      return { statusCode: 400, data: { success: false, message: "Tên chủ đề không được để trống" } };
    }
    
    const subject = await Subject.findOne({ where: { id, is_deleted: 0 } });
    if (!subject) {
      return { statusCode: 404, data: { success: false, message: "Không tìm thấy chủ đề" } };
    }
    
    await subject.update({ name });
    return { statusCode: 200, data: { success: true, data: subject, message: "Cập nhật chủ đề thành công" } };
  }

  static async deleteSubject(id) {
    const subject = await Subject.findOne({ where: { id: id, is_deleted: 0 } });
    if (!subject) {
      return { statusCode: 404, data: { success: false, message: "Không tìm thấy chủ đề" } };
    }

    const bookCount = await BookSubject.count({
      where: { subject_id: id }
    });

    if (bookCount > 0) {
      return { 
        statusCode: 400, 
        data: { 
          success: false, 
          message: "Chủ đề đang được sử dụng, vui lòng xóa các cuốn sách liên quan trước",
          booksCount: bookCount
        }
      };
    }

    await subject.update({ is_deleted: 1 });
    return { statusCode: 200, data: { success: true, message: "Xóa chủ đề thành công" } };
  }
}

export default SubjectService;