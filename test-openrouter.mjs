import { config } from 'dotenv';
config();

const apiKey = process.env.VITE_OPENROUTER_API_KEY;

async function test() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          { role: "system", content: "You are a test." },
          { role: "user", content: "Say hello!" }
        ]
      })
    });
    const data = await response.json();
    console.log(data);
  } catch(e) {
    console.error(e);
  }
}
test();
