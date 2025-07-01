'use server';

/**
 * @fileOverview An AI agent that provides weather alerts and crop-specific recommendations using OpenRouter.
 */

import { getWeatherForecast } from '@/services/weather';
import { z } from 'zod';

// ✅ Input Schema
const GetWeatherAlertsInputSchema = z.object({
  location: z.string().describe("The farmer's location."),
  cropPlanned: z.string().optional().describe("The crop being planned or grown."),
});

// ✅ Output Schema
const GetWeatherAlertsOutputSchema = z.object({
  reportTitle: z.string().describe("The title of the weather report, e.g., 'Weather Forecast for Patna'"),
  overallSummary: z.string().describe("A brief, human-readable summary of the weather."),
  recommendations: z.array(z.string()).describe("A list of 2-3 actionable recommendations for the farmer."),
  motivationalMessage: z.string().describe("A short, encouraging message for the farmer."),
});

// ✅ Entry Point
export async function getWeatherAlerts(input) {
  const validation = GetWeatherAlertsInputSchema.safeParse(input);
  if (!validation.success) {
    return { error: '❌ Invalid input. Please check the fields.' };
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return { error: '❌ Missing OPENROUTER_API_KEY in .env file.' };
  }

  try {
    return await weatherWatchFlow(input);
  } catch (e) {
    console.error('❌ OpenRouter Weather AI Error:', e);
    return {
      error: 'An error occurred while communicating with OpenRouter. Please check logs.',
    };
  }
}

// ✅ OpenRouter Flow with Fallback for Small Towns
const weatherWatchFlow = async ({ location, cropPlanned }) => {
  const normalizedLocation = location.trim().toLowerCase().replace(/\s+/g, ' ');
  const forecast = await getWeatherForecast(normalizedLocation || 'default');

  // ⛔ Fallback for unavailable data
  if (!forecast || !forecast.summary) {
    return {
      reportTitle: `Weather Report for ${location}`,
      overallSummary: `Sorry, weather data for "${location}" could not be fetched.`,
      recommendations: [
        '✅ Try entering a nearby city or district name.',
        '✅ Check spelling and avoid local town nicknames.',
      ],
      motivationalMessage: 'Keep going! Nature rewards the patient.',
    };
  }

  const prompt = `
You are an agricultural weather advisor in India. A farmer at "${location}" is growing ${cropPlanned || "a crop"}.

Here is their local weather forecast:
- Summary: ${forecast.summary}
- Temperature: ${forecast.temperature}°C
- Precipitation: ${forecast.precipitation}
- Wind Speed: ${forecast.windSpeed} km/h
- Humidity: ${forecast.humidity}%

Tasks:
1. Write a report title like "Weather Forecast for Patna".
2. Give a clear summary of the weather (rain, heat, storms, etc.).
3. List 2-3 simple recommendations tailored to the crop (or general if no crop is provided).
4. Add a motivational message for the farmer.

Respond in **this exact JSON** format:

{
  "reportTitle": "...",
  "overallSummary": "...",
  "recommendations": ["...", "..."],
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
        {
          role: 'system',
          content: 'You are a friendly agricultural weather assistant.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  const raw = await res.text();
  console.log('🔍 OpenRouter Weather Raw Response:', raw);

  if (!res.ok) {
    throw new Error(`OpenRouter API returned status ${res.status}`);
  }

  try {
    const parsed = JSON.parse(raw);
    const content = parsed.choices?.[0]?.message?.content ?? '{}';
    const final = JSON.parse(content);
    return GetWeatherAlertsOutputSchema.parse(final);
  } catch (err) {
    console.error('❌ Failed to parse weather response:', err);
    return {
      reportTitle: 'Weather Report Unavailable',
      overallSummary: 'Could not interpret forecast data.',
      recommendations: [],
      motivationalMessage: '',
    };
  }
};
