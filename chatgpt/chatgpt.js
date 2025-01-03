require("dotenv").config();
//const { Configuration, OpenAIApi } = require("openai");
const OpenAI = require('openai');

// OpenAI 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // .env에 저장된 API 키 사용
});

// ChatGPT에 쿼리 보내기 함수
async function askChatGPT(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // 사용할 모델
            messages: [{ role: "user", content: prompt }], // 사용자 쿼리
        });

        return response.choices[0].message.content; // ChatGPT 응답
    } catch (err) {
        console.error("Error communicating with ChatGPT:", err.message);
        throw err;
    }
}

// 테스트 실행
(async () => {
    const prompt = "What is the capital of France?";
    const answer = await askChatGPT(prompt);
    console.log("ChatGPT's answer:", answer);
})();