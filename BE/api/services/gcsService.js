import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE_PATH,
});

const bucketName = process.env.GCP_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

/**
 * Upload tệp từ buffer (bộ nhớ tạm) lên GCS
 * @param {Express.Multer.File} file 
 * @returns {Promise<string>} Trả về URL public của ảnh
 */
export const uploadImageToGCS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Không tìm thấy file ảnh"));
    }

    const uniqueFilename = `${Date.now()}-${path.basename(file.originalname).replace(/\s+/g, '_')}`;
    const blob = bucket.file(`covers/${uniqueFilename}`); 
    
    const blobStream = blob.createWriteStream({
      resumable: false,
      gzip: true,
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on('error', (err) => {
      reject(err);
    });

    blobStream.on('finish', () => {
      // Vì đã phân quyền allUsers -> Storage Object Viewer cho Bucket
      // Ta có thể truy cập ảnh trực tiếp thông qua URL sau:
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

/**
 * Xóa một file trên GCS dựa vào đường dẫn URL đầy đủ
 * @param {string} fileUrl URL của ảnh trên GCP (ví dụ: https://storage.googleapis.com/bucket-name/covers/123-img.jpg)
 */
export const deleteImageFromGCS = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    // Kiểm tra xem URL có đúng là của bucket này không
    const prefix = `https://storage.googleapis.com/${bucketName}/`;
    if (!fileUrl.startsWith(prefix)) return; // Nếu là link ngoài hệ thống thì bỏ qua
    // Lấy ra phần path file (ví dụ: "covers/123-img.jpg")
    const filePath = fileUrl.replace(prefix, "");
    const file = bucket.file(filePath);
    // Tiến hành xóa
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
      console.log(`Đã xóa ảnh cũ thành công trên GCS: ${filePath}`);
    }
  } catch (error) {
    console.error(`Lỗi khi xóa ảnh cũ trên GCS:`, error);
  }
};