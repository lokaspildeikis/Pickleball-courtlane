import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1',
});

const modelsToTest = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-001',
  'gemini-1.5-flash-002',
  'models/gemini-1.5-flash',
];

async function test() {
  console.log('--- Testing Connections ---');
  for (const model of modelsToTest) {
    try {
      console.log(`Testing [${model}]...`);
      const response = await client.models.generateContent({
        model,
        contents: 'hi',
      });
      console.log(`✅ SUCCESS with [${model}]! Text: ${response.text}`);
      process.exit(0);
    } catch (err: any) {
      console.log(`❌ FAILED [${model}]: ${err.message?.substring(0, 50)}...`);
    }
  }
}

test();
