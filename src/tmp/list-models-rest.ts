import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const geminiKey = process.env.GEMINI_API_KEY?.trim();

async function listModels() {
  console.log("--- Scanning Official Google AI Models ---");
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Models Found:");
      data.models.forEach((m: any) => {
        console.log(`\n--- MODEL ---`);
        console.log(`Name: ${m.name}`);
        console.log(`Display Name: ${m.displayName}`);
        console.log(`Methods: ${m.supportedGenerationMethods.join(', ')}`);
        console.log(`Description: ${m.description}`);
      });
    } else {
      console.log("❌ ERROR:", JSON.stringify(data.error));
    }
  } catch (err) {
    console.log("❌ CRITICAL ERROR:", err.message);
  }
}

listModels();
