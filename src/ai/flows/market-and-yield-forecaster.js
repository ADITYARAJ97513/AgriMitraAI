'use server';
/**
 * @fileOverview An AI agent that provides yield estimation and market advice for farmers using OpenRouter.
 */

import { z } from 'zod';

// ✅ Input Schema
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

// ✅ Output Schema
const MarketAndYieldForecastOutputSchema = z.object({
  yieldEstimation: z.string().describe('An estimated yield for the crop in quintals or tons per acre.'),
  marketAdvice: z.string().describe('Advice on expected market prices, demand, and best time/place to sell.'),
  profitAnalysis: z.string().describe('A simple profit analysis if input costs are provided, otherwise an empty string.'),
});

// ✅ Entry point function
export async function marketAndYieldForecast(input) {
  const validation = MarketAndYieldForecastInputSchema.safeParse(input);
  if (!validation.success) {
    return { error: '❌ Invalid input provided.' };
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return { error: '❌ Missing OPENROUTER_API_KEY in .env file.' };
  }

  try {
    return await marketAndYieldForecastFlow(input);
  } catch (e) {
    console.error('❌ OpenRouter Error:', e);
    return {
      error: 'An error occurred while communicating with the AI service. Please check the logs or API key.',
    };
  }
}

// ✅ OpenRouter-powered AI function
const marketAndYieldForecastFlow = async (input) => {
  const prompt = `
You are an agricultural market analyst in India. A farmer has provided the following details:

- Crop: ${input.cropName}
${input.cropVariety ? `- Variety: ${input.cropVariety}` : ''}
- Location: ${input.location}
- Land Size: ${input.landSize} acres
- Farming Method: ${input.farmingMethod}
- Expected Harvest: ${input.expectedHarvestMonth}
${input.inputCosts ? `- Input Costs: Rs. ${input.inputCosts}` : ''}
${input.mandiPreference ? `- Preferred Mandi: ${input.mandiPreference}` : ''}

Your tasks:
1. Provide a realistic yield estimation in quintals per acre.
2. Give market advice: price forecast, whether to sell immediately or store, and demand trends.
3. If input costs are provided, do a simple profit analysis (Yield × Price - Input Costs). Else, leave this field empty.

Return your response in this exact JSON format:

{
  "yieldEstimation": "...",
  "marketAdvice": "...",
  "profitAnalysis": "..."
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
        {
          role: 'system',
          content: 'You are a yield and market advisor for Indian farmers.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  const raw = await res.text();
  console.log('🔍 OpenRouter Raw Response:', raw);

  if (!res.ok) {
    throw new Error(`OpenRouter API error: ${res.status}`);
  }

  try {
    const parsed = JSON.parse(raw);
    const content = parsed.choices?.[0]?.message?.content ?? '{}';
    const final = JSON.parse(content);
    return MarketAndYieldForecastOutputSchema.parse(final);
  } catch (err) {
    console.error('❌ Failed to parse OpenRouter response:', err);
    return {
      yieldEstimation: '❌ Failed to parse AI response.',
      marketAdvice: '',
      profitAnalysis: '',
    };
  }
};
