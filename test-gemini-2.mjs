import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  try {
    const res = await model.generateContent("hello");
    console.log(res.response.text());
  } catch(e) {
    console.error(e);
  }
}
list();
