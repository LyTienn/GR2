// BE/api/tests/payment.test.js
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import sequelize from '../config/db-config.js';
import paymentRouter from '../routes/payment-route.js';
import { generateAccessToken } from '../utils/jwt-utils.js';
import { User, Subscription } from '../models/index.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/payment', paymentRouter);

describe('Kiểm thử chức năng Thanh toán tự động qua SePay (Payment APIs)', () => {
  let validToken;
  let testUser;
  const mockApiKey = 'mock_sepay_secret_key_123';

  beforeAll(async () => {
    // 1. Thiết lập API Key giả lập cho SePay để phục vụ test
    process.env.SEPAY_API_KEY = mockApiKey;

    // 2. Lấy một user thực tế có sẵn trong DB để tránh vi phạm khóa ngoại
    testUser = await User.findOne();
    if (!testUser) {
      testUser = await User.create({
        email: `payment_tester_${Date.now()}@example.com`,
        password_hash: '$2a$10$h.nE3VzS6T6Y6.hGqWpUee24o5M9oP45lD3s.H1Z8m0jZ2e9sF3dG',
        full_name: 'Độc giả thanh toán',
        role: 'USER',
        status: 'ACTIVE',
        tier: 'FREE' // Bắt đầu ở gói FREE
      });
    } else {
      // Đảm bảo user ở gói FREE trước khi test nâng cấp
      await User.update({ tier: 'FREE' }, { where: { user_id: testUser.user_id } });
    }

    validToken = generateAccessToken(testUser.user_id, testUser.email, testUser.role);
  });

  afterAll(async () => {
    // Đóng kết nối DB sau khi chạy xong tất cả test case
    await sequelize.close();
  });

  // PAY-01: Tạo giao dịch thanh toán mới (PENDING)
  test('PAY-01: Tạo đơn thanh toán Premium mới thành công (Kỳ vọng HTTP 200 và trạng thái PENDING)', async () => {
    const response = await request(app)
      .post('/api/payment/sepay/create')
      .set('Cookie', [`accessToken=${validToken}`])
      .send({
        package_details: '3_THANG' // Gói 3 tháng
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.orderId).toBeDefined();
    expect(response.body.data.amount).toBe(99000); // 99,000đ cho gói 3 tháng

    // Kiểm chứng trong CSDL xem đơn hàng đã được tạo ở trạng thái PENDING chưa
    const sub = await Subscription.findOne({
      where: { payment_transaction_id: response.body.data.orderId }
    });
    expect(sub).toBeDefined();
    expect(sub.status).toBe('PENDING');
  });

  // PAY-02: Gọi Webhook nhưng truyền sai token bảo mật (Authorization)
  test('PAY-02: Gọi Webhook SePay với token bảo mật sai (Kỳ vọng HTTP 401)', async () => {
    // 1. Tạo một đơn hàng mới
    const createRes = await request(app)
      .post('/api/payment/sepay/create')
      .set('Cookie', [`accessToken=${validToken}`])
      .send({ package_details: '3_THANG' });

    const orderId = createRes.body.data.orderId;

    // 2. Gửi Webhook giả với Token sai
    const response = await request(app)
      .post('/api/payment/sepay/webhook')
      .set('Authorization', 'Apikey token_sai_hoan_toan_123')
      .send({
        content: `Thanh toan don hang ${orderId}`,
        transferAmount: 99000
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);

    // Kiểm chứng trạng thái đơn hàng vẫn là PENDING
    const sub = await Subscription.findOne({ where: { payment_transaction_id: orderId } });
    expect(sub.status).toBe('PENDING');
  });

  // PAY-03: Gọi Webhook đúng token nhưng thiếu số tiền thanh toán
  test('PAY-03: Gọi Webhook SePay đúng token nhưng thiếu tiền (Kỳ vọng HTTP 200 và giữ nguyên PENDING)', async () => {
    // 1. Tạo đơn hàng 99,000đ
    const createRes = await request(app)
      .post('/api/payment/sepay/create')
      .set('Cookie', [`accessToken=${validToken}`])
      .send({ package_details: '3_THANG' });

    const orderId = createRes.body.data.orderId;

    // 2. Gửi Webhook với số tiền thiếu (chỉ chuyển 50,000đ thay vì 99,000đ)
    const response = await request(app)
      .post('/api/payment/sepay/webhook')
      .set('Authorization', `Apikey ${mockApiKey}`)
      .send({
        content: `Thanh toan don hang ${orderId}`,
        transferAmount: 50000 // Thiếu tiền
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Insufficient amount');

    // Kiểm chứng trạng thái đơn hàng vẫn là PENDING
    const sub = await Subscription.findOne({ where: { payment_transaction_id: orderId } });
    expect(sub.status).toBe('PENDING');
  });

  // PAY-04: Gọi Webhook thành công -> Chuyển trạng thái sang ACTIVE & Hạng PREMIUM
  test('PAY-04: Thanh toán thành công qua Webhook SePay (Kỳ vọng HTTP 200, chuyển sang ACTIVE và lên PREMIUM)', async () => {
    // 1. Tạo đơn hàng 99,000đ
    const createRes = await request(app)
      .post('/api/payment/sepay/create')
      .set('Cookie', [`accessToken=${validToken}`])
      .send({ package_details: '3_THANG' });

    const orderId = createRes.body.data.orderId;

    // 2. Gửi Webhook thông báo chuyển khoản thành công và đầy đủ số tiền
    const response = await request(app)
      .post('/api/payment/sepay/webhook')
      .set('Authorization', `Apikey ${mockApiKey}`)
      .send({
        content: `Chuyen khoan thanh toan hoa don ${orderId} của độc giả`,
        transferAmount: 99000 // Đủ tiền
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Success');

    // 3. Kiểm chứng sự chuyển đổi trạng thái giao dịch (PENDING -> ACTIVE)
    const sub = await Subscription.findOne({ where: { payment_transaction_id: orderId } });
    expect(sub.status).toBe('ACTIVE');

    // 4. Kiểm chứng sự nâng cấp tài khoản của User (FREE -> PREMIUM)
    const updatedUser = await User.findByPk(testUser.user_id);
    expect(updatedUser.tier).toBe('PREMIUM');
  });
});
