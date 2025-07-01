'use server';
/**
 * @fileOverview An AI agent that provides fertilizer and soil health advice to farmers.
 */

import { z } from 'zod';

// ✅ Input Schema
const FertilizerAndSoilAdviceInputSchema = z.object({
  cropSelected: z.string().describe('The crop the farmer is growing.'),
  soilType: z.string().describe('The type of soil.'),
  landSize: z.string().describe('The size of the land in acres.'),
  organicPreference: z.string().describe('Whether the farmer prefers organic methods (Yes/No).'),
  recentFertilizerUsed: z.string().optional().describe('Any fertilizers used recently.'),
  soilTestAvailable: z.string().describe('If soil test results are available (Yes/No).'),
  nitrogenLevel: z.number().optional().describe('Nitrogen level in kg/ha, if available.'),
  phosphorusLevel: z.number().optional().describe('Phosphorus level in kg/ha, if available.'),
  potassiumLevel: z.number().optional().describe('Potassium level in kg/ha, if available.'),
  pH: z.number().optional().describe('Soil pH, if available.'),
});

// ✅ Output Schema
const FertilizerAndSoilAdviceOutputSchema = z.object({
  fertilizerSuggestions: z
    .array(z.object({ suggestion: z.string() }))
    .describe('A list of specific fertilizer suggestions with application details.'),
  soilImprovementSuggestions: z
    .array(z.object({ suggestion: z.string() }))
    .describe('A list of suggestions to improve overall soil health.'),
});

// ✅ Main Function — Called from UI or Server
export async function getFertilizerAndSoilAdvice(input) {
  if (!process.env.OPENROUTER_API_KEY) {
    return { error: '❌ Missing OPENROUTER_API_KEY in environment.' };
  }

  try {
    return await fertilizerAndSoilAdviceFlow(input);
  } catch (e) {
    console.error("❌ OpenRouter API Error:", e);

    // Check if it's a fetch Response error (network or bad JSON)
    if (e instanceof Response) {
      const errorText = await e.text();
      console.error("❌ Error Response Body:", errorText);
    }

    return {
      error: '❌ Failed to connect to AI. Check your API key or network connection.',
    };
  }
}


// ✅ AI Call to OpenRouter (instead of Gemini/Genkit)
const fertilizerAndSoilAdviceFlow = async (input) => {
  const prompt = `
You are an Indian soil science and fertilizer expert. A farmer needs advice based on the following information. Provide practical, actionable suggestions.

Farming Context:
- Crop: ${input.cropSelected}
- Soil Type: ${input.soilType}
- Land Size: ${input.landSize} acres
- Prefers Organic: ${input.organicPreference}
${input.recentFertilizerUsed ? `- Recently Used: ${input.recentFertilizerUsed}` : ''}

Soil Test Data:
- Available: ${input.soilTestAvailable}
${input.nitrogenLevel ? `- Nitrogen (N): ${input.nitrogenLevel} kg/ha` : ''}
${input.phosphorusLevel ? `- Phosphorus (P): ${input.phosphorusLevel} kg/ha` : ''}
${input.potassiumLevel ? `- Potassium (K): ${input.potassiumLevel} kg/ha` : ''}
${input.pH ? `- pH: ${input.pH}` : ''}

Your tasks:
1. Provide a list of 2-3 specific fertilizer suggestions. If the farmer prefers organic, prioritize organic options like compost, vermicompost, or bio-fertilizers. If not, suggest a balanced mix of chemical fertilizers (like Urea, DAP, MOP) with dosages appropriate for the land size. If soil test data is available, tailor the nutrient recommendations accordingly.
2. Provide a list of 2-3 suggestions for long-term soil health improvement. This could include crop rotation, green manuring, incorporating crop residue, etc.

Return response in this strict JSON format:
{
  "fertilizerSuggestions": [
    { "suggestion": "..." },
    { "suggestion": "..." }
  ],
  "soilImprovementSuggestions": [
    { "suggestion": "..." },
    { "suggestion": "..." }
  ]
}
`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct',
      messages: [
        { role: 'system', content: 'You are a helpful agricultural assistant.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? '{}';

  try {
    const parsed = JSON.parse(raw);
    return FertilizerAndSoilAdviceOutputSchema.parse(parsed);
  } catch (err) {
    console.error('⚠️ AI response parsing failed:', err);
    return {
      fertilizerSuggestions: [{ suggestion: '❌ Failed to parse AI response.' }],
      soilImprovementSuggestions: [],
    };
  }
};

