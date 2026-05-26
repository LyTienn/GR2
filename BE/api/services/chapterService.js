import Chapter from "../models/chapter-model.js";
import Book from "../models/book-model.js";

export const fetchChapterById = async (id) => {
    const chapter = await Chapter.findByPk(id);
    if (!chapter) {
        throw new Error("Không tìm thấy chương");
    }
    return chapter;
};

export const modifyChapter = async (id, chapterData) => {
    const { title, content, chapter_number } = chapterData;
    
    const chapter = await Chapter.findByPk(id);
    if (!chapter) {
        throw new Error("Không tìm thấy chương");
    }

    return await chapter.update({
        title,
        content,
        chapter_number
    });
};

export const removeChapter = async (id) => {
    const chapter = await Chapter.findByPk(id);
    if (!chapter) {
        throw new Error("Không tìm thấy chương");
    }

    return await chapter.destroy();
};

export const createNewChapter = async (chapterData) => {
    const { book_id, title, content, chapter_number } = chapterData;

    // Giữ nguyên logic validate cũ
    if (!book_id || !title) {
        throw new Error("Thiếu thông tin bắt buộc (Book ID, Title)");
    }

    const book = await Book.findByPk(book_id);
    if (!book) {
        throw new Error("Sách không tồn tại");
    }

    return await Chapter.create({
        book_id,
        title,
        content,
        chapter_number: chapter_number || 0
    });
};