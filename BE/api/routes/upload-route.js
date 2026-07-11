import { Router } from "express";
import multer from "multer";
import { uploadImageToGCS } from "../services/gcsService.js";
import { authenticate, authorizeRoles } from "../middlewares/auth-middleware.js";

const router = Router();

// Cấu hình Multer để lưu file tạm trên RAM thay vì lưu trên ổ đĩa
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn kích thước file 5MB
  },
});

// Chỉ ADMIN mới có quyền tải ảnh lên
router.post("/image", authenticate, authorizeRoles("ADMIN"), upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn một tệp ảnh" });
    }
    
    // Đẩy ảnh lên GCP và lấy URL
    const imageUrl = await uploadImageToGCS(req.file);
    return res.status(200).json({ success: true, imageUrl, message: "Tải ảnh lên thành công" });
  } catch (error) {
    console.error("GCS Upload Error:", error);
    return res.status(500).json({ success: false, message: "Lỗi tải ảnh lên GCP Storage", error: error.message });
  }
});

export default router;
