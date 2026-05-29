import NoteService from "../services/noteService.js";

export const getNotesByBook = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const result = await NoteService.getNotesByBook(req.params.bookId, userId);
        return res.status(result.statusCode).json(result.data);
    } catch (error) {
        console.error("❌ LỖI GET NOTES BY BOOK:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy ghi chú theo sách", errorCode: "FETCH_NOTES_BY_BOOK_FAILED" });
    }
};

export const getNotesByChapter = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const result = await NoteService.getNotesByChapter(req.params.chapterId, userId);
        return res.status(result.statusCode).json(result.data);
    } catch (error) {
        console.error("❌ LỖI GET NOTES:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách ghi chú", errorCode: "FETCH_NOTES_FAILED" });
    }
};

export const createNote = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const result = await NoteService.createNote(req.body, userId);
        return res.status(result.statusCode).json(result.data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tạo ghi chú", errorCode: "NOTE_CREATION_FAILED" });
    }
};

export const updateNote = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const result = await NoteService.updateNote(req.params.id, req.body, userId);
        return res.status(result.statusCode).json(result.data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi cập nhật ghi chú", errorCode: "NOTE_UPDATE_FAILED" });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        const result = await NoteService.deleteNote(req.params.id, userId);
        return res.status(result.statusCode).json(result.data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xóa ghi chú", errorCode: "NOTE_DELETION_FAILED" });
    }
};