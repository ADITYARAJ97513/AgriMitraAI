'use server';
/**
 * @fileOverview Provides crop recommendations to farmers based on their region, soil type, weather, and budget.
 * - recommendCrops - A function that handles the crop recommendation process using OpenRouter.
 */

import { z } from 'zod';

// ✅ Input Schema
const RecommendCropsInputSchema = z.object({
  location: z.string().describe("The farmer's location, e.g., Patna, Bihar"),
  soilType: z.string().describe('The type of soil, e.g., Alluvial, Black, Red'),
  season: z.string().describe('The current farming season, e.g., Kharif, Rabi, Zaid'),
  landSize: z.string().describe('The size of the land in acres'),
  irrigationAvailable: z.string().describe('Whether irrigation is available (Yes/No)'),
  budgetLevel: z.string().describe("The farmer's budget level (Low, Medium, High)"),
  preferredCrops: z.string().optional().describe('Crops the farmer prefers to grow'),
  pastCrops: z.string().optional().describe('Crops grown in the past for rotation advice'),
});

// ✅ Output Schema
const RecommendCropsOutputSchema = z.object({
  crops: z.array(z.string()).describe('A list of 3-4 recommended crops suitable for the conditions.'),
  fertilizerSuggestions: z.string().describe('Specific fertilizer advice for the top recommended crop.'),
  pestDiseaseControl: z.string().describe('Common pest and disease control measures for the recommended crops.'),
  weatherPrecautions: z.string().describe('Precautions to take based on the likely weather for the season.'),
  estimatedYield: z.string().describe('An estimated yield for the primary recommended crop.'),
  marketAdvice: z.string().describe('Advice on when and where to sell the produce for better returns.'),
  motivationalMessage: z.string().describe('A short, encouraging message for the farmer.'),
});

// ✅ Main entry function
export async function recommendCrops(input) {
  const validation = RecommendCropsInputSchema.safeParse(input);
  if (!validation.success) {
    return { error: '❌ Invalid input. Please check the fields.' };
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return { error: '❌ Missing OPENROUTER_API_KEY in environment.' };
  }

  try {
    return await recommendCropsFlow(input);
  } catch (e) {
    console.error('❌ OpenRouter Error:', e);
    return {
      error: 'An error occurred while communicating with the AI service. Please check the server logs and API key.',
    };
  }
}

// ✅ OpenRouter-based AI logic
const recommendCropsFlow = async (input) => {
  const prompt = `
You are an expert agricultural advisor in India. A farmer has provided the following details:

- Location: ${input.location}
- Soil Type: ${input.soilType}
- Season: ${input.season}
- Land Size: ${input.landSize} acres
- Irrigation Available: ${input.irrigationAvailable}
- Budget Level: ${input.budgetLevel}
${input.preferredCrops ? `- Preferred Crops: ${input.preferredCrops}` : ''}
${input.pastCrops ? `- Crops Grown Last Season: ${input.pastCrops}` : ''}

Your task is to provide:
1. A list of 3–4 recommended crops suitable for the region and season.
2. Fertilizer advice for the top crop.
3. Pest and disease control tips for the crops.
4. Weather precautions based on the season.
5. Estimated yield for the primary crop.
6. Market advice to maximize profit.
7. A motivational message.

🎯 Format the response as this exact JSON:

{
  "crops": ["...", "..."],
  "fertilizerSuggestions": "...",
  "pestDiseaseControl": "...",
  "weatherPrecautions": "...",
  "estimatedYield": "...",
  "marketAdvice": "...",
  "motivationalMessage": "..."
}
`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct',
      messages: [
        { role: 'system', content: 'You are a helpful agricultural assistant for Indian farmers.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const raw = await res.text();
  console.log('🔍 OpenRouter Raw Response:', raw);

  if (!res.ok) {
    throw new Error(`OpenRouter API Error: ${res.status}`);
  }

  try {
    const parsed = JSON.parse(raw);
    const content = parsed.choices?.[0]?.message?.content ?? '{}';
    const final = JSON.parse(content);
    return RecommendCropsOutputSchema.parse(final);
  } catch (err) {
    console.error('❌ JSON parse or validation failed:', err);
    return {
      crops: [],
      fertilizerSuggestions: '❌ Failed to parse response.',
      pestDiseaseControl: '',
      weatherPrecautions: '',
      estimatedYield: '',
      marketAdvice: '',
      motivationalMessage: '',
    };
  }
};
