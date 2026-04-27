/** WMO Weather interpretation codes (https://open-meteo.com/en/docs) */
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
