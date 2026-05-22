import "dotenv/config"; // Đọc API Key từ file .env

async function listAvailableModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.log("❌ Không tìm thấy GEMINI_API_KEY trong file .env");
            return;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.log("❌ Lỗi từ Google:", data.error.message);
            return;
        }

        console.log("✅ DANH SÁCH CÁC MODEL BẠN ĐƯỢC PHÉP SỬ DỤNG:");
        console.log("--------------------------------------------------");
        data.models.forEach(model => {
            // Chỉ in ra các model hỗ trợ generateContent (tạo văn bản)
            if (model.supportedGenerationMethods.includes("generateContent")) {
                console.log(`Tên chuẩn: "${model.name.replace('models/', '')}"`);
                console.log(`Mô tả: ${model.displayName}\n`);
            }
        });

    } catch (error) {
        console.error("Lỗi kết nối:", error);
    }
}

listAvailableModels();