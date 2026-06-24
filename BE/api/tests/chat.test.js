// BE/api/tests/chat.test.js
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import sequelize from '../config/db-config.js';
import chatbotRouter from '../routes/chatbot-route.js';
import { generateAccessToken } from '../utils/jwt-utils.js';
import { User } from '../models/index.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/chatbot', chatbotRouter);

describe('Kiểm thử chức năng Đọc sách trực tuyến & Trợ lý AI (Chatbot APIs)', () => {
  let validToken;

  beforeAll(async () => {
    // Tìm một user thực tế có sẵn trong DB để tránh vi phạm khóa ngoại (Foreign Key)
    let testUser = await User.findOne();
    
    if (!testUser) {
      // Nếu DB chưa có user nào, tạo nhanh một user thử nghiệm
      testUser = await User.create({
        email: `chat_tester_${Date.now()}@example.com`,
        password_hash: '$2a$10$h.nE3VzS6T6Y6.hGqWpUee24o5M9oP45lD3s.H1Z8m0jZ2e9sF3dG', // Mật khẩu băm giả lập
        full_name: 'Độc giả thử nghiệm',
        role: 'USER',
        status: 'ACTIVE'
      });
    }

    validToken = generateAccessToken(testUser.user_id, testUser.email, testUser.role);
  });

  afterAll(async () => {
    // Đóng kết nối DB sau khi test xong
    await sequelize.close();
  });

  // CHAT-01: Gửi câu hỏi hợp lệ lên trợ lý AI
  test('CHAT-01: Nhắn tin thành công với trợ lý AI (Kỳ vọng HTTP 200 và phản hồi)', async () => {
    const response = await request(app)
      .post('/api/chatbot/chat')
      .set('Cookie', [`accessToken=${validToken}`])
      .send({
        message: 'Cuốn sách này nói về nội dung gì?',
        currentBookTitle: 'Đắc Nhân Tâm',
        currentChapterId: 1
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toContain('phản hồi giả lập');
    expect(response.body.conversationId).toBeDefined();
  });

  // CHAT-02: Gửi câu hỏi trống (Kiểm thử giá trị biên)
  test('CHAT-02: Gửi tin nhắn trống lên trợ lý AI (Kỳ vọng HTTP 400)', async () => {
    const response = await request(app)
      .post('/api/chatbot/chat')
      .set('Cookie', [`accessToken=${validToken}`])
      .send({
        message: '', // Biên trống
        currentBookTitle: 'Đắc Nhân Tâm'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Vui lòng nhập câu hỏi.');
  });

  // CHAT-03: Gọi API yêu cầu đăng nhập khi chưa truyền Token (Bảo mật)
  test('CHAT-03: Lấy danh sách cuộc trò chuyện khi chưa đăng nhập (Kỳ vọng HTTP 401)', async () => {
    const response = await request(app)
      .get('/api/chatbot/conversations');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // CHAT-04: Tạo cuộc hội thoại mới và truy vấn chi tiết bằng ID
  test('CHAT-04: Tạo hội thoại mới và truy vấn lại qua ID (Kỳ vọng HTTP 201 và 200)', async () => {
    // 1. Tạo hội thoại mới
    const createRes = await request(app)
      .post('/api/chatbot/conversations')
      .set('Cookie', [`accessToken=${validToken}`])
      .send({
        bookTitle: 'Đắc Nhân Tâm',
        chapterId: 1
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    const conversationId = createRes.body.data.id;
    expect(conversationId).toBeDefined();

    // 2. Truy vấn chi tiết hội thoại vừa tạo
    const getRes = await request(app)
      .get(`/api/chatbot/conversations/${conversationId}`)
      .set('Cookie', [`accessToken=${validToken}`]);

    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.id).toBe(conversationId);
  });
});
