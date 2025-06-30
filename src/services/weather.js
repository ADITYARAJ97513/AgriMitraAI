'use server';

/**
 * @fileOverview A mock weather service.
 */

/**
 * A mock function to get a weather forecast.
 * In a real application, this would call a weather API.
 * @param {string} location The location to get the forecast for.
 * @returns {Promise<object>} A promise that resolves to mock weather data.
 */
export async function getWeatherForecast(location) {
    // Let's generate some deterministic but plausible fake data based on the location name.
    // This ensures that for the same location, we get the same "forecast".
    const hash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const tempSeed = (hash % 25) + 15; // Temperature between 15°C and 40°C
    const rainSeed = hash % 10;
    
    let precipitation = 'None';
    let temperature = tempSeed;
    let summary;

    if (rainSeed < 2) {
        precipitation = 'Heavy Rain';
        temperature -= 5; // Rain cools things down
        summary = `Heavy rainfall and strong winds are expected.`;
    } else if (rainSeed < 5) {
        precipitation = 'Light Rain';
        temperature -= 2;
        summary = 'Light showers and cloudy skies are likely.'
    } else {
        precipitation = 'None';
        temperature += 5; // Sunny days are hotter
        summary = 'Clear and sunny skies with high temperatures.'
    }

    // Cap temperature
    if (temperature > 42) temperature = 42;
    if (temperature < 10) temperature = 10;


    return {
        temperature: parseFloat(temperature.toFixed(1)),
        precipitation,
        windSpeed: (hash % 20) + 5,
        humidity: (hash % 40) + 50,
        summary,
    };
}
