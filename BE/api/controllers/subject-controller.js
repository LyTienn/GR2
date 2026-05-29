import SubjectService from "../services/subjectService.js";

export const getAllSubjects = async (req, res) => {
  try {
    const result = await SubjectService.getAllSubjects(req.query);
    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách chủ đề", error: error.message });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const result = await SubjectService.getSubjectById(req.params.id);
    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết chủ đề", error: error.message });
  }
};

export const getBooksBySubject = async (req, res) => {
  try {
    const result = await SubjectService.getBooksBySubject(req.params.id);
    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách sách theo chủ đề", error: error.message });
  }
};

export const createSubject = async (req, res) => {
  try {
    const result = await SubjectService.createSubject(req.body);
    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi tạo chủ đề", error: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const result = await SubjectService.updateSubject(req.params.id, req.body);
    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật chủ đề", error: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const result = await SubjectService.deleteSubject(req.params.id);
    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xóa chủ đề", error: error.message });
  }
};