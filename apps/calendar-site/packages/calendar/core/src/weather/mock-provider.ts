import type { WeatherProvider } from './provider'

type HourlyEntry = { hour: number; temperature: number; precipitation: number; weatherCode: number; windSpeed: number; humidity: number }

function h(hour: number, temp: number, code: number, wind: number, humidity: number, precip: number): HourlyEntry {
	return { hour, temperature: temp, precipitation: precip, weatherCode: code, windSpeed: wind, humidity }
}

const CLEAR: HourlyEntry[] = [
	h(0,44,0,3,78,0),h(1,43,0,2,80,0),h(2,42,0,2,81,0),h(3,42,0,2,82,0),h(4,41,0,2,83,0),h(5,42,0,2,82,0),
	h(6,43,1,3,80,0),h(7,46,1,4,75,0),h(8,49,1,5,70,0),h(9,52,2,6,64,0),h(10,55,2,7,58,0),h(11,58,1,8,54,0),
	h(12,60,1,8,50,0),h(13,62,1,9,48,0),h(14,63,1,8,47,0),h(15,62,2,9,49,0),h(16,61,2,7,52,0),h(17,59,2,6,56,0),
	h(18,56,2,5,62,0),h(19,53,1,4,68,0),h(20,50,0,3,72,0),h(21,48,0,3,75,0),h(22,46,0,2,77,0),h(23,45,0,2,78,0),
]

const RAINY: HourlyEntry[] = [
	h(0,47,3,6,88,0),h(1,47,3,5,89,0),h(2,46,61,6,90,.02),h(3,46,61,7,91,.03),h(4,46,63,7,92,.05),h(5,46,63,8,92,.06),
	h(6,47,63,9,90,.08),h(7,48,63,10,88,.07),h(8,49,61,9,85,.04),h(9,50,61,8,82,.03),h(10,51,3,7,78,0),h(11,52,2,7,75,0),
	h(12,54,2,8,72,0),h(13,55,2,8,70,0),h(14,55,3,8,71,0),h(15,54,3,7,74,0),h(16,53,61,8,78,.03),h(17,52,63,9,82,.06),
	h(18,51,63,10,85,.08),h(19,50,61,8,87,.04),h(20,49,61,7,88,.02),h(21,48,3,6,89,0),h(22,47,3,5,90,0),h(23,47,3,5,90,0),
]

const MIXED: HourlyEntry[] = [
	h(0,45,3,5,85,0),h(1,44,3,4,86,0),h(2,44,3,4,87,0),h(3,44,61,5,88,.02),h(4,44,61,6,89,.03),h(5,45,63,7,88,.05),
	h(6,46,63,8,86,.06),h(7,47,61,8,84,.04),h(8,48,61,7,80,.02),h(9,50,3,6,74,0),h(10,53,2,6,68,0),h(11,56,2,7,62,0),
	h(12,59,1,8,56,0),h(13,61,1,8,52,0),h(14,62,1,8,50,0),h(15,61,1,7,52,0),h(16,59,2,6,56,0),h(17,57,2,5,60,0),
	h(18,54,2,4,66,0),h(19,51,1,3,70,0),h(20,49,0,3,74,0),h(21,47,0,2,77,0),h(22,46,0,2,79,0),h(23,45,0,2,80,0),
]

const PATTERNS = [CLEAR, RAINY, MIXED]

function dayPattern(dateStr: string): HourlyEntry[] {
	let hash = 0
	for (let i = 0; i < dateStr.length; i++) hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0
	return PATTERNS[Math.abs(hash) % PATTERNS.length]!
}

/** Mock weather provider with Portland, OR data. Deterministic per date. */
export function createMockWeatherProvider(): WeatherProvider {
	return {
		getDay(date: string) {
			return { date, sunrise: 6.42, sunset: 20.08, hourly: dayPattern(date) }
		}
	}
}
