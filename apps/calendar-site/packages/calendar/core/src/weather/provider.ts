export type WeatherProvider = {
	getDay(date: string): { date: string; sunrise: number; sunset: number; hourly: Array<{ hour: number; temperature: number; precipitation: number; weatherCode: number; windSpeed: number; humidity: number }> } | null
}
