import { ChapterNote, Chapter } from "../models/index.js";
import sequelize from "../config/db-config.js";
import { Op } from "sequelize";

export const getNotesByBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const user_id = req.user?.id || req.user?.userId;
        if (!user_id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const notes = await ChapterNote.findAll({
            where: {
                user_id
            },
            include: [{
                model: Chapter,
                as: "chapter",
                where: { book_id: bookId },
                attributes: ['id','title']
            }],
            order: [['createdAt', 'ASC']]
        });
        res.json({ success: true, data: notes });
    } catch (error) {
        console.error("❌ LỖI GET NOTES BY BOOK:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy ghi chú theo sách", errorCode: "FETCH_NOTES_BY_BOOK_FAILED" });
    }
};

export const getNotesByChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const user_id = req.user?.id || req.user?.userId;
        
        if (!user_id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }        
        const notes = await ChapterNote.findAll({
            where: {
                chapter_id: chapterId,
                user_id
            },
            order: [[ 'start_index', 'ASC' ]]
        });
        res.json({ success: true, data: notes });
    } catch (error) {
        console.error("❌ LỖI GET NOTES:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách ghi chú", errorCode: "FETCH_NOTES_FAILED" });    }
};

export const createNote = async (req, res) => {
    try {
        const { chapter_id, start_index, end_index, selected_text, note_content } = req.body;
        const user_id = req.user?.id || req.user?.userId;

        // Validate
        if (!chapter_id || start_index === undefined || end_index === undefined || !selected_text) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc để tạo ghi chú", errorCode: "INVALID_INPUT" });
        }

        // Check if chapter exists
        const chapter = await Chapter.findByPk(chapter_id);
        if (!chapter) {
            return res.status(404).json({ success: false, message: "Chương truyện không tồn tại" });
        }

        const newNote = await ChapterNote.create({
            user_id,
            chapter_id,
            start_index,
            end_index,
            selected_text,
            note_content
        });

        res.status(201).json({ success: true, data: newNote, message: "Tạo ghi chú thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tạo ghi chú", errorCode: "NOTE_CREATION_FAILED" });
    }
};

export const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note_content } = req.body;
        const user_id = req.user?.id || req.user?.userId;

        const note = await ChapterNote.findByPk(id);

        if (!note) {
            return res.status(404).json({ success: false, message: "Không tìm thấy ghi chú" });
        }

        if (note.user_id !== user_id) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền sửa ghi chú này" });
        }

        await note.update({
            note_content
        });

        res.json({ success: true, data: note, message: "Cập nhật ghi chú thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật ghi chú", errorCode: "NOTE_UPDATE_FAILED" });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user?.id || req.user?.userId;

        const note = await ChapterNote.findByPk(id);

        if (!note) {
            return res.status(404).json({ success: false, message: "Không tìm thấy ghi chú" });
        }

        // Bảo mật: Chỉ chủ sở hữu mới được xóa
        if (note.user_id !== user_id) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền xóa ghi chú này" });
        }

        await note.destroy();
        
        res.json({ success: true, message: "Xóa ghi chú thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xóa ghi chú", errorCode: "NOTE_DELETION_FAILED" });
    }
};