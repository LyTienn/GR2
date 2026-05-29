import { ChapterNote, Chapter } from "../models/index.js";
import sequelize from "../config/db-config.js";
import { Op } from "sequelize";

class NoteService {
    static async getNotesByBook(bookId, userId) {
        if (!userId) {
            return { statusCode: 401, data: { success: false, message: "Unauthorized" } };
        }
        const notes = await ChapterNote.findAll({
            where: {
                user_id: userId
            },
            include: [{
                model: Chapter,
                as: "chapter",
                where: { book_id: bookId },
                attributes: ['id','title']
            }],
            order: [['createdAt', 'ASC']]
        });
        return { statusCode: 200, data: { success: true, data: notes } };
    }

    static async getNotesByChapter(chapterId, userId) {
        if (!userId) {
            return { statusCode: 401, data: { success: false, message: "Unauthorized" } };
        }        
        const notes = await ChapterNote.findAll({
            where: {
                chapter_id: chapterId,
                user_id: userId
            },
            order: [[ 'start_index', 'ASC' ]]
        });
        return { statusCode: 200, data: { success: true, data: notes } };
    }

    static async createNote(body, userId) {
        const { chapter_id, start_index, end_index, selected_text, note_content } = body;
        if (!userId) {
            return { statusCode: 401, data: { success: false, message: "Unauthorized" } };
        }
        // Validate
        if (!chapter_id || start_index === undefined || end_index === undefined || !selected_text) {
            return { statusCode: 400, data: { success: false, message: "Thiếu thông tin bắt buộc để tạo ghi chú", errorCode: "INVALID_INPUT" } };
        }

        // Check if chapter exists
        const chapter = await Chapter.findByPk(chapter_id);
        if (!chapter) {
            return { statusCode: 404, data: { success: false, message: "Chương truyện không tồn tại" } };
        }

        const newNote = await ChapterNote.create({
            user_id: userId,
            chapter_id,
            start_index,
            end_index,
            selected_text,
            note_content
        });

        return { statusCode: 201, data: { success: true, data: newNote, message: "Tạo ghi chú thành công" } };
    }

    static async updateNote(id, body, userId) {
        const { note_content } = body;

        const note = await ChapterNote.findByPk(id);

        if (!note) {
            return { statusCode: 404, data: { success: false, message: "Không tìm thấy ghi chú" } };
        }

        if (note.user_id !== userId) {
            return { statusCode: 403, data: { success: false, message: "Bạn không có quyền sửa ghi chú này" } };
        }

        await note.update({
            note_content
        });

        return { statusCode: 200, data: { success: true, data: note, message: "Cập nhật ghi chú thành công" } };
    }

    static async deleteNote(id, userId) {
        const note = await ChapterNote.findByPk(id);

        if (!note) {
            return { statusCode: 404, data: { success: false, message: "Không tìm thấy ghi chú" } };
        }

        // Bảo mật: Chỉ chủ sở hữu mới được xóa
        if (note.user_id !== userId) {
            return { statusCode: 403, data: { success: false, message: "Bạn không có quyền xóa ghi chú này" } };
        }

        await note.destroy();
        
        return { statusCode: 200, data: { success: true, message: "Xóa ghi chú thành công" } };
    }
}

export default NoteService;