'use server';
/**
 * @fileOverview Provides crop recommendations to farmers based on their region, soil type, weather, and budget.
 * - recommendCrops - A function that handles the crop recommendation process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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

const RecommendCropsOutputSchema = z.object({
  crops: z.array(z.string()).describe('A list of 3-4 recommended crops suitable for the conditions.'),
  fertilizerSuggestions: z.string().describe('Specific fertilizer advice for the top recommended crop.'),
  pestDiseaseControl: z.string().describe('Common pest and disease control measures for the recommended crops.'),
  weatherPrecautions: z.string().describe('Precautions to take based on the likely weather for the season.'),
  estimatedYield: z.string().describe('An estimated yield for the primary recommended crop.'),
  marketAdvice: z.string().describe('Advice on when and where to sell the produce for better returns.'),
  motivationalMessage: z.string().describe('A short, encouraging message for the farmer.'),
});

export async function recommendCrops(input) {
  if (!process.env.GOOGLE_API_KEY) {
    return { error: 'Server is missing GOOGLE_API_KEY. Please configure it in the .env file.' };
  }
  try {
    return await recommendCropsFlow(input);
  } catch (e) {
    console.error(e);
    return { error: 'An error occurred while communicating with the AI service. Please check the server logs and API key.' };
  }
}

const recommendCropsPrompt = ai.definePrompt(
  {
    name: 'recommendCropsPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: RecommendCropsInputSchema },
    output: { schema: RecommendCropsOutputSchema },
    prompt: `You are an expert agricultural advisor in India. A farmer has provided the following details. Your task is to recommend suitable crops and provide a comprehensive guide.

    Farmer's Details:
    - Location: {{{location}}}
    - Soil Type: {{{soilType}}}
    - Season: {{{season}}}
    - Land Size: {{{landSize}}} acres
    - Irrigation Available: {{{irrigationAvailable}}}
    - Budget: {{{budgetLevel}}}
    {{#if preferredCrops}}- Preferred Crops: {{{preferredCrops}}}{{/if}}
    {{#if pastCrops}}- Crops Grown Last Season: {{{pastCrops}}}{{/if}}

    Based on these details, please provide:
    1.  A list of 3-4 suitable crops.
    2.  Fertilizer advice for the top recommended crop.
    3.  Pest and disease control measures for the recommended crops.
    4.  Weather precautions for the season.
    5.  An estimated yield for the primary crop.
    6.  Market advice for selling the produce.
    7.  A motivational message for the farmer.

    Your response should be practical, tailored to Indian farming conditions, and easy for a farmer to understand.
    `,
  }
);


const recommendCropsFlow = ai.defineFlow(
  {
    name: 'recommendCropsFlow',
    inputSchema: RecommendCropsInputSchema,
    outputSchema: RecommendCropsOutputSchema,
  },
  async (input) => {
    const { output } = await recommendCropsPrompt(input);
    return output;
  }
);
