'use server';
/**
 * @fileOverview An AI agent that suggests relevant government schemes for farmers in India.
 *
 * - getGovtSchemes - A function that suggests relevant government schemes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetGovtSchemesInputSchema = z.object({
  state: z.string().describe("The farmer's state of residence."),
  landholdingSize: z.string().describe('The size of landholding in acres.'),
  cropsGrown: z.string().describe('The main crops grown by the farmer.'),
  farmerCategory: z.string().describe('The category of the farmer (e.g., Small and Marginal, Medium, Large).'),
});

const GetGovtSchemesOutputSchema = z.object({
  schemes: z.array(
    z.object({
      name: z.string().describe('The official name of the government scheme.'),
      summary: z.string().describe('A brief summary of what the scheme provides.'),
      eligibility: z.string().describe('Key eligibility criteria for the scheme.'),
      howToApply: z.string().describe('A simple step-by-step guide on how to apply.'),
    })
  ).describe('A list of 2-3 relevant government schemes.'),
});

export async function getGovtSchemes(input) {
  if (!process.env.GOOGLE_API_KEY) {
    return { error: 'Server is missing GOOGLE_API_KEY. Please configure it in the .env file.' };
  }
  try {
    return await govtSchemesAdvisorFlow(input);
  } catch (e) {
    console.error(e);
    return { error: 'An error occurred while communicating with the AI service. Please check the server logs and API key.' };
  }
}

const govtSchemesAdvisorPrompt = ai.definePrompt({
    name: 'govtSchemesAdvisorPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GetGovtSchemesInputSchema },
    output: { schema: GetGovtSchemesOutputSchema },
    prompt: `You are an expert on Indian government agricultural schemes. A farmer has provided their details. Identify the top 2-3 most relevant central or state-specific government schemes they might be eligible for.

    Farmer Profile:
    - State: {{{state}}}
    - Landholding Size: {{{landholdingSize}}} acres
    - Main Crops: {{{cropsGrown}}}
    - Farmer Category: {{{farmerCategory}}}

    For each recommended scheme, provide:
    1. The official name of the scheme.
    2. A brief, easy-to-understand summary.
    3. Key eligibility criteria, tailored to the farmer's profile.
    4. A simple, step-by-step guide on how to apply.
    `,
});

const govtSchemesAdvisorFlow = ai.defineFlow(
  {
    name: 'govtSchemesAdvisorFlow',
    inputSchema: GetGovtSchemesInputSchema,
    outputSchema: GetGovtSchemesOutputSchema,
  },
  async (input) => {
    const { output } = await govtSchemesAdvisorPrompt(input);
    return output;
  }
);
