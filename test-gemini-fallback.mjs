import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function generateContentWithFallback(prompt) {
  const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];
  
  for (const modelName of modelsToTry) {
    console.log(`[Gemini Test] Trying model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      console.log(`[Gemini Test] Success with model: ${modelName}`);
      console.log(`[Gemini Test] Response: ${textResponse}`);
      return textResponse;
    } catch (e) {
      console.error(`[Gemini Test] Model ${modelName} failed:`, e.status || e.message);
      if (e.status === 404 || e.status === 503) {
        console.log(`[Gemini Test] Falling back to next model...`);
        continue;
      }
      throw e;
    }
  }
  throw new Error("All fallback models failed.");
}

generateContentWithFallback("Hello");
