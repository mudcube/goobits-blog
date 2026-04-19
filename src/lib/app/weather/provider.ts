import type { DayWeather } from './types'

/**
 * Weather data provider interface.
 *
 * Implementations:
 *   - mock: ./mock-provider.ts (hardcoded, no network)
 *   - live: TODO — fetch from Open-Meteo API
 */
export type WeatherProvider = {
	getDay(date: string): DayWeather | null
}
