'use server';
/**
 * @fileOverview An AI agent for detecting plant diseases from images.
 *
 * - detectPlantDisease - A function that handles the plant disease detection process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DetectPlantDiseaseInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  cropType: z.string().describe('The type of crop.'),
  growthStage: z.string().describe('The growth stage of the crop.'),
  location: z.string().optional().describe('The location of the farm.'),
  symptomsObserved: z.string().optional().describe('Additional symptoms observed by the farmer.'),
});

const DetectPlantDiseaseOutputSchema = z.object({
  isPlant: z.boolean().describe('Whether a plant leaf is detected in the image.'),
  disease: z.string().describe('The name of the detected disease, or "Healthy" if no disease is found.'),
  description: z.string().describe('A description of the disease and its symptoms.'),
  solution: z.string().describe('Actionable advice for treating the disease, including both organic and chemical options if applicable.'),
});

export async function detectPlantDisease(input) {
  if (!process.env.GOOGLE_API_KEY) {
    return { error: 'Server is missing GOOGLE_API_KEY. Please configure it in the .env file.' };
  }
  try {
    return await detectPlantDiseaseFlow(input);
  } catch (e) {
    console.error(e);
    return { error: 'An error occurred while communicating with the AI service. Please check the server logs and API key.' };
  }
}

const detectPlantDiseasePrompt = ai.definePrompt({
    name: 'detectPlantDiseasePrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: DetectPlantDiseaseInputSchema },
    output: { schema: DetectPlantDiseaseOutputSchema },
    prompt: `You are an expert botanist specializing in diagnosing plant illnesses from images. Analyze the provided image and information to identify plant diseases.

    You will use this information to diagnose the plant.
    1. First, determine if the image contains a plant leaf. Set 'isPlant' accordingly.
    2. If it is a plant, identify the disease. If it looks healthy, the disease should be "Healthy".
    3. Provide a clear description of the disease's symptoms.
    4. Provide an actionable solution, offering both organic and chemical treatments where appropriate.

    Context:
    - Image: {{media url=photoDataUri}}
    - Crop Type: {{{cropType}}}
    - Growth Stage: {{{growthStage}}}
    {{#if location}}- Location: {{{location}}}{{/if}}
    {{#if symptomsObserved}}- Additional Symptoms: {{{symptomsObserved}}}{{/if}}
    `,
});


const detectPlantDiseaseFlow = ai.defineFlow(
  {
    name: 'detectPlantDiseaseFlow',
    inputSchema: DetectPlantDiseaseInputSchema,
    outputSchema: DetectPlantDiseaseOutputSchema,
  },
  async (input) => {
    const { output } = await detectPlantDiseasePrompt(input);
    return output;
  }
);
