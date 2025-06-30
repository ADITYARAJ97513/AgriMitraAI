'use server';

/**
 * @fileOverview An AI agent that provides weather alerts and recommendations tailored to specific crops.
 *
 * - getWeatherAlerts - A function that returns weather alerts and recommendations.
 */

import {ai} from '@/ai/genkit';
import { getWeatherForecast } from '@/services/weather';
import { z } from 'zod';

const GetWeatherAlertsInputSchema = z.object({
  location: z.string().describe("The farmer's location."),
  cropPlanned: z.string().optional().describe("The crop being planned or grown."),
});

const GetWeatherAlertsOutputSchema = z.object({
    reportTitle: z.string().describe("The title of the weather report, e.g., 'Weather Forecast for Patna'"),
    overallSummary: z.string().describe("A brief, human-readable summary of the weather."),
    recommendations: z.array(z.string()).describe("A list of 2-3 actionable recommendations for the farmer."),
    motivationalMessage: z.string().describe("A short, encouraging message for the farmer.")
});

export async function getWeatherAlerts(input) {
  if (!process.env.GOOGLE_API_KEY) {
    return { error: 'Server is missing GOOGLE_API_KEY. Please configure it in the .env file.' };
  }
  try {
    return await weatherWatchFlow(input);
  } catch (e) {
    console.error(e);
    return { error: 'An error occurred while communicating with the AI service. Please check the server logs and API key.' };
  }
}

const weatherWatchPrompt = ai.definePrompt({
    name: 'weatherWatchPrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: z.object({ 
        location: z.string(),
        forecast: z.any(), 
        cropPlanned: z.string().optional() 
    }) },
    output: { schema: GetWeatherAlertsOutputSchema },
    prompt: `You are an agricultural weather advisor. Based on the following weather forecast data for a farmer, provide a helpful report.

    Location: {{{location}}}
    Crop Planned: {{{cropPlanned}}}

    Weather Forecast Data:
    - Summary: {{{forecast.summary}}}
    - Temperature: {{{forecast.temperature}}}°C
    - Precipitation: {{{forecast.precipitation}}}
    - Wind Speed: {{{forecast.windSpeed}}} km/h
    - Humidity: {{{forecast.humidity}}}%

    Your tasks:
    1.  Create a 'reportTitle' for the farmer's location.
    2.  Write an 'overallSummary' of the weather conditions in simple terms.
    3.  Generate a list of 2-3 actionable 'recommendations'. If a crop is mentioned, tailor the advice for that crop (e.g., "For your tomato crop, ensure adequate irrigation due to high heat."). If there are no immediate threats, a recommendation could be "Weather seems favorable for normal operations."
    4.  Provide a short 'motivationalMessage'.
    `,
});

const weatherWatchFlow = ai.defineFlow(
  {
    name: 'weatherWatchFlow',
    inputSchema: GetWeatherAlertsInputSchema,
    outputSchema: GetWeatherAlertsOutputSchema,
  },
  async ({location, cropPlanned}) => {
    // Step 1: Get the raw weather data from the service.
    const forecast = await getWeatherForecast(location || "default");
    
    // Step 2: Pass the data to the AI to generate intelligent recommendations.
    const { output } = await weatherWatchPrompt({ location, forecast, cropPlanned });

    return output;
  }
);
