export type WeatherSnapshot = {
	summary: string
	temperatureF: number
}

function toNumber(value: unknown): number | null {
	if (typeof value === 'number' && Number.isFinite(value)) return value
	if (typeof value === 'string') {
		const parsed = Number.parseFloat(value)
		if (Number.isFinite(parsed)) return parsed
	}
	return null
}

export async function fetchWeatherForEvent(
	input: { startsAt: string; lat?: string | number | null; lon?: string | number | null }
): Promise<WeatherSnapshot | null> {
	const lat = toNumber(input.lat)
	const lon = toNumber(input.lon)
	if (lat == null || lon == null) return null

	const starts = new Date(input.startsAt)
	if (!Number.isFinite(starts.getTime())) return null

	const url = new URL('https://api.open-meteo.com/v1/forecast')
	url.searchParams.set('latitude', String(lat))
	url.searchParams.set('longitude', String(lon))
	url.searchParams.set('hourly', 'temperature_2m,weather_code')
	url.searchParams.set('temperature_unit', 'fahrenheit')
	url.searchParams.set('timezone', 'auto')

	const res = await fetch(url.toString())
	if (!res.ok) return null
	const payload = await res.json() as {
		hourly?: {
			time?: string[]
			temperature_2m?: number[]
			weather_code?: number[]
		}
	}

	const times = payload.hourly?.time ?? []
	const temps = payload.hourly?.temperature_2m ?? []
	const codes = payload.hourly?.weather_code ?? []
	if (!times.length || !temps.length) return null

	const targetHourIso = new Date(starts)
	targetHourIso.setMinutes(0, 0, 0)
	const targetPrefix = targetHourIso.toISOString().slice(0, 13)

	let idx = times.findIndex((time) => time.startsWith(targetPrefix))
	if (idx < 0) idx = 0

	const temperatureF = Math.round((temps[idx] ?? temps[0] ?? 0))
	const code = codes[idx] ?? 0
	const summary = weatherCodeSummary(code)
	return { summary, temperatureF }
}

function weatherCodeSummary(code: number): string {
	if (code === 0) return 'Clear'
	if (code >= 1 && code <= 3) return 'Partly Cloudy'
	if (code >= 45 && code <= 48) return 'Foggy'
	if (code >= 51 && code <= 67) return 'Rain'
	if (code >= 71 && code <= 77) return 'Snow'
	if (code >= 80 && code <= 82) return 'Showers'
	if (code >= 95) return 'Thunderstorm'
	return 'Cloudy'
}
