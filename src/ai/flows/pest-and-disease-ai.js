'use server';
/**
 * @fileOverview An AI agent to identify pest and disease threats and suggest preventative measures using OpenRouter.
 */

import { z } from 'zod';

// ✅ Input Schema
const PestAndDiseaseAIInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown.'),
  growthStage: z.string().describe('The current growth stage of the crop.'),
  symptomsObserved: z.string().describe('Any observed symptoms on the plants.'),
  organicPreference: z.string().describe('Whether the farmer prefers organic solutions (Yes/No).'),
  weatherConditions: z.string().optional().describe('Current weather conditions.'),
  chemicalsUsedEarlier: z.string().optional().describe('Any chemicals used recently.'),
});

// ✅ Output Schema
const PestAndDiseaseAIOutputSchema = z.object({
  pestThreats: z.array(z.string()).describe('A list of likely pest threats based on the input.'),
  diseaseThreats: z.array(z.string()).describe('A list of likely disease threats based on the input.'),
  preventativeMeasures: z.array(z.string()).describe('A list of measures to prevent these issues.'),
  organicTreatments: z.array(z.string()).describe('A list of organic treatment options.'),
  chemicalTreatments: z.array(z.string()).describe('A list of chemical treatment options. Provide only if organic preference is "No" or if it is an emergency.'),
});

// ✅ Main Function
export async function pestAndDiseaseAI(input) {
  const validation = PestAndDiseaseAIInputSchema.safeParse(input);
  if (!validation.success) {
    return { error: '❌ Invalid input provided.' };
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return { error: '❌ Missing OPENROUTER_API_KEY in .env file.' };
  }

  try {
    return await pestAndDiseaseFlow(input);
  } catch (e) {
    console.error('❌ OpenRouter Error:', e);
    return {
      error: 'An error occurred while communicating with the AI service. Please check the logs or API key.',
    };
  }
}

// ✅ OpenRouter-based Flow
const pestAndDiseaseFlow = async (input) => {
  const prompt = `
You are a plant pathologist and entomologist specializing in Indian agriculture. A farmer needs help identifying and managing threats.

Farmer's Report:
- Crop: ${input.cropType}
- Growth Stage: ${input.growthStage}
- Symptoms: ${input.symptomsObserved}
- Organic Preference: ${input.organicPreference}
${input.weatherConditions ? `- Weather: ${input.weatherConditions}` : ''}
${input.chemicalsUsedEarlier ? `- Chemicals Used Earlier: ${input.chemicalsUsedEarlier}` : ''}

Please respond with this JSON format:
{
  "pestThreats": ["...", "..."],
  "diseaseThreats": ["...", "..."],
  "preventativeMeasures": ["...", "..."],
  "organicTreatments": ["...", "..."],
  "chemicalTreatments": ["...", "..."]
}

Important:
- If organicPreference is "Yes", keep chemicalTreatments empty unless symptoms are severe.
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
        { role: 'system', content: 'You are an agricultural pest and disease expert.' },
        { role: 'user', content: prompt },
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
    return PestAndDiseaseAIOutputSchema.parse(final);
  } catch (err) {
    console.error('❌ Failed to parse OpenRouter response:', err);
    return {
      pestThreats: ['❌ Failed to parse AI response.'],
      diseaseThreats: [],
      preventativeMeasures: [],
      organicTreatments: [],
      chemicalTreatments: [],
    };
  }
};
