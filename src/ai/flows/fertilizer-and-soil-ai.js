'use server';
/**
 * @fileOverview An AI agent that provides fertilizer and soil health advice to farmers.
 *
 * - getFertilizerAndSoilAdvice - A function that provides fertilizer and soil advice.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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

const FertilizerAndSoilAdviceOutputSchema = z.object({
  fertilizerSuggestions: z.array(z.object({ suggestion: z.string() })).describe('A list of specific fertilizer suggestions with application details.'),
  soilImprovementSuggestions: z.array(z.object({ suggestion: z.string() })).describe('A list of suggestions to improve overall soil health.'),
});

export async function getFertilizerAndSoilAdvice(input) {
  if (!process.env.GOOGLE_API_KEY) {
    return { error: 'Server is missing GOOGLE_API_KEY. Please configure it in the .env file.' };
  }
  try {
    return await fertilizerAndSoilAdviceFlow(input);
  } catch (e) {
    console.error(e);
    return { error: 'An error occurred while communicating with the AI service. Please check the server logs and API key.' };
  }
}

const fertilizerAndSoilAdvicePrompt = ai.definePrompt({
    name: 'fertilizerAndSoilAdvicePrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: FertilizerAndSoilAdviceInputSchema },
    output: { schema: FertilizerAndSoilAdviceOutputSchema },
    prompt: `You are an Indian soil science and fertilizer expert. A farmer needs advice based on the following information. Provide practical, actionable suggestions.

    Farming Context:
    - Crop: {{{cropSelected}}}
    - Soil Type: {{{soilType}}}
    - Land Size: {{{landSize}}} acres
    - Prefers Organic: {{{organicPreference}}}
    {{#if recentFertilizerUsed}}- Recently Used: {{{recentFertilizerUsed}}}{{/if}}
    
    Soil Test Data:
    - Available: {{{soilTestAvailable}}}
    {{#if nitrogenLevel}}- Nitrogen (N): {{{nitrogenLevel}}} kg/ha{{/if}}
    {{#if phosphorusLevel}}- Phosphorus (P): {{{phosphorusLevel}}} kg/ha{{/if}}
    {{#if potassiumLevel}}- Potassium (K): {{{potassiumLevel}}} kg/ha{{/if}}
    {{#if pH}}- pH: {{{pH}}}{{/if}}

    Your tasks:
    1.  Provide a list of 2-3 specific fertilizer suggestions. If the farmer prefers organic, prioritize organic options like compost, vermicompost, or bio-fertilizers. If not, suggest a balanced mix of chemical fertilizers (like Urea, DAP, MOP) with dosages appropriate for the land size. If soil test data is available, tailor the nutrient recommendations accordingly.
    2.  Provide a list of 2-3 suggestions for long-term soil health improvement. This could include crop rotation, green manuring, incorporating crop residue, etc.
    `,
});

const fertilizerAndSoilAdviceFlow = ai.defineFlow(
  {
    name: 'fertilizerAndSoilAdviceFlow',
    inputSchema: FertilizerAndSoilAdviceInputSchema,
    outputSchema: FertilizerAndSoilAdviceOutputSchema,
  },
  async (input) => {
    const { output } = await fertilizerAndSoilAdvicePrompt(input);
    return output;
  }
);
