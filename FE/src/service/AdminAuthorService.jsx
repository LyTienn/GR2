import HttpClient from "./HttpClient";
import { firstValueFrom } from "rxjs";

const AdminAuthorService = {
  // Lấy danh sách tất cả tác giả (có phân trang)
  async getAllAuthors(params = {}) {
    const res = await firstValueFrom(HttpClient.get('/authors', { search: params }));
    return res?.data || [];
  },

  // Lấy chi tiết tác giả theo ID
  async getAuthorById(id) {
    const res = await firstValueFrom(HttpClient.get(`/authors/${id}`));
    return res?.data;
  },

  // Lấy sách của tác giả
  async getBooksByAuthor(id) {
    const res = await firstValueFrom(HttpClient.get(`/authors/${id}/books`));
    return res?.data || [];
  },

  // Tạo tác giả mới (Admin only)
  async createAuthor(authorData) {
    const res = await firstValueFrom(HttpClient.post('/authors', authorData));
    return res;
  },

  // Cập nhật tác giả (Admin only)
  async updateAuthor(id, authorData) {
    const res = await firstValueFrom(HttpClient.put(`/authors/${id}`, authorData));
    return res;
  },

  // Xóa tác giả (Admin only)
  async deleteAuthor(id) {
    const res = await firstValueFrom(HttpClient.delete(`/authors/${id}`));
    return res;
  }
};

export default AdminAuthorService;