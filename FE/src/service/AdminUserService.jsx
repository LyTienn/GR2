// import axiosInstance from '../config/Axios-config.jsx';
import HttpClient from "./HttpClient";

const AdminUserService = {
  // Lấy danh sách users (có phân trang)
  async getAllUsers(params = { page: 1, limit: 10 }) {
    const res = HttpClient.get('/users', { params });
    return res?.data;
  },

  // Tìm kiếm users
  async searchUsers(query) {
    const res = HttpClient.get('/users/search', { params: { q: query } });
    return res?.data?.users || [];
  },

  // Lấy chi tiết user theo ID
  async getUserById(userId) {
    const res = HttpClient.get(`/users/${userId}`);
    return res?.data?.user;
  },

  // Cập nhật user (role, tier, fullName) - Admin only
  async updateUser(userId, userData) {
    const res = HttpClient.put(`/users/${userId}`, userData);
    return res;
  },

  // Xóa user - Admin only
  async deleteUser(userId) {
    const res = HttpClient.delete(`/users/${userId}`);
    return res;
  },

  // Tạo user mới - Admin only
  async createUser(userData) {
    const res = HttpClient.post('/users', userData);
    return res;
  }
};

export default AdminUserService;
