/**
 * Gemini AI Utility
 * 
 * This utility handles communication with the Google Gemini 2.0 Flash model
 * to perform luxury-focused product attribute optimization.
 */

export interface OptimizationResult {
  title: string;
  description: string;
  tags: string[];
}

/**
 * Optimizes product details into the "Courtlane" luxury style
 */
export async function optimizeProduct(
  originalTitle: string, 
  originalDescription: string,
  tags: string[] = []
): Promise<OptimizationResult> {
  // Extract API key with robustness for different environments
  const apiKey = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || 
    (typeof process !== 'undefined' && (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY));
    
  const modelName = "gemini-3-flash-preview";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  if (!apiKey) {
    const errorMsg = "GEMINI_API_KEY is not configured. Please add VITE_GEMINI_API_KEY to your .env file.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const prompt = `
    You are the "Master Copywriter" for Courtlane, a high-end, luxury pickleball brand.
    Your mission is to transform a basic product listing into a premium, world-class masterpiece.
    
    ESTABLISHED BRAND VOICE:
    - Tone: Sophisticated, high-energy, minimalist, and aspirational.
    - Style: Performance-driven narrative. Focus on the feeling of excellence on the court.
    - Vocabulary: Exclusive, precision, elite, vanguard, effortless, heritage, unparalleled.
    
    TARGET PRODUCT:
    - Original Title: "${originalTitle}"
    - Original Description: "${originalDescription}"
    - Current Tags: ${tags.join(", ")}
    
    REQUIREMENTS:
    1. NEW TITLE: Create a sharp, evocative title that feels premium.
    2. NEW DESCRIPTION: A structured, evocative description (2-3 short paragraphs). 
       Include a "PERFORMANCE HIGHLIGHTS" bulleted section.
    3. NEW TAGS: Suggest 3-5 luxury/performance keywords (e.g., "Pro-Level", "Elite Performance").
    
    FORMAT: Return ONLY a JSON object with this structure:
    {
      "title": "...",
      "description": "...",
      "tags": ["...", "..."]
    }
  `;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to communicate with Gemini AI.");
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("Empty response from Gemini AI.");
    }

    // Robust JSON extraction
    try {
      // Find JSON block if AI wrapped it in markdown code blocks
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      let cleanJson = jsonMatch ? jsonMatch[0] : resultText;
      
      // SURGICAL RESTORER: Handle raw newlines in LLM JSON
      // 1. Escape all newlines
      cleanJson = cleanJson.replace(/\n/g, '\\n');
      // 2. Restore structural newlines (those that belong between JSON elements)
      cleanJson = cleanJson.replace(/\\n\s*([{}\[\],])/g, '\n$1').replace(/([{}\[\],])\s*\\n/g, '$1\n');
      
      return JSON.parse(cleanJson) as OptimizationResult;
    } catch (parseError) {
      console.error("Gemini Raw Response:", resultText);
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`);
    }
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
}
