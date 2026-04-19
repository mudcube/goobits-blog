import type { DayWeather, HourlyWeather, WmoCode } from './types'
import type { WeatherProvider } from './provider'

/**
 * Mock weather provider — returns realistic Portland, OR winter weather.
 * Shaped exactly like Open-Meteo API data so swapping to live is trivial.
 */

function mockHourly(hour: number, base: { temp: number; code: WmoCode; wind: number; humidity: number; precip: number }): HourlyWeather {
	return {
		hour,
		temperature: base.temp,
		precipitation: base.precip,
		weatherCode: base.code,
		windSpeed: base.wind,
		humidity: base.humidity,
	}
}

/** A clear late-February day in Portland — realistic temp fluctuations */
const CLEAR_DAY: HourlyWeather[] = [
	mockHourly(0,  { temp: 38, code: 0,  wind: 2, humidity: 82, precip: 0 }),
	mockHourly(1,  { temp: 37, code: 0,  wind: 2, humidity: 83, precip: 0 }),
	mockHourly(2,  { temp: 37, code: 0,  wind: 1, humidity: 84, precip: 0 }),
	mockHourly(3,  { temp: 36, code: 0,  wind: 1, humidity: 85, precip: 0 }),
	mockHourly(4,  { temp: 35, code: 0,  wind: 1, humidity: 86, precip: 0 }),
	mockHourly(5,  { temp: 35, code: 0,  wind: 2, humidity: 85, precip: 0 }),
	mockHourly(6,  { temp: 36, code: 1,  wind: 2, humidity: 83, precip: 0 }),
	mockHourly(7,  { temp: 39, code: 1,  wind: 3, humidity: 80, precip: 0 }),
	mockHourly(8,  { temp: 43, code: 1,  wind: 4, humidity: 75, precip: 0 }),
	mockHourly(9,  { temp: 46, code: 2,  wind: 5, humidity: 68, precip: 0 }),
	mockHourly(10, { temp: 50, code: 2,  wind: 6, humidity: 62, precip: 0 }),
	mockHourly(11, { temp: 53, code: 2,  wind: 7, humidity: 58, precip: 0 }),
	mockHourly(12, { temp: 55, code: 1,  wind: 8, humidity: 55, precip: 0 }),
	mockHourly(13, { temp: 57, code: 1,  wind: 8, humidity: 52, precip: 0 }),
	mockHourly(14, { temp: 59, code: 1,  wind: 7, humidity: 51, precip: 0 }),
	mockHourly(15, { temp: 57, code: 2,  wind: 8, humidity: 54, precip: 0 }),
	mockHourly(16, { temp: 58, code: 2,  wind: 6, humidity: 56, precip: 0 }),
	mockHourly(17, { temp: 55, code: 2,  wind: 5, humidity: 60, precip: 0 }),
	mockHourly(18, { temp: 51, code: 3,  wind: 4, humidity: 66, precip: 0 }),
	mockHourly(19, { temp: 48, code: 3,  wind: 4, humidity: 72, precip: 0 }),
	mockHourly(20, { temp: 46, code: 0,  wind: 3, humidity: 75, precip: 0 }),
	mockHourly(21, { temp: 44, code: 0,  wind: 2, humidity: 78, precip: 0 }),
	mockHourly(22, { temp: 42, code: 0,  wind: 2, humidity: 80, precip: 0 }),
	mockHourly(23, { temp: 41, code: 0,  wind: 2, humidity: 81, precip: 0 }),
]

/** A rainy spring day — realistic wobble */
const RAINY_DAY: HourlyWeather[] = [
	mockHourly(0,  { temp: 44, code: 3,  wind: 5, humidity: 88, precip: 0 }),
	mockHourly(1,  { temp: 44, code: 3,  wind: 5, humidity: 89, precip: 0 }),
	mockHourly(2,  { temp: 43, code: 3,  wind: 4, humidity: 90, precip: 0 }),
	mockHourly(3,  { temp: 43, code: 61, wind: 6, humidity: 91, precip: 0.02 }),
	mockHourly(4,  { temp: 44, code: 61, wind: 6, humidity: 92, precip: 0.03 }),
	mockHourly(5,  { temp: 43, code: 61, wind: 7, humidity: 92, precip: 0.02 }),
	mockHourly(6,  { temp: 44, code: 63, wind: 8, humidity: 90, precip: 0.06 }),
	mockHourly(7,  { temp: 45, code: 63, wind: 9, humidity: 88, precip: 0.08 }),
	mockHourly(8,  { temp: 46, code: 63, wind: 10, humidity: 85, precip: 0.07 }),
	mockHourly(9,  { temp: 47, code: 61, wind: 9, humidity: 82, precip: 0.04 }),
	mockHourly(10, { temp: 48, code: 61, wind: 8, humidity: 80, precip: 0.02 }),
	mockHourly(11, { temp: 49, code: 3,  wind: 7, humidity: 78, precip: 0 }),
	mockHourly(12, { temp: 50, code: 2,  wind: 7, humidity: 75, precip: 0 }),
	mockHourly(13, { temp: 52, code: 2,  wind: 8, humidity: 72, precip: 0 }),
	mockHourly(14, { temp: 51, code: 2,  wind: 8, humidity: 73, precip: 0 }),
	mockHourly(15, { temp: 52, code: 3,  wind: 7, humidity: 71, precip: 0 }),
	mockHourly(16, { temp: 50, code: 61, wind: 8, humidity: 78, precip: 0.03 }),
	mockHourly(17, { temp: 49, code: 63, wind: 9, humidity: 82, precip: 0.06 }),
	mockHourly(18, { temp: 48, code: 63, wind: 10, humidity: 85, precip: 0.08 }),
	mockHourly(19, { temp: 48, code: 61, wind: 8, humidity: 87, precip: 0.04 }),
	mockHourly(20, { temp: 47, code: 61, wind: 7, humidity: 88, precip: 0.02 }),
	mockHourly(21, { temp: 46, code: 3,  wind: 6, humidity: 89, precip: 0 }),
	mockHourly(22, { temp: 45, code: 3,  wind: 5, humidity: 90, precip: 0 }),
	mockHourly(23, { temp: 45, code: 3,  wind: 5, humidity: 90, precip: 0 }),
]

/** A mixed day — morning rain, afternoon clearing */
const MIXED_DAY: HourlyWeather[] = [
	mockHourly(0,  { temp: 41, code: 3,  wind: 4, humidity: 85, precip: 0 }),
	mockHourly(1,  { temp: 40, code: 3,  wind: 4, humidity: 86, precip: 0 }),
	mockHourly(2,  { temp: 40, code: 3,  wind: 3, humidity: 87, precip: 0 }),
	mockHourly(3,  { temp: 40, code: 3,  wind: 3, humidity: 88, precip: 0 }),
	mockHourly(4,  { temp: 40, code: 61, wind: 5, humidity: 89, precip: 0.02 }),
	mockHourly(5,  { temp: 41, code: 61, wind: 6, humidity: 88, precip: 0.03 }),
	mockHourly(6,  { temp: 42, code: 63, wind: 8, humidity: 86, precip: 0.06 }),
	mockHourly(7,  { temp: 43, code: 63, wind: 9, humidity: 84, precip: 0.07 }),
	mockHourly(8,  { temp: 44, code: 61, wind: 8, humidity: 80, precip: 0.04 }),
	mockHourly(9,  { temp: 46, code: 61, wind: 7, humidity: 76, precip: 0.02 }),
	mockHourly(10, { temp: 49, code: 3,  wind: 6, humidity: 70, precip: 0 }),
	mockHourly(11, { temp: 52, code: 2,  wind: 6, humidity: 65, precip: 0 }),
	mockHourly(12, { temp: 55, code: 2,  wind: 7, humidity: 60, precip: 0 }),
	mockHourly(13, { temp: 57, code: 1,  wind: 7, humidity: 56, precip: 0 }),
	mockHourly(14, { temp: 58, code: 1,  wind: 7, humidity: 54, precip: 0 }),
	mockHourly(15, { temp: 57, code: 1,  wind: 6, humidity: 56, precip: 0 }),
	mockHourly(16, { temp: 55, code: 2,  wind: 5, humidity: 60, precip: 0 }),
	mockHourly(17, { temp: 52, code: 2,  wind: 4, humidity: 65, precip: 0 }),
	mockHourly(18, { temp: 49, code: 2,  wind: 3, humidity: 70, precip: 0 }),
	mockHourly(19, { temp: 46, code: 1,  wind: 3, humidity: 74, precip: 0 }),
	mockHourly(20, { temp: 44, code: 0,  wind: 2, humidity: 78, precip: 0 }),
	mockHourly(21, { temp: 43, code: 0,  wind: 2, humidity: 80, precip: 0 }),
	mockHourly(22, { temp: 42, code: 0,  wind: 2, humidity: 82, precip: 0 }),
	mockHourly(23, { temp: 41, code: 0,  wind: 2, humidity: 83, precip: 0 }),
]

const PATTERNS = [CLEAR_DAY, RAINY_DAY, MIXED_DAY]

function dayPattern(dateStr: string): HourlyWeather[] {
	// Deterministic based on date string so same date always returns same weather
	let hash = 0
	for (let i = 0; i < dateStr.length; i++) hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0
	return PATTERNS[Math.abs(hash) % PATTERNS.length]!
}

export function createMockWeatherProvider(): WeatherProvider {
	return {
		getDay(date: string): DayWeather {
			return {
				date,
				sunrise: 6.83,   // 6:50am — late February Portland, OR
				sunset: 17.92,   // 5:55pm
				hourly: dayPattern(date),
			}
		}
	}
}
