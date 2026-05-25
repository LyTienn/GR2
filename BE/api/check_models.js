import dotenv from 'dotenv';
dotenv.config();

async function checkEmbeddingModels() {
    // Gọi thẳng vào máy chủ Google AI Studio
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY_1}`);
    const data = await response.json();
    
    // Lọc ra danh sách các model có chức năng "embedContent" (chuyển chữ thành Vector)
    const embeddingModels = data.models.filter(m => 
        m.supportedGenerationMethods && m.supportedGenerationMethods.includes("embedContent")
    );
    
    console.log("Danh sách các Model chuyên tạo Vector của Google:");
    embeddingModels.forEach(m => console.log(`- ${m.name} (Bản mới nhất: ${m.version})`));
}

checkEmbeddingModels();