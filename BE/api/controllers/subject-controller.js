import Subject from "../models/subject-model.js";
import BookSubject from "../models/book_subject-model.js";
import Book from "../models/book-model.js";
import { Op } from "sequelize";
import sequelize from "../config/db-config.js";

// Lấy toàn bộ chủ đề
export const getAllSubjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, q, sort, order } = req.query;
    const offset = (page - 1) * limit;

    let where = { is_deleted: 0 }; // Soft filter
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
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        subjects: rows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách chủ đề", error: error.message });
  }
};

// Lấy chi tiết một chủ đề theo id
export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chủ đề" });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết chủ đề", error: error.message });
  }
};

// Lấy danh sách sách theo chủ đề
export const getBooksBySubject = async (req, res) => {
  try {
    const bookSubjects = await BookSubject.findAll({ where: { subject_id: req.params.id } });
    const bookIds = bookSubjects.map(bs => bs.book_id);
    const books = await Book.findAll({ where: { id: bookIds, is_deleted: 0 } });
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách sách theo chủ đề", error: error.message });
  }
};

// Tạo chủ đề mới
export const createSubject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Tên chủ đề không được để trống" });
    }
    let subject = await Subject.findOne({ 
      where: { name, is_deleted: 1 } 
    });
    
    if (subject) {
      // Tái kích hoạt subject đã xóa
      await subject.update({ is_deleted: 0 });
      return res.status(201).json({ 
        success: true, 
        data: subject, 
        message: "Tạo chủ đề thành công" 
      });
    }
    subject = await Subject.create({ name });
    res.status(201).json({ success: true, data: subject, message: "Tạo chủ đề thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi tạo chủ đề", error: error.message });
  }
};

// Cập nhật chủ đề
export const updateSubject = async (req, res) => {
  try {
    const { name } = req.body;
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chủ đề" });
    }
    await subject.update({ name });
    res.json({ success: true, data: subject, message: "Cập nhật chủ đề thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật chủ đề", error: error.message });
  }
};
// Xóa chủ đề (chỉ cho phép xóa nếu chưa gán cho sách)
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chủ đề" });
    }

    // Kiểm tra xem chủ đề có được gán cho sách nào không
    const bookCount = await BookSubject.count({
      where: { subject_id: req.params.id }
    });

    if (bookCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Chủ đề đang được sử dụng, vui lòng xóa các cuốn sách liên quan trước",
        booksCount: bookCount
      });
    }

    // Soft Delete
    await subject.update({ is_deleted: 1 });

    res.json({ success: true, message: "Xóa chủ đề thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xóa chủ đề", error: error.message });
  }
};
