import * as authorService from '../services/authorService.js';

export const getAllAuthors = async (req, res) => {
  try {
    const data = await authorService.fetchAllAuthors(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuthorById = async (req, res) => {
  try {
    const author = await authorService.fetchAuthorById(req.params.id);
    res.status(200).json({ success: true, data: author });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const getBooksByAuthor = async (req, res) => {
  try {
    const books = await authorService.fetchBooksByAuthor(req.params.id);
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAuthor = async (req, res) => {
  try {
    const newAuthor = await authorService.createNewAuthor(req.body);
    res.status(201).json({ success: true, data: newAuthor, message: "Tạo tác giả thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAuthor = async (req, res) => {
  try {
    const updatedAuthor = await authorService.modifyAuthor(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedAuthor, message: "Cập nhật tác giả thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAuthor = async (req, res) => {
  try {
    await authorService.removeAuthor(req.params.id);
    res.status(200).json({ success: true, message: "Xóa tác giả thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};