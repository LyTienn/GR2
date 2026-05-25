import dotenv from 'dotenv';
import sequelize from './config/db-config.js';
import { syncBookToVector } from './services/rag-service.js';

dotenv.config();

async function runMigration() {
    try {
        console.log("\n========================================================");
        console.log("🚀 TIẾN TRÌNH ĐỒNG BỘ VECTOR NÂNG CAO (CHECK THEO CHƯƠNG)");
        console.log("========================================================\n");
        
        // 1. Lấy danh sách toàn bộ sách hiện có
        const [books] = await sequelize.query('SELECT id, title FROM books ORDER BY id ASC');
        console.log(`📋 Hệ thống tìm thấy tổng cộng: ${books.length} cuốn sách.\n`);

        for (let i = 0; i < books.length; i++) {
            const book = books[i];
            
            // 2. Đếm tổng số chương của cuốn sách này
            const [totalChapters] = await sequelize.query(
                'SELECT COUNT(*) as count FROM chapters WHERE book_id = :bookId',
                { replacements: { bookId: book.id } }
            );
            const total = parseInt(totalChapters[0].count);

            if (total === 0) {
                console.log(`⏭️  [${i + 1}/${books.length}] Sách ID ${book.id} ("${book.title}") KHÔNG CÓ CHƯƠNG NÀO -> BỎ QUA.`);
                continue;
            }

            // 3. Đếm số lượng chương ĐÃ ĐƯỢC BĂM VECTOR HOÀN TOÀN
            const [syncedChapters] = await sequelize.query(`
                SELECT COUNT(DISTINCT chapter_id) as count 
                FROM chapter_embeddings 
                WHERE chapter_id IN (SELECT id FROM chapters WHERE book_id = :bookId)
            `, { replacements: { bookId: book.id } });
            const synced = parseInt(syncedChapters[0].count);

            // Nếu số chương đã băm bằng đúng tổng số chương của sách -> Bỏ qua toàn bộ sách
            if (synced === total) {
                console.log(`⏭️  [${i + 1}/${books.length}] Sách ID ${book.id} ("${book.title}") đã đồng bộ đủ ${synced}/${total} chương -> BỎ QUA.`);
                continue;
            }

            // Nếu thiếu chương (bị lỗi giữa chừng ở lần chạy trước) hoặc chưa có gì -> Tiến hành chạy
            console.log(`⏳ [${i + 1}/${books.length}] Đang xử lý Sách ID ${book.id} ("${book.title}") [Mới có ${synced}/${total} chương]...`);
            
            const result = await syncBookToVector(book.id);
            
            if (result.success) {
                console.log(`✅ Thành công Sách ID ${book.id}`);
            } else {
                console.log(`❌ Thất bại Sách ID ${book.id}: ${result.message}`);
            }

            console.log("⏱️  Chờ 4 giây trước khi sang cuốn tiếp theo...\n");
            await new Promise(resolve => setTimeout(resolve, 4000));
        }

        console.log("========================================================");
        console.log("🎉 ĐÃ HOÀN TẤT ĐỒNG BỘ VECTOR CHO TOÀN BỘ SÁCH THÀNH CÔNG!");
        console.log("========================================================");
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error("💥 Lỗi nghiêm trọng xảy ra trong tiến trình chạy script:", error);
        await sequelize.close();
        process.exit(1);
    }
}

runMigration();