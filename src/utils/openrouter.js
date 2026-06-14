const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

console.log("OPENROUTER KEY EXISTS:", !!import.meta.env.VITE_OPENROUTER_API_KEY);
console.log("OPENROUTER KEY LENGTH:", import.meta.env.VITE_OPENROUTER_API_KEY?.length);

console.log('[OpenRouter Init] VITE_OPENROUTER_API_KEY exists?', !!apiKey);
console.log('[OpenRouter Init] API Key length:', apiKey ? apiKey.length : 0);

if (!apiKey) {
  console.warn("[OpenRouter Init] VITE_OPENROUTER_API_KEY is not set in the environment variables.");
}

/**
 * Generate a response from OpenRouter based on user state and input.
 * @param {Object} state - The current CarbonWiseAI state (entries, goals, score, etc.)
 * @param {string} userMessage - The query or message from the user
 * @returns {Promise<Array>} Array of recommendation objects: { title, message, impact }
 */
export async function generateOpenRouterCoachResponse(state, userMessage = '') {
  if (!apiKey) {
    throw new Error('OpenRouter API key is missing. Please set VITE_OPENROUTER_API_KEY in your .env file.');
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

  const systemPrompt = `
You are the AI Eco Coach for CarbonWise AI, a sustainability application. Your goal is to provide encouraging, personalized, and highly actionable advice on reducing carbon footprints.

User Profile:
- Carbon Score: ${currentScore}/100 (Higher is better)
- Total Logged Entries: ${totalEntries}
- Current Streak: ${streak} days
- Emissions by Category (kg CO2): Transport (${categoryTotals.transport.toFixed(1)}), Electricity (${categoryTotals.electricity.toFixed(1)}), Food (${categoryTotals.food.toFixed(1)}), Waste (${categoryTotals.waste.toFixed(1)})
- Active Goals: ${activeGoals || 'None'}

Task:
Respond directly to the user's message using their profile data as context. Provide 1 to 3 distinct recommendations or responses. 
Format your response exactly as a JSON array of objects, with NO markdown formatting or code blocks around it. Just the raw JSON. 
Each object must have these exactly 3 keys:
- "title": A short, catchy title (max 5 words, can include an emoji).
- "message": A detailed, encouraging, and actionable message (2-4 sentences).
- "impact": A string that is exactly one of these: "high", "medium", "low", "positive", or "info". Use "positive" for praising existing good habits.
`;

  const userQuery = userMessage || 'Hello! Please introduce yourself briefly and give me a quick insight based on my current data.';

  try {
    const modelName = 'google/gemini-2.0-flash-exp:free';
    console.log(`[OpenRouter Request] Sending request to ${modelName}...`, {
      userQuery,
      promptLength: systemPrompt.length
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin, // OpenRouter requirement
        "X-Title": "CarbonWise AI" // OpenRouter requirement
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuery }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`);
    }

    const data = await response.json();
    const textResponse = data.choices?.[0]?.message?.content;
    
    if (!textResponse) {
      throw new Error("Empty response from OpenRouter API.");
    }
    
    console.log('[OpenRouter Response] Raw text received:', textResponse);
    
    // Clean up potential markdown formatting from the response
    const cleanJsonString = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    console.log('[OpenRouter Parse] Clean string to parse:', cleanJsonString);
    
    const parsedResponse = JSON.parse(cleanJsonString);
    
    if (Array.isArray(parsedResponse) && parsedResponse.length > 0) {
      console.log('[OpenRouter Success] Parsed array length:', parsedResponse.length);
      return parsedResponse;
    } else {
      throw new Error(`Invalid response format from OpenRouter: Expected array, got ${typeof parsedResponse}`);
    }
  } catch (error) {
    console.error('[OpenRouter API Error] Full error details:', error);
    throw error;
  }
}
