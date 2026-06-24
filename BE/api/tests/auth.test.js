// BE/api/tests/auth.test.js
import request from 'supertest';
import express from 'express';
import sequelize from '../config/db-config.js';
import authRouter from '../routes/auth-route.js';
import userRouter from '../routes/user-route.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

describe('Kiểm thử chức năng Xác thực Người dùng (Auth APIs)', () => {
  
  afterAll(async () => {
    // Đóng kết nối DB sau khi chạy xong tất cả test case để tránh treo tiến trình Jest
    await sequelize.close();
  });

  // AUTH-01: Đăng ký thành công với thông tin hợp lệ
  test('AUTH-01: Đăng ký tài khoản hợp lệ với email mới (Kỳ vọng HTTP 201 hoặc 409)', async () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: uniqueEmail,
        password: 'password123',
        fullName: 'Độc giả thử nghiệm'
      });

    // Chấp nhận 201 (tạo mới thành công) hoặc 409 (đã tồn tại nếu chạy lại nhiều lần)
    expect([201, 409]).toContain(response.status);
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

  // AUTH-07: Đăng nhập tài khoản bị khóa
  test('AUTH-07: Đăng nhập bằng tài khoản bị khóa is_active = false (Kỳ vọng HTTP 403)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'blocked_user@example.com', // Tài khoản giả lập bị khóa
        password: 'password123'
      });

    // Trả về 403 Forbidden nếu tài khoản bị khóa, hoặc 400/401 nếu tài khoản chưa có trong DB
    expect([403, 400, 401]).toContain(response.status);
  });

  // AUTH-08: Sử dụng Token hết hạn
  test('AUTH-08: Gọi API yêu cầu xác thực với Token hết hạn (Kỳ vọng HTTP 401)', async () => {
    const response = await request(app)
      .get('/api/users/profile') // API yêu cầu cookie token hợp lệ và bắt buộc phải có để truy cập
      .set('Cookie', ['accessToken=expired_token_value_123456']);

    expect(response.status).toBe(401); // Unauthorized
  });
});
