'use server';
/**
 * @fileOverview An AI agent that suggests relevant government schemes for farmers in India.
 * - getGovtSchemes - A function that suggests relevant government schemes using OpenRouter.
 */

import { z } from 'zod';

// ✅ Input Schema
const GetGovtSchemesInputSchema = z.object({
  state: z.string().describe("The farmer's state of residence."),
  landholdingSize: z.string().describe('The size of landholding in acres.'),
  cropsGrown: z.string().describe('The main crops grown by the farmer.'),
  farmerCategory: z.string().describe('The category of the farmer (e.g., Small and Marginal, Medium, Large).'),
});

// ✅ Output Schema
const GetGovtSchemesOutputSchema = z.object({
  schemes: z
    .array(
      z.object({
        name: z.string().describe('The official name of the government scheme.'),
        summary: z.string().describe('A brief summary of what the scheme provides.'),
        eligibility: z.string().describe('Key eligibility criteria for the scheme.'),
        howToApply: z.string().describe('A simple step-by-step guide on how to apply.'),
      })
    )
    .describe('A list of 2-3 relevant government schemes.'),
});

// ✅ Main exported function
export async function getGovtSchemes(input) {
  const validation = GetGovtSchemesInputSchema.safeParse(input);
  if (!validation.success) {
    return { error: '❌ Invalid input provided.' };
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return { error: '❌ Missing OPENROUTER_API_KEY in .env file.' };
  }

  try {
    return await govtSchemesAdvisorFlow(input);
  } catch (e) {
    console.error('❌ OpenRouter Error:', e);
    return {
      error: 'An error occurred while communicating with the AI service. Please check the logs or API key.',
    };
  }
}

// ✅ OpenRouter-powered Flow Function
const govtSchemesAdvisorFlow = async (input) => {
  const prompt = `
You are an expert on Indian government agricultural schemes. Based on this farmer's profile, suggest 2-3 relevant central or state-level schemes they might qualify for:

Farmer Profile:
- State: ${input.state}
- Landholding Size: ${input.landholdingSize} acres
- Main Crops: ${input.cropsGrown}
- Farmer Category: ${input.farmerCategory}

For each scheme, include:
1. The official name of the scheme
2. A short summary of what the scheme offers
3. Eligibility criteria for this farmer
4. Step-by-step instructions on how to apply

Return your answer in **this exact JSON format**:
{
  "schemes": [
    {
      "name": "...",
      "summary": "...",
      "eligibility": "...",
      "howToApply": "..."
    }
  ]
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
          content: 'You are a government agricultural scheme advisor for Indian farmers.',
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
    return GetGovtSchemesOutputSchema.parse(final);
  } catch (err) {
    console.error('❌ Failed to parse OpenRouter response:', err);
    return {
      schemes: [
        {
          name: 'Parsing Failed',
          summary: 'Unable to interpret AI response.',
          eligibility: 'N/A',
          howToApply: 'N/A',
        },
      ],
    };
  }
};
