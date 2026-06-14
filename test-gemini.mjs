import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.VITE_GEMINI_API_KEY;
console.log('Key length:', apiKey ? apiKey.length : 0);

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const prompt = `
You are the AI Eco Coach for CarbonWise AI, a sustainability application. Your goal is to provide encouraging, personalized, and highly actionable advice on reducing carbon footprints.

User Profile:
- Carbon Score: 50/100 (Higher is better)
- Total Logged Entries: 0
- Current Streak: 0 days
- Emissions by Category (kg CO2): Transport (0.0), Electricity (0.0), Food (0.0), Waste (0.0)
- Active Goals: None

User Message/Query: "Hello! Please introduce yourself briefly and give me a quick insight based on my current data."

Task:
Respond directly to the user's message using their profile data as context. Provide 1 to 3 distinct recommendations or responses. 
Format your response exactly as a JSON array of objects, with NO markdown formatting or code blocks around it. Just the raw JSON. 
Each object must have these exactly 3 keys:
- "title": A short, catchy title (max 5 words, can include an emoji).
- "message": A detailed, encouraging, and actionable message (2-4 sentences).
- "impact": A string that is exactly one of these: "high", "medium", "low", "positive", or "info". Use "positive" for praising existing good habits.
`;

async function test() {
  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    console.log('Raw text:', textResponse);
  } catch(e) {
    console.error('Error:', e);
  }
}

test();
