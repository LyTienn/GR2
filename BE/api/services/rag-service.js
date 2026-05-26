import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import sequelize from '../config/db-config.js';
import Chapter from '../models/chapter-model.js';

// Khởi tạo bộ dịch chữ thành Vector của Google
const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-2",
    apiKey: process.env.GEMINI_API_KEY_1,
});

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.1-flash-lite",
    apiKey: process.env.GEMINI_API_KEY,
});

export const syncBookToVector = async (bookId) => {
    try {
        console.log(`[RAG] Đang lấy dữ liệu các chương của sách ID: ${bookId}...`);
        
        const chapters = await Chapter.findAll({ where: { book_id: bookId } });
        if (!chapters || chapters.length === 0) {
            return { success: false, message: "Không tìm thấy chương nào." };
        }

        // 2. Cấu hình cắt văn bản (Cắt khoảng 1000 ký tự, gối lên nhau 200 ký tự để không lọt ngữ cảnh)
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        for (const chapter of chapters) {
            const [existingChapter] = await sequelize.query(
                `SELECT 1 FROM chapter_embeddings WHERE chapter_id = :chapterId LIMIT 1`,
                { replacements: { chapterId: chapter.id } }
            );
            if (existingChapter.length > 0) {
                console.log(`  -> Chương ID ${chapter.id} đã có vector -> Bỏ qua chương này.`);
                continue; 
            }
            console.log(`[RAG] Đang băm nhỏ chương ID: ${chapter.id}...`);
            
            // Băm nội dung chương thành nhiều mảng chữ
            const chunks = await textSplitter.createDocuments([chapter.content]);

            for (let i = 0; i < chunks.length; i++) {
                const chunkContent = chunks[i].pageContent;
                
                // 3. Gọi Gemini dịch đoạn chữ đó thành mảng 768 con số
                const vector = await embeddings.embedQuery(chunkContent);
                const vectorString = JSON.stringify(vector); // Đổi thành chuỗi để lưu SQL

                // 4. Lưu thẳng vào Database bằng SQL thuần (Bỏ qua rào cản của Sequelize)
                await sequelize.query(
                    `INSERT INTO chapter_embeddings (chapter_id, chunk_index, chunk_content, embedding)
                     VALUES (:chapterId, :chunkIndex, :chunkContent, :embedding::vector)`,
                    {
                        replacements: {
                            chapterId: chapter.id,
                            chunkIndex: i,
                            chunkContent: chunkContent,
                            embedding: vectorString
                        }
                    }
                );
            }
        }
        console.log(`[RAG] Đồng bộ Vector cho sách ID ${bookId} hoàn tất!`);
        return { success: true, message: "Tạo Vector thành công!" };

    } catch (error) {
        console.error("[RAG] Lỗi khi sync vector:", error);
        return { success: false, message: "Lỗi hệ thống khi tạo Vector." };
    }
};

export const chatWithAgent = async (message, currentBookTitle, currentChapterId, userName) => {
    try {
        // (Metadata) 
        let metaContext = `Cuốn sách người dùng đang đọc: ${currentBookTitle || 'Không rõ'}\n`;

        if (currentBookTitle) {
            // total chapters
            const [[bookMeta]] = await sequelize.query(
                `SELECT COUNT(c.id) as total_chapters FROM books b JOIN chapters c ON b.id = c.book_id WHERE b.title = :title`,
                { replacements: { title: currentBookTitle }, logging: false }
            );
            if (bookMeta) metaContext += `Tổng số chương của sách: ${bookMeta.total_chapters}\n`;
        }

        if (currentChapterId) {
            // Lấy tiêu đề chương hiện tại
            const [[chapterMeta]] = await sequelize.query(
                `SELECT title FROM chapters WHERE id = :id`,
                { replacements: { id: currentChapterId }, logging: false }
            );
            if (chapterMeta) metaContext += `Chương hiện tại người dùng đang đọc: ${chapterMeta.title}\n`;
        }

        // 2. Chuyển câu hỏi thành Vector
        const queryVector = await embeddings.embedQuery(message);
        const vectorString = JSON.stringify(queryVector);

        // 3. Tìm kiếm Vector
        let query = `
            SELECT e.chunk_content, 
                   1 - (e.embedding::vector <=> :queryVector::vector) as similarity
            FROM chapter_embeddings e
        `;
        const replacements = { queryVector: vectorString };

        if (currentChapterId) {
            query += ` WHERE e.chapter_id = :chapterId`;
            replacements.chapterId = currentChapterId;
        } else if (currentBookTitle) {
            query += `
                JOIN chapters c ON e.chapter_id = c.id
                JOIN books b ON c.book_id = b.id
                WHERE b.title = :bookTitle
            `;
            replacements.bookTitle = currentBookTitle;
        } else {
            query += ` WHERE 1=1`; 
        }

        query += ` ORDER BY e.embedding::vector <=> :queryVector::vector LIMIT 5;`;

        const [results] = await sequelize.query(query, { replacements, logging: false });
        const context = results.map(r => r.chunk_content).join("\n\n");

        // Prompt 
        const prompt = `Bạn là trợ lý AI đọc sách. Dựa vào [THÔNG TIN HỆ THỐNG] và [TÀI LIỆU THAM KHẢO] dưới đây để trả lời câu hỏi một cách ngắn gọn, tự nhiên. Nếu thông tin không có, hãy nói là bạn không biết.
        
        [THÔNG TIN HỆ THỐNG]
        ${metaContext}
        
        [TÀI LIỆU THAM KHẢO (Trích xuất từ nội dung sách)]
        ${context}
        
        Người hỏi: ${userName || 'Khách'}
        Câu hỏi: ${message}
        `;
        
        const aiResponse = await llm.invoke(prompt);
        return { success: true, reply: aiResponse.content };
    } catch (error) {
        console.error("[RAG] Lỗi khi xử lý chat:", error);
        return { success: false, message: "Lỗi hệ thống khi tìm kiếm câu trả lời." };
    }
};