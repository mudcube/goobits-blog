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

export type DayForecast = {
	sunrise: number
	sunset: number
	hourly: Array<{
		hour: number
		temperature: number
		precipitation: number
		weatherCode: number
		windSpeed: number
		humidity: number
	}>
}

export async function fetchDayForecast(
	input: { date: string; lat?: string | number | null; lon?: string | number | null }
): Promise<DayForecast | null> {
	const lat = toNumber(input.lat)
	const lon = toNumber(input.lon)
	if (lat == null || lon == null) return null

	const url = new URL('https://api.open-meteo.com/v1/forecast')
	url.searchParams.set('latitude', String(lat))
	url.searchParams.set('longitude', String(lon))
	url.searchParams.set('hourly', 'temperature_2m,precipitation,weather_code,wind_speed_10m,relative_humidity_2m')
	url.searchParams.set('daily', 'sunrise,sunset')
	url.searchParams.set('temperature_unit', 'fahrenheit')
	url.searchParams.set('wind_speed_unit', 'mph')
	url.searchParams.set('timezone', 'auto')
	url.searchParams.set('start_date', input.date)
	url.searchParams.set('end_date', input.date)

	const res = await fetch(url.toString())
	if (!res.ok) return null

	const data = await res.json() as {
		daily?: { sunrise?: string[]; sunset?: string[] }
		hourly?: {
			time?: string[]
			temperature_2m?: number[]
			precipitation?: number[]
			weather_code?: number[]
			wind_speed_10m?: number[]
			relative_humidity_2m?: number[]
		}
	}

	const sunriseStr = data.daily?.sunrise?.[0]
	const sunsetStr = data.daily?.sunset?.[0]
	if (!sunriseStr || !sunsetStr) return null

	const sunriseDate = new Date(sunriseStr)
	const sunsetDate = new Date(sunsetStr)
	const sunrise = sunriseDate.getHours() + sunriseDate.getMinutes() / 60
	const sunset = sunsetDate.getHours() + sunsetDate.getMinutes() / 60

	const times = data.hourly?.time ?? []
	const temps = data.hourly?.temperature_2m ?? []
	const precip = data.hourly?.precipitation ?? []
	const codes = data.hourly?.weather_code ?? []
	const winds = data.hourly?.wind_speed_10m ?? []
	const humidity = data.hourly?.relative_humidity_2m ?? []

	const hourly = times.map((_, i) => ({
		hour: new Date(times[i]!).getHours(),
		temperature: Math.round(temps[i] ?? 0),
		precipitation: precip[i] ?? 0,
		weatherCode: codes[i] ?? 0,
		windSpeed: Math.round(winds[i] ?? 0),
		humidity: humidity[i] ?? 0,
	}))

	return { sunrise, sunset, hourly }
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
