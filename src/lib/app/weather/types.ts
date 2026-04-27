// Re-export weather types from the calendar package (single source of truth)
export { describeWeatherCode, isPrecipitation, precipLabel } from '@calendar/ui/booking/weather'
export type { WmoCode, HourlyWeather, DayWeather } from '@calendar/ui/booking/weather'
