const apiKey = process.env.VITE_OPENROUTER_API_KEY;

console.log("OPENROUTER KEY EXISTS:", !!process.env.VITE_OPENROUTER_API_KEY);
console.log("OPENROUTER KEY LENGTH:", process.env.VITE_OPENROUTER_API_KEY?.length);
console.log('[OpenRouter Init] VITE_OPENROUTER_API_KEY exists?', !!apiKey);
console.log('[OpenRouter Init] API Key length:', apiKey ? apiKey.length : 0);

if (!apiKey) {
  console.warn("[OpenRouter Init] VITE_OPENROUTER_API_KEY is not set in the environment variables.");
}

async function test() {
  if (!apiKey) {
    console.error('Error: OpenRouter API key is missing. Please set VITE_OPENROUTER_API_KEY in your .env file.');
    return;
  }
  
  const systemPrompt = `You are a test. Say hello.
Format your response exactly as a JSON array of objects, with NO markdown formatting or code blocks around it. Just the raw JSON. 
Each object must have these exactly 3 keys:
- "title": A short, catchy title (max 5 words, can include an emoji).
- "message": A detailed, encouraging, and actionable message (2-4 sentences).
- "impact": A string that is exactly one of these: "high", "medium", "low", "positive", or "info". Use "positive" for praising existing good habits.`;
  const userQuery = "hello";

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
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "CarbonWise AI"
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
    
    const cleanJsonString = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    console.log('[OpenRouter Parse] Clean string to parse:', cleanJsonString);
    
    const parsedResponse = JSON.parse(cleanJsonString);
    
    if (Array.isArray(parsedResponse) && parsedResponse.length > 0) {
      console.log('[OpenRouter Success] Parsed array length:', parsedResponse.length);
    } else {
      throw new Error(`Invalid response format from OpenRouter: Expected array, got ${typeof parsedResponse}`);
    }
  } catch (error) {
    console.error('[OpenRouter API Error] Full error details:', error);
  }
}
test();
