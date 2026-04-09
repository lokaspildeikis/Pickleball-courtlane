import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const geminiKey = process.env.GEMINI_API_KEY?.trim();

async function listAllNames() {
  const versions = ['v1', 'v1beta'];
  
  for (const v of versions) {
    console.log(`--- Scanning ${v} ---`);
    const url = `https://generativelanguage.googleapis.com/${v}/models?key=${geminiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.models) {
        data.models.forEach((m: any) => {
          console.log(`${v}: ${m.name} | Methods: ${m.supportedGenerationMethods?.join(',')}`);
        });
      } else {
        console.log(`${v}: No models or error: ${JSON.stringify(data.error)}`);
      }
    } catch (err) {
      console.log(`${v} Error: ${err.message}`);
    }
  }
}

listAllNames();
