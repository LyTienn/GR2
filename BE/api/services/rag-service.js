import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const chatWithAgent = async (userQuery, currentBookTitle = null, userName = "Tiểu Lý") => {
    try {
        console.log("Kiểm tra API Key:", process.env.GEMINI_API_KEY_1);
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-3.1-flash-lite",
            maxOutputTokens: 2048,
            apiKey: process.env.GEMINI_API_KEY,
            timeout: 10000,
        });

        let systemContext = `Bạn là trợ lý ảo chuyên về sách. Bạn đang nói chuyện với người dùng tên là ${userName}.`;
        if (currentBookTitle) {
            systemContext += `\nLƯU Ý: ${userName} hiện đang mở xem cuốn sách "${currentBookTitle}". Nếu họ hỏi "sách này", hãy tự hiểu là họ đang hỏi về cuốn đó.`;
        }

        const finalPrompt = `${systemContext}\n\nCâu hỏi: ${userQuery}`;
        
        console.log("Đang gửi câu hỏi lên Gemini...");
        const response = await llm.invoke(finalPrompt);
        
        return { success: true, reply: response.content };
    } catch (error) {
        console.error("Lỗi khi gọi Gemini:", error);
        return { success: false, message: "Lỗi kết nối AI." };
    }
};