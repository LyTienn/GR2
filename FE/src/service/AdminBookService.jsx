// import axiosInstance from '../config/Axios-config.jsx';
import HttpClient from "./HttpClient";

const AdminBookService = {
  // Lấy danh sách tất cả sách
  async getAllBooks(params = {}) {
    const res = HttpClient.get('/books', { params });
    return res?.data || [];
  },

  // Lấy chi tiết sách theo ID
  async getBookById(id) {
    const res = HttpClient.get(`/books/${id}`);
    return res?.data;
  },

  // Tạo sách mới (Admin only)
  async createBook(bookData) {
    const res = HttpClient.post('/books', bookData);
    return res;
  },

  // Cập nhật sách (Admin only)
  async updateBook(id, bookData) {
    const res = HttpClient.put(`/books/${id}`, bookData);
    return res;
  },

  // Xóa sách (Admin only)
  async deleteBook(id) {
    const res = HttpClient.delete(`/books/${id}`);
    return res;
  },

  // Lấy danh sách chương của sách
  async getBookChapters(id) {
    const res = HttpClient.get(`/books/${id}/chapters`);
    return res?.data || [];
  }
};

export default AdminBookService;
