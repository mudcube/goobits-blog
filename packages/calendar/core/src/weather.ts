// Weather sub-entry for @calendar/core.
//
// Weather provider abstraction + the live + mock implementations.

export {
	fetchWeatherForEvent,
	fetchDayForecast,
	type WeatherSnapshot,
	type DayForecast
} from './weather/weather-provider.ts'

export { createMockWeatherProvider } from './weather/mock-provider.ts'
export type { WeatherProvider } from './weather/provider.ts'
