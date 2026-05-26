import * as bookService from '../services/bookService.js';

export const getAllBooks = async (req, res) => {
  try {
    const data = await bookService.fetchAllBooks(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách sách", error: error.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await bookService.fetchBookById(req.params.id);
    res.json({ success: true, data: book });
  } catch (error) {
    const status = error.message === "Không tìm thấy sách" ? 404 : 500;
    res.status(status).json({ success: false, message: "Lỗi lấy chi tiết sách", error: error.message });
  }
};

export const getBookChapters = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const chapters = await bookService.fetchBookChapters(req.params.id, userId);
    res.json({ success: true, data: chapters });
  } catch (error) {
    const status = (error.message === "Sách không tồn tại") ? 404 : (error.message.includes("Vui lòng đăng nhập") || error.message.includes("Người dùng")) ? 401 : 500;
    res.status(status).json({ success: false, message: error.message === "Sách không tồn tại" ? error.message : "Lỗi lấy danh sách chương", error: error.message });
  }
};

export const createBook = async (req, res) => {
  try {
    const result = await bookService.createNewBook(req.body);
    res.status(201).json({ success: true, data: result, message: "Tạo sách thành công" });
  } catch (error) {
    const status = error.message.includes("Thiếu tiêu đề") ? 400 : 500;
    res.status(status).json({ success: false, message: "Lỗi tạo sách", error: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    await bookService.removeBook(req.params.id);
    res.json({ success: true, message: "Xóa sách thành công" });
  } catch (error) {
    const status = error.message === "Không tìm thấy sách" ? 404 : 500;
    res.status(status).json({ success: false, message: "Lỗi xóa sách", error: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const result = await bookService.modifyBook(req.params.id, req.body);
    res.json({ success: true, data: result, message: "Cập nhật sách thành công" });
  } catch (error) {
    const status = error.message === "Không tìm thấy sách" ? 404 : 500;
    res.status(status).json({ success: false, message: "Lỗi cập nhật sách", error: error.message });
  }
};

export const getSimilarBooks = async (req, res) => {
  try {
    const data = await bookService.fetchSimilarBooks(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy sách tương tự", error: error.message });
  }
};