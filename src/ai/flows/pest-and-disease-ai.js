'use server';
/**
 * @fileOverview An AI agent to identify pest and disease threats and suggest preventative measures.
 *
 * - pestAndDiseaseAI - A function that handles the pest and disease identification process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PestAndDiseaseAIInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown.'),
  growthStage: z.string().describe('The current growth stage of the crop.'),
  symptomsObserved: z.string().describe('Any observed symptoms on the plants.'),
  organicPreference: z.string().describe('Whether the farmer prefers organic solutions (Yes/No).'),
  weatherConditions: z.string().optional().describe('Current weather conditions.'),
  chemicalsUsedEarlier: z.string().optional().describe('Any chemicals used recently.'),
});

const PestAndDiseaseAIOutputSchema = z.object({
  pestThreats: z.array(z.string()).describe('A list of likely pest threats based on the input.'),
  diseaseThreats: z.array(z.string()).describe('A list of likely disease threats based on the input.'),
  preventativeMeasures: z.array(z.string()).describe('A list of measures to prevent these issues.'),
  organicTreatments: z.array(z.string()).describe('A list of organic treatment options.'),
  chemicalTreatments: z.array(z.string()).describe('A list of chemical treatment options. Provide only if organic preference is "No" or if it is an emergency.'),
});

export async function pestAndDiseaseAI(input) {
  if (!process.env.GOOGLE_API_KEY) {
    return { error: 'Server is missing GOOGLE_API_KEY. Please configure it in the .env file.' };
  }
  try {
    return await pestAndDiseaseFlow(input);
  } catch (e) {
    console.error(e);
    return { error: 'An error occurred while communicating with the AI service. Please check the server logs and API key.' };
  }
}

const pestAndDiseasePrompt = ai.definePrompt({
    name: 'pestAndDiseasePrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: PestAndDiseaseAIInputSchema },
    output: { schema: PestAndDiseaseAIOutputSchema },
    prompt: `You are a plant pathologist and entomologist specializing in Indian agriculture. A farmer needs help identifying and managing potential issues.

    Farmer's Report:
    - Crop: {{{cropType}}}
    - Growth Stage: {{{growthStage}}}
    - Symptoms Observed: {{{symptomsObserved}}}
    - Prefers Organic Solutions: {{{organicPreference}}}
    {{#if weatherConditions}}- Current Weather: {{{weatherConditions}}}{{/if}}
    {{#if chemicalsUsedEarlier}}- Previously Used Chemicals: {{{chemicalsUsedEarlier}}}{{/if}}

    Based on this, please provide:
    1.  A list of 2-3 likely pest threats.
    2.  A list of 2-3 likely disease threats.
    3.  A list of practical preventative measures.
    4.  A list of effective organic treatment options.
    5.  If the farmer's preference is 'No' for organic OR if the symptoms suggest a severe infestation requiring immediate action, provide a list of appropriate chemical treatments with cautions. Otherwise, this list should be empty.
    `,
});

const pestAndDiseaseFlow = ai.defineFlow(
  {
    name: 'pestAndDiseaseFlow',
    inputSchema: PestAndDiseaseAIInputSchema,
    outputSchema: PestAndDiseaseAIOutputSchema,
  },
  async (input) => {
    const { output } = await pestAndDiseasePrompt(input);
    return output;
  }
);
