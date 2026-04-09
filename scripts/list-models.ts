import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    apiVersion: 'v1',
  });

  console.log('--- Fetching Available Models ---');
  try {
    const pager = await client.models.list();
    // In this SDK, the pager is an async iterator or has a results property
    const models = (pager as any).models || [];
    
    if (models.length === 0) {
      console.log('No models found. Check your API key and permissions.');
    } else {
      models.forEach((m: any) => {
        console.log(`- ${m.name} (methods: ${m.supportedGenerationMethods?.join(', ')})`);
      });
    }
  } catch (err: any) {
    console.error('Error fetching models:', err.message);
  }
}

listModels();
