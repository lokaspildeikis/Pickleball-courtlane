import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const modelName = "gemini-1.5-flash";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

async function test() {
  console.log(`Testing model: ${modelName}`);
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Say hello and confirm you are the Master Copywriter." }] }]
      })
    });
    const data = await response.json();
    if (response.ok) {
      console.log("✅ API Success!");
      console.log("Response:", data.candidates?.[0]?.content?.parts?.[0]?.text);
    } else {
      console.log("❌ API Failed:", data.error?.message);
    }
  } catch (err) {
    console.log("❌ Error:", err.message);
  }
}

test();
