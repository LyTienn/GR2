import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import sequelize from "./config/db-config.js";
import { User } from "./models/user-model.js";
import Book from "./models/book-model.js"; 
import Comment from "./models/comment-model.js"; // Đảm bảo model này có cột 'rating'
import { Op } from 'sequelize';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seedCommentsWithAI() {
    try {
        await sequelize.authenticate();
        console.log("Đã kết nối Database...");

        const books = await Book.findAll({
            attributes: ['id', 'title'],
            where: {
                id: {
                    // Lọc những ID không nằm trong danh sách đã được comment
                    [Op.notIn]: sequelize.literal('(SELECT DISTINCT book_id FROM comments)')
                }
            }
        }); 
        const users = await User.findAll({ attributes: ['user_id'] });

        if (!books.length || !users.length) return;

        for (let i = 0; i < books.length; i++) {
            const book = books[i];
            const prompt = `
                Đóng vai 5 độc giả khác nhau (khó tính, dễ tính, GenZ...), viết 5 bình luận tiếng Việt đánh giá sách "${book.title}".
                Bắt buộc trả về mảng JSON đúng định dạng sau, không có text dư thừa, không bọc trong thẻ markdown:
                [
                    { "rating": 5, "content": "nội dung..." }
                ]
            `;

            try {
                const result = await model.generateContent(prompt);
                const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                const aiComments = JSON.parse(responseText);
                
                const commentsToInsert = aiComments.map(aiCmt => ({
                    book_id: book.id,
                    user_id: users[Math.floor(Math.random() * users.length)].user_id,
                    content: aiCmt.content,
                    rating: aiCmt.rating,
                    created_at: new Date()
                }));

                await Comment.bulkCreate(commentsToInsert);
                console.log(`[${i+1}/${books.length}] Đã sinh xong comment cho: ${book.title}`);
            } catch (err) {
                console.error(`Lỗi ở cuốn ${book.title}:`, err.message);
            }
            await delay(5000); // Tránh lỗi Rate Limit
        }
        console.log("✅ Sinh data hoàn tất!");
    } catch (error) {
        console.error("Lỗi:", error);
    } finally {
        process.exit(0);
    }
}
seedCommentsWithAI();