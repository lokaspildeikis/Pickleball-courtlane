import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const geminiKey = process.env.GEMINI_API_KEY;

async function listModels() {
  console.log('--- Scanning Google AI Models ---');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`
    );
    const data = await response.json();
    
    if (data.error) {
      console.error('Error:', JSON.stringify(data.error, null, 2));
      return;
    }

    console.log('Available Models:');
    data.models.forEach((m: any) => {
      if (m.supportedGenerationMethods.includes('generateContent')) {
        console.log(`- ${m.name} (${m.displayName})`);
      }
    });
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

listModels();
