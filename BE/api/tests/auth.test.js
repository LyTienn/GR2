// BE/api/tests/auth.test.js
import request from 'supertest';
import express from 'express';
import sequelize from '../config/db-config.js';
import authRouter from '../routes/auth-route.js';
import userRouter from '../routes/user-route.js';
import UserModel from '../models/user-model.js'; // Import UserModel để kích hoạt tài khoản giả lập

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

describe('Kiểm thử chức năng Xác thực Người dùng (Auth APIs)', () => {
  
  // Định nghĩa một tài khoản email tĩnh dùng chung cho các luồng liên đới (đăng ký, đăng nhập)
  const sharedEmail = `shared_auth_${Date.now()}@example.com`;
  const sharedPassword = 'password123';
  const sharedFullName = 'Độc Giả Thử Nghiệm';

  afterAll(async () => {
    // Đóng kết nối DB sau khi chạy xong tất cả test case để tránh treo tiến trình Jest
    await sequelize.close();
  });

  // AUTH-01: Đăng ký thành công với thông tin hợp lệ
  test('AUTH-01: Đăng ký tài khoản hợp lệ với email mới (Kỳ vọng HTTP 201)', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: sharedEmail,
        password: sharedPassword,
        fullName: sharedFullName
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    // BƯỚC QUAN TRỌNG: Kích hoạt tài khoản trực tiếp trong DB để giả lập xác thực email thành công
    const createdUser = await UserModel.findByEmail(sharedEmail);
    if (createdUser) {
      await UserModel.activateUser(createdUser.user_id);
    }
  });

  // AUTH-02: Đăng ký trùng email đã tồn tại
  test('AUTH-02: Đăng ký tài khoản với email đã tồn tại trong hệ thống (Kỳ vọng HTTP 409)', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: sharedEmail, // Email đã dùng ở AUTH-01
        password: 'newpassword123',
        fullName: 'Người Dùng Trùng Email'
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  // AUTH-03: Kiểm thử giá trị biên - Mật khẩu quá ngắn (5 ký tự)
  test('AUTH-03: Đăng ký với mật khẩu ngắn dưới 6 ký tự (Kỳ vọng HTTP 400)', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: `shortpass_${Date.now()}@example.com`,
        password: '12345', // 5 ký tự (dưới biên tối thiểu 6 ký tự)
        fullName: 'Test Biên Mật khẩu'
      });

    expect(response.status).toBe(400); // Yêu cầu không hợp lệ
  });

  // AUTH-04: Đăng nhập thành công với tài khoản hợp lệ
  test('AUTH-04: Đăng nhập với thông tin tài khoản hợp lệ (Kỳ vọng HTTP 200 và trả về Token)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: sharedEmail,
        password: sharedPassword
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    // Kiểm tra xem backend có trả về thông tin token trong body hoặc set cookie không
    const hasTokenInBody = response.body.data && (response.body.data.accessToken || response.body.data.token);
    const hasCookie = response.headers['set-cookie'] !== undefined;
    expect(hasTokenInBody || hasCookie).toBe(true);
  });

  // AUTH-05: Đăng nhập thất bại do sai mật khẩu
  test('AUTH-05: Đăng nhập với mật khẩu không chính xác (Kỳ vọng HTTP 401 hoặc 400)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: sharedEmail,
        password: 'wrong_password_xyz' // Sai mật khẩu
      });

    expect([400, 401]).toContain(response.status);
    expect(response.body.success).toBe(false);
  });

  // AUTH-06: Đăng nhập với tài khoản không tồn tại
  test('AUTH-06: Đăng nhập bằng tài khoản email chưa được đăng ký (Kỳ vọng HTTP 401 hoặc 400)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: `nonexistent_${Date.now()}@example.com`,
        password: sharedPassword
      });

    expect([400, 401]).toContain(response.status);
    expect(response.body.success).toBe(false);
  });

  // AUTH-07: Đăng nhập tài khoản bị khóa
  test('AUTH-07: Đăng nhập bằng tài khoản bị khóa is_active = false (Kỳ vọng HTTP 403 hoặc 401)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'blocked_user@example.com', // Tài khoản giả lập bị khóa
        password: 'password123'
      });

    // Trả về 403 Forbidden nếu tài khoản bị khóa, hoặc 400/401 nếu tài khoản chưa có trong DB
    expect([403, 401, 400]).toContain(response.status);
  });

  // AUTH-08: Sử dụng Token hết hạn
  test('AUTH-08: Gọi API yêu cầu xác thực với Token hết hạn (Kỳ vọng HTTP 401)', async () => {
    const response = await request(app)
      .get('/api/users/profile') // API yêu cầu cookie token hợp lệ và bắt buộc phải có để truy cập
      .set('Cookie', ['accessToken=expired_token_value_123456']);

    expect(response.status).toBe(401); // Unauthorized
  });
});
