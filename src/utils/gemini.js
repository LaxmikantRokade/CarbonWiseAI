import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API using the Vite environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

console.log('[Gemini Init] VITE_GEMINI_API_KEY exists?', !!apiKey);
console.log('[Gemini Init] API Key length:', apiKey ? apiKey.length : 0);

let genAI = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('[Gemini Init] GoogleGenerativeAI initialized successfully.');
} else {
  console.warn("[Gemini Init] VITE_GEMINI_API_KEY is not set in the environment variables.");
}

/**
 * Generate a response from Gemini based on user state and input.
 * @param {Object} state - The current CarbonWiseAI state (entries, goals, score, etc.)
 * @param {string} userMessage - The query or message from the user
 * @returns {Promise<Array>} Array of recommendation objects: { title, message, impact }
 */
export async function generateGeminiCoachResponse(state, userMessage = '') {
  if (!genAI) {
    throw new Error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your .env file.');
  }

  // Compile a prompt context from the user's state
  const totalEntries = state.entries.length;
  const currentScore = state.carbonScore;
  const streak = state.streak;
  
  const categoryTotals = { transport: 0, electricity: 0, food: 0, waste: 0 };
  state.entries.forEach(e => {
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += e.amount;
    }
  });

  const activeGoals = state.goals.filter(g => !g.completed).map(g => g.title).join(', ');

  const prompt = `
You are the AI Eco Coach for CarbonWise AI, a sustainability application. Your goal is to provide encouraging, personalized, and highly actionable advice on reducing carbon footprints.

User Profile:
- Carbon Score: ${currentScore}/100 (Higher is better)
- Total Logged Entries: ${totalEntries}
- Current Streak: ${streak} days
- Emissions by Category (kg CO2): Transport (${categoryTotals.transport.toFixed(1)}), Electricity (${categoryTotals.electricity.toFixed(1)}), Food (${categoryTotals.food.toFixed(1)}), Waste (${categoryTotals.waste.toFixed(1)})
- Active Goals: ${activeGoals || 'None'}

User Message/Query: "${userMessage || 'Provide a general update and suggestion based on my footprint.'}"

Task:
Respond directly to the user's message using their profile data as context. Provide 1 to 3 distinct recommendations or responses. 
Format your response exactly as a JSON array of objects, with NO markdown formatting or code blocks around it. Just the raw JSON. 
Each object must have these exactly 3 keys:
- "title": A short, catchy title (max 5 words, can include an emoji).
- "message": A detailed, encouraging, and actionable message (2-4 sentences).
- "impact": A string that is exactly one of these: "high", "medium", "low", "positive", or "info". Use "positive" for praising existing good habits.

Example Output:
[
  {
    "title": "Try Meatless Mondays 🌱",
    "message": "Your food emissions are quite high. Reducing meat consumption by just one day a week can save 600+ kg CO2 per year. Start with one meatless day and gradually increase!",
    "impact": "high"
  }
]
`;

  const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash'];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      console.log(`[Gemini Request] Sending request to ${modelName}...`, {
        userMessage,
        promptLength: prompt.length
      });

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      console.log(`[Gemini Response] Raw text received from ${modelName}:`, textResponse);
      
      const cleanJsonString = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      console.log('[Gemini Parse] Clean string to parse:', cleanJsonString);
      
      const parsedResponse = JSON.parse(cleanJsonString);
      
      if (Array.isArray(parsedResponse) && parsedResponse.length > 0) {
        console.log(`[Gemini Success] Parsed array length from ${modelName}:`, parsedResponse.length);
        return parsedResponse;
      } else {
        throw new Error(`Invalid response format from Gemini: Expected array, got ${typeof parsedResponse}`);
      }
    } catch (error) {
      console.error(`[Gemini API Error] ${modelName} failed:`, error.status ? `HTTP ${error.status} ${error.statusText}` : error.message);
      lastError = error;
      
      // Fallback on 404 (Not Found) or 503 (Service Unavailable)
      if (error.status === 404 || error.status === 503) {
        console.log(`[Gemini Fallback] Switching to next model...`);
        continue;
      }
      
      // If it's another error (like 429 Quota Exceeded or parsing error), throw it immediately
      console.error('[Gemini API Error] Full error details:', error);
      throw error;
    }
  }

  // If all fallback models failed with 404/503
  throw lastError || new Error("All configured Gemini models failed to respond.");
}
