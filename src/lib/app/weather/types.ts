/**
 * Weather data provider types.
 *
 * Aligned with Open-Meteo API schema (https://open-meteo.com/en/docs)
 * so swapping from mock → live is just changing the provider import.
 *
 * Live endpoint example:
 *   https://api.open-meteo.com/v1/forecast
 *     ?latitude=45.52&longitude=-122.68
 *     &hourly=temperature_2m,precipitation,weather_code,wind_speed_10m,relative_humidity_2m
 *     &daily=sunrise,sunset
 *     &temperature_unit=fahrenheit
 *     &wind_speed_unit=mph
 *     &timezone=America/Los_Angeles
 */

/** WMO Weather interpretation codes (https://open-meteo.com/en/docs) */
export type WmoCode =
	| 0    // Clear sky
	| 1    // Mainly clear
	| 2    // Partly cloudy
	| 3    // Overcast
	| 45   // Fog
	| 48   // Depositing rime fog
	| 51   // Light drizzle
	| 53   // Moderate drizzle
	| 55   // Dense drizzle
	| 61   // Slight rain
	| 63   // Moderate rain
	| 65   // Heavy rain
	| 71   // Slight snow
	| 73   // Moderate snow
	| 75   // Heavy snow
	| 77   // Snow grains
	| 80   // Slight rain showers
	| 81   // Moderate rain showers
	| 82   // Violent rain showers
	| 85   // Slight snow showers
	| 86   // Heavy snow showers
	| 95   // Thunderstorm
	| 96   // Thunderstorm with slight hail
	| 99   // Thunderstorm with heavy hail

export type HourlyWeather = {
	/** Hour of day (0–23) */
	hour: number
	/** Temperature in °F */
	temperature: number
	/** Precipitation in inches (preceding hour) */
	precipitation: number
	/** WMO weather code */
	weatherCode: WmoCode
	/** Wind speed in mph */
	windSpeed: number
	/** Relative humidity % */
	humidity: number
}

export type DayWeather = {
	/** ISO date string (YYYY-MM-DD) */
	date: string
	/** Sunrise as decimal hour (e.g., 6.75 = 6:45am) */
	sunrise: number
	/** Sunset as decimal hour */
	sunset: number
	/** Hourly forecasts for the day */
	hourly: HourlyWeather[]
}

/** Human-readable condition derived from WMO code */
export function describeWeatherCode(code: WmoCode): string {
	if (code === 0) return 'Clear'
	if (code <= 2) return 'Partly cloudy'
	if (code === 3) return 'Overcast'
	if (code <= 48) return 'Foggy'
	if (code <= 55) return 'Drizzle'
	if (code <= 65) return 'Rain'
	if (code <= 77) return 'Snow'
	if (code <= 82) return 'Showers'
	return 'Thunderstorm'
}

/** Is this code a precipitation event? */
export function isPrecipitation(code: WmoCode): boolean {
	return code >= 51
}

/** Short label for rain intensity */
export function precipLabel(code: WmoCode): string | null {
	if (code >= 95) return 'Thunder'
	if (code >= 80) return 'Showers'
	if (code >= 71) return 'Snow'
	if (code === 65 || code === 55) return 'Heavy'
	if (code === 63 || code === 53) return 'Moderate'
	if (code === 61 || code === 51) return 'Light'
	return null
}
