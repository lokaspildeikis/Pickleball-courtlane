/**
 * Gemini helper for optional listing suggestions in the admin-style UI.
 * Output should read like Courtlane: clear, pickleball-specific, not marketplace spam.
 */

export interface OptimizationResult {
  title: string;
  description: string;
  tags: string[];
}

export async function optimizeProduct(
  originalTitle: string,
  originalDescription: string,
  tags: string[] = [],
): Promise<OptimizationResult> {
  const apiKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof process !== 'undefined' && (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY));

  const modelName = 'gemini-3-flash-preview';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  if (!apiKey) {
    const errorMsg =
      'GEMINI_API_KEY is not configured. Please add VITE_GEMINI_API_KEY to your .env file.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const prompt = `
You are editing copy for Courtlane, a pickleball essentials store for beginners and everyday (rec) players.

BRAND VOICE:
- Plain English, calm and specific. Pickleball and court context, not generic “sport life” fluff.
- No supplier artifacts: drop fields like Brand Name: NONE, MainKey, Choice: yes, origin dumps, or marketplace keyword stuffing.
- Avoid hype words: avoid “luxury”, “ultimate”, “world-class”, “best ever”, “must-have”, “risk-free”.
- Do not invent warranties, medical claims, or shipping promises—describe the product only.

INPUT:
- Title: ${originalTitle}
- Description: ${originalDescription}
- Tags: ${tags.join(', ')}

TASK:
1) title: Short, shopper-friendly. No factory codes. Natural title case.
2) description: 2 short paragraphs, then a "Key details" bullet list (4–6 bullets) with only useful facts (material, fit, quantity, use case). No ALL CAPS blocks.
3) tags: 3–5 lowercase tags relevant to Shopify (e.g. pickleball, grip, bundle)—not spam.

Return ONLY JSON:
{"title":"...","description":"...","tags":["..."]}
`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.55,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to communicate with Gemini AI.');
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error('Empty response from Gemini AI.');
    }

    try {
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      let cleanJson = jsonMatch ? jsonMatch[0] : resultText;
      cleanJson = cleanJson.replace(/\n/g, '\\n');
      cleanJson = cleanJson.replace(/\\n\s*([{}\[\],])/g, '\n$1').replace(/([{}\[\],])\s*\\n/g, '$1\n');

      return JSON.parse(cleanJson) as OptimizationResult;
    } catch (parseError) {
      console.error('Gemini Raw Response:', resultText);
      throw new Error(
        `Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`,
      );
    }
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw error;
  }
}
