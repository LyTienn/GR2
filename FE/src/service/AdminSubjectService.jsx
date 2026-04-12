import HttpClient from "./HttpClient";
import { firstValueFrom } from "rxjs";

const AdminSubjectService = {
  // Lấy danh sách tất cả chủ đề (có phân trang)
  async getAllSubjects(params = {}) {
    const res = await firstValueFrom(HttpClient.get('/subjects', { search: params }));
    return res?.data || [];
  },

  // Lấy chi tiết chủ đề theo ID
  async getSubjectById(id) {
    const res = await firstValueFrom(HttpClient.get(`/subjects/${id}`));
    return res?.data;
  },

  // Lấy sách theo chủ đề
  async getBooksBySubject(id) {
    const res = await firstValueFrom(HttpClient.get(`/subjects/${id}/books`));
    return res?.data || [];
  },

  // Tạo chủ đề mới (Admin only)
  async createSubject(subjectData) {
    const res = await firstValueFrom(HttpClient.post('/subjects', subjectData));
    return res;
  },

  // Cập nhật chủ đề (Admin only)
  async updateSubject(id, subjectData) {
    const res = await firstValueFrom(HttpClient.put(`/subjects/${id}`, subjectData));
    return res;
  },

  // Xóa chủ đề (Admin only)
  async deleteSubject(id) {
    const res = await firstValueFrom(HttpClient.delete(`/subjects/${id}`));
    return res;
  }
};

export default AdminSubjectService;