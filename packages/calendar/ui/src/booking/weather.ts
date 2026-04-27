/**
 * Weather types aligned with Open-Meteo API schema.
 * https://open-meteo.com/en/docs
 */

/** WMO Weather interpretation codes */
export type WmoCode =
	| 0 | 1 | 2 | 3 | 45 | 48
	| 51 | 53 | 55 | 61 | 63 | 65
	| 71 | 73 | 75 | 77 | 80 | 81 | 82
	| 85 | 86 | 95 | 96 | 99

export type HourlyWeather = {
	hour: number
	temperature: number
	precipitation: number
	weatherCode: WmoCode
	windSpeed: number
	humidity: number
}

export type DayWeather = {
	date: string
	sunrise: number
	sunset: number
	hourly: HourlyWeather[]
}

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

export function isPrecipitation(code: WmoCode): boolean {
	return code >= 51
}

export function precipLabel(code: WmoCode): string | null {
	if (code >= 95) return 'Thunder'
	if (code >= 80) return 'Showers'
	if (code >= 71) return 'Snow'
	if (code === 65 || code === 55) return 'Heavy'
	if (code === 63 || code === 53) return 'Moderate'
	if (code === 61 || code === 51) return 'Light'
	return null
}
