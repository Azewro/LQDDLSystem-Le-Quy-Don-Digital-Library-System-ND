
import { GoogleGenAI } from "@google/genai";
import { Book } from "../types";

export const getBookRecommendation = async (userInput: string, books: Book[]) => {
  // Always create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use ai.models.generateContent directly and await its response
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Người dùng hỏi: "${userInput}". 
    Dựa trên danh sách sách sau: ${JSON.stringify(books.map(b => ({title: b.title, author: b.author, category: b.category})))}.
    Hãy đóng vai thủ thư nhiệt tình và đưa ra lời khuyên chọn sách phù hợp. Trả lời bằng tiếng Việt, ngắn gọn.`,
  });
  
  // Access .text property directly (not a method)
  return response.text;
};

export const chatWithLibrarian = async (messages: {role: string, parts: {text: string}[]}[]) => {
  // Always create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Use ai.models.generateContent directly and await its response
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: messages,
    config: {
        systemInstruction: "Bạn là Thủ thư ảo của trường THCS. Bạn thân thiện, am hiểu về sách và luôn sẵn sàng hỗ trợ học sinh tìm kiếm tài liệu học tập hoặc giải trí. Hãy trả lời lịch sự và khuyến khích niềm đam mê đọc sách."
    }
  });

  // Access .text property directly (not a method)
  return response.text;
};