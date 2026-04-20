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

/** A clear mid-April day in Portland — realistic temps and longer daylight */
const CLEAR_DAY: HourlyWeather[] = [
	mockHourly(0,  { temp: 44, code: 0,  wind: 3, humidity: 78, precip: 0 }),
	mockHourly(1,  { temp: 43, code: 0,  wind: 2, humidity: 80, precip: 0 }),
	mockHourly(2,  { temp: 42, code: 0,  wind: 2, humidity: 81, precip: 0 }),
	mockHourly(3,  { temp: 42, code: 0,  wind: 2, humidity: 82, precip: 0 }),
	mockHourly(4,  { temp: 41, code: 0,  wind: 2, humidity: 83, precip: 0 }),
	mockHourly(5,  { temp: 42, code: 0,  wind: 2, humidity: 82, precip: 0 }),
	mockHourly(6,  { temp: 43, code: 1,  wind: 3, humidity: 80, precip: 0 }),
	mockHourly(7,  { temp: 46, code: 1,  wind: 4, humidity: 75, precip: 0 }),
	mockHourly(8,  { temp: 49, code: 1,  wind: 5, humidity: 70, precip: 0 }),
	mockHourly(9,  { temp: 52, code: 2,  wind: 6, humidity: 64, precip: 0 }),
	mockHourly(10, { temp: 55, code: 2,  wind: 7, humidity: 58, precip: 0 }),
	mockHourly(11, { temp: 58, code: 1,  wind: 8, humidity: 54, precip: 0 }),
	mockHourly(12, { temp: 60, code: 1,  wind: 8, humidity: 50, precip: 0 }),
	mockHourly(13, { temp: 62, code: 1,  wind: 9, humidity: 48, precip: 0 }),
	mockHourly(14, { temp: 63, code: 1,  wind: 8, humidity: 47, precip: 0 }),
	mockHourly(15, { temp: 62, code: 2,  wind: 9, humidity: 49, precip: 0 }),
	mockHourly(16, { temp: 61, code: 2,  wind: 7, humidity: 52, precip: 0 }),
	mockHourly(17, { temp: 59, code: 2,  wind: 6, humidity: 56, precip: 0 }),
	mockHourly(18, { temp: 56, code: 2,  wind: 5, humidity: 62, precip: 0 }),
	mockHourly(19, { temp: 53, code: 1,  wind: 4, humidity: 68, precip: 0 }),
	mockHourly(20, { temp: 50, code: 0,  wind: 3, humidity: 72, precip: 0 }),
	mockHourly(21, { temp: 48, code: 0,  wind: 3, humidity: 75, precip: 0 }),
	mockHourly(22, { temp: 46, code: 0,  wind: 2, humidity: 77, precip: 0 }),
	mockHourly(23, { temp: 45, code: 0,  wind: 2, humidity: 78, precip: 0 }),
]

/** A rainy mid-April day in Portland — classic PNW */
const RAINY_DAY: HourlyWeather[] = [
	mockHourly(0,  { temp: 47, code: 3,  wind: 6, humidity: 88, precip: 0 }),
	mockHourly(1,  { temp: 47, code: 3,  wind: 5, humidity: 89, precip: 0 }),
	mockHourly(2,  { temp: 46, code: 61, wind: 6, humidity: 90, precip: 0.02 }),
	mockHourly(3,  { temp: 46, code: 61, wind: 7, humidity: 91, precip: 0.03 }),
	mockHourly(4,  { temp: 46, code: 63, wind: 7, humidity: 92, precip: 0.05 }),
	mockHourly(5,  { temp: 46, code: 63, wind: 8, humidity: 92, precip: 0.06 }),
	mockHourly(6,  { temp: 47, code: 63, wind: 9, humidity: 90, precip: 0.08 }),
	mockHourly(7,  { temp: 48, code: 63, wind: 10, humidity: 88, precip: 0.07 }),
	mockHourly(8,  { temp: 49, code: 61, wind: 9, humidity: 85, precip: 0.04 }),
	mockHourly(9,  { temp: 50, code: 61, wind: 8, humidity: 82, precip: 0.03 }),
	mockHourly(10, { temp: 51, code: 3,  wind: 7, humidity: 78, precip: 0 }),
	mockHourly(11, { temp: 52, code: 2,  wind: 7, humidity: 75, precip: 0 }),
	mockHourly(12, { temp: 54, code: 2,  wind: 8, humidity: 72, precip: 0 }),
	mockHourly(13, { temp: 55, code: 2,  wind: 8, humidity: 70, precip: 0 }),
	mockHourly(14, { temp: 55, code: 3,  wind: 8, humidity: 71, precip: 0 }),
	mockHourly(15, { temp: 54, code: 3,  wind: 7, humidity: 74, precip: 0 }),
	mockHourly(16, { temp: 53, code: 61, wind: 8, humidity: 78, precip: 0.03 }),
	mockHourly(17, { temp: 52, code: 63, wind: 9, humidity: 82, precip: 0.06 }),
	mockHourly(18, { temp: 51, code: 63, wind: 10, humidity: 85, precip: 0.08 }),
	mockHourly(19, { temp: 50, code: 61, wind: 8, humidity: 87, precip: 0.04 }),
	mockHourly(20, { temp: 49, code: 61, wind: 7, humidity: 88, precip: 0.02 }),
	mockHourly(21, { temp: 48, code: 3,  wind: 6, humidity: 89, precip: 0 }),
	mockHourly(22, { temp: 47, code: 3,  wind: 5, humidity: 90, precip: 0 }),
	mockHourly(23, { temp: 47, code: 3,  wind: 5, humidity: 90, precip: 0 }),
]

/** A mixed mid-April day — morning rain, afternoon sun */
const MIXED_DAY: HourlyWeather[] = [
	mockHourly(0,  { temp: 45, code: 3,  wind: 5, humidity: 85, precip: 0 }),
	mockHourly(1,  { temp: 44, code: 3,  wind: 4, humidity: 86, precip: 0 }),
	mockHourly(2,  { temp: 44, code: 3,  wind: 4, humidity: 87, precip: 0 }),
	mockHourly(3,  { temp: 44, code: 61, wind: 5, humidity: 88, precip: 0.02 }),
	mockHourly(4,  { temp: 44, code: 61, wind: 6, humidity: 89, precip: 0.03 }),
	mockHourly(5,  { temp: 45, code: 63, wind: 7, humidity: 88, precip: 0.05 }),
	mockHourly(6,  { temp: 46, code: 63, wind: 8, humidity: 86, precip: 0.06 }),
	mockHourly(7,  { temp: 47, code: 61, wind: 8, humidity: 84, precip: 0.04 }),
	mockHourly(8,  { temp: 48, code: 61, wind: 7, humidity: 80, precip: 0.02 }),
	mockHourly(9,  { temp: 50, code: 3,  wind: 6, humidity: 74, precip: 0 }),
	mockHourly(10, { temp: 53, code: 2,  wind: 6, humidity: 68, precip: 0 }),
	mockHourly(11, { temp: 56, code: 2,  wind: 7, humidity: 62, precip: 0 }),
	mockHourly(12, { temp: 59, code: 1,  wind: 8, humidity: 56, precip: 0 }),
	mockHourly(13, { temp: 61, code: 1,  wind: 8, humidity: 52, precip: 0 }),
	mockHourly(14, { temp: 62, code: 1,  wind: 8, humidity: 50, precip: 0 }),
	mockHourly(15, { temp: 61, code: 1,  wind: 7, humidity: 52, precip: 0 }),
	mockHourly(16, { temp: 59, code: 2,  wind: 6, humidity: 56, precip: 0 }),
	mockHourly(17, { temp: 57, code: 2,  wind: 5, humidity: 60, precip: 0 }),
	mockHourly(18, { temp: 54, code: 2,  wind: 4, humidity: 66, precip: 0 }),
	mockHourly(19, { temp: 51, code: 1,  wind: 3, humidity: 70, precip: 0 }),
	mockHourly(20, { temp: 49, code: 0,  wind: 3, humidity: 74, precip: 0 }),
	mockHourly(21, { temp: 47, code: 0,  wind: 2, humidity: 77, precip: 0 }),
	mockHourly(22, { temp: 46, code: 0,  wind: 2, humidity: 79, precip: 0 }),
	mockHourly(23, { temp: 45, code: 0,  wind: 2, humidity: 80, precip: 0 }),
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
				sunrise: 6.42,   // 6:25am — mid-April Portland, OR
				sunset: 20.08,   // 8:05pm
				hourly: dayPattern(date),
			}
		}
	}
}
