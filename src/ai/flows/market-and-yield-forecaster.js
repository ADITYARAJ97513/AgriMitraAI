'use server';
/**
 * @fileOverview An AI agent that provides yield estimation and market advice for farmers.
 *
 * - marketAndYieldForecast - A function that handles the market and yield forecast process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MarketAndYieldForecastInputSchema = z.object({
  cropName: z.string().describe('Name of the crop.'),
  location: z.string().describe('Location (District, State) for market price context.'),
  landSize: z.string().describe('Land size in acres.'),
  farmingMethod: z.string().describe('Farming method used (e.g., Organic, Traditional, High-yield hybrid).'),
  expectedHarvestMonth: z.string().describe('The month the harvest is expected.'),
  cropVariety: z.string().optional().describe('Specific variety of the crop, if known.'),
  inputCosts: z.string().optional().describe('Total input costs in Rupees, if available.'),
  mandiPreference: z.string().optional().describe('Preferred local market (mandi).'),
});

const MarketAndYieldForecastOutputSchema = z.object({
  yieldEstimation: z.string().describe('An estimated yield for the crop in quintals or tons per acre.'),
  marketAdvice: z.string().describe('Advice on expected market prices, demand, and best time/place to sell.'),
  profitAnalysis: z.string().describe('A simple profit analysis if input costs are provided, otherwise an empty string.'),
});

export async function marketAndYieldForecast(input) {
  if (!process.env.GOOGLE_API_KEY) {
    return { error: 'Server is missing GOOGLE_API_KEY. Please configure it in the .env file.' };
  }
  try {
    return await marketAndYieldForecastFlow(input);
  } catch (e) {
    console.error(e);
    return { error: 'An error occurred while communicating with the AI service. Please check the server logs and API key.' };
  }
}

const marketAndYieldForecastPrompt = ai.definePrompt({
    name: 'marketAndYieldForecastPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: MarketAndYieldForecastInputSchema },
    output: { schema: MarketAndYieldForecastOutputSchema },
    prompt: `You are an agricultural market analyst for the Indian market. A farmer wants a forecast.

    Details:
    - Crop: {{{cropName}}}
    {{#if cropVariety}}- Variety: {{{cropVariety}}}{{/if}}
    - Location: {{{location}}}
    - Land Size: {{{landSize}}} acres
    - Farming Method: {{{farmingMethod}}}
    - Expected Harvest: {{{expectedHarvestMonth}}}
    {{#if inputCosts}}- Estimated Input Costs: Rs. {{{inputCosts}}}{{/if}}
    {{#if mandiPreference}}- Preferred Market: {{{mandiPreference}}}{{/if}}

    Your tasks:
    1.  Provide a realistic yield estimation in quintals per acre.
    2.  Give market advice: What are the expected prices in their location around harvest time? Should they sell immediately or store? Mention any relevant demand trends.
    3.  If input costs are provided, create a simple profit analysis (Estimated Yield * Estimated Price - Input Costs). If not, return an empty string for this field.
    `,
});


const marketAndYieldForecastFlow = ai.defineFlow(
  {
    name: 'marketAndYieldForecastFlow',
    inputSchema: MarketAndYieldForecastInputSchema,
    outputSchema: MarketAndYieldForecastOutputSchema,
  },
  async (input) => {
    const { output } = await marketAndYieldForecastPrompt(input);
    return output;
  }
);
