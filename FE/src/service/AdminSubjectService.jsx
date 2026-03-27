// import axiosInstance from '../config/Axios-config.jsx';
import HttpClient from "./HttpClient";

const AdminSubjectService = {
  // Lấy danh sách tất cả chủ đề (có phân trang)
  async getAllSubjects(params = {}) {
    const res = HttpClient.get('/subjects', { params });
    return res?.data || [];
  },

  // Lấy chi tiết chủ đề theo ID
  async getSubjectById(id) {
    const res = HttpClient.get(`/subjects/${id}`);
    return res?.data;
  },

  // Lấy sách theo chủ đề
  async getBooksBySubject(id) {
    const res = HttpClient.get(`/subjects/${id}/books`);
    return res?.data || [];
  },

  // Tạo chủ đề mới (Admin only)
  async createSubject(subjectData) {
    const res = HttpClient.post('/subjects', subjectData);
    return res;
  },

  // Cập nhật chủ đề (Admin only)
  async updateSubject(id, subjectData) {
    const res = HttpClient.put(`/subjects/${id}`, subjectData);
    return res;
  },

  // Xóa chủ đề (Admin only)
  async deleteSubject(id) {
    const res = HttpClient.delete(`/subjects/${id}`);
    return res;
  }
};

export default AdminSubjectService;
