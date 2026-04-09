import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const geminiKey = process.env.GEMINI_API_KEY?.trim();

async function test(version: string, model: string) {
  console.log(`Testing: ${version}/models/${model}...`);
  const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${geminiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello, list 3 benefits of a luxury pickleball paddle." }] }]
      })
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`✅ SUCCESS with ${version}/models/${model}`);
      return true;
    } else {
      console.log(`❌ FAILED with ${version}/models/${model}: ${JSON.stringify(data.error)}`);
      return false;
    }
  } catch (err) {
    console.log(`❌ ERROR with ${version}/models/${model}: ${err.message}`);
    return false;
  }
}

async function runTests() {
  const versions = ['v1beta', 'v1'];
  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-8b', 'gemini-1.5-pro', 'gemini-1.0-pro'];
  
  for (const v of versions) {
    for (const m of models) {
      const ok = await test(v, m);
      if (ok) {
        console.log(`\n🏆 FOUND THE WINNER! Use: ${v}/models/${m}`);
        return;
      }
    }
  }
}

runTests();
