import * as chapterService from '../services/chapterService.js';

export const getChapterById = async (req, res) => {
    try {
        const chapter = await chapterService.fetchChapterById(req.params.id);
        res.json({ success: true, data: chapter });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateChapter = async (req, res) => {
    try {
        const updatedChapter = await chapterService.modifyChapter(req.params.id, req.body);
        res.json({ success: true, data: updatedChapter, message: "Cập nhật chương thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteChapter = async (req, res) => {
    try {
        await chapterService.removeChapter(req.params.id);
        res.json({ success: true, message: "Xóa chương thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createChapter = async (req, res) => {
    try {
        const newChapter = await chapterService.createNewChapter(req.body);
        res.status(201).json({ success: true, data: newChapter, message: "Tạo chương thành công" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};