import HttpClient from "./HttpClient";
import { firstValueFrom } from "rxjs";

const AdminUserService = {
  // Lấy danh sách users (có phân trang)
  async getAllUsers(params = { page: 1, limit: 10 }) {
    const res = await firstValueFrom(HttpClient.get('/users', { params }));
    return res?.data;
  },

  // Tìm kiếm users
  async searchUsers(query) {
    const res = await firstValueFrom(HttpClient.get('/users/search', { params: { q: query } }));
    return res?.data?.users || [];
  },

  // Lấy chi tiết user theo ID
  async getUserById(userId) {
    const res = await firstValueFrom(HttpClient.get(`/users/${userId}`));
    return res?.data?.user;
  },

  // Cập nhật user (role, tier, fullName) - Admin only
  async updateUser(userId, userData) {
    const res = await firstValueFrom(HttpClient.put(`/users/${userId}`, userData));
    return res;
  },

  // Xóa user - Admin only
  async deleteUser(userId) {
    const res = await firstValueFrom(HttpClient.delete(`/users/${userId}`));
    return res;
  },

  // Tạo user mới - Admin only
  async createUser(userData) {
    const res = await firstValueFrom(HttpClient.post('/users', userData));
    return res;
  }
};

export default AdminUserService;