import type { HourlyWeather } from '$lib/app/weather'

export type Person = {
	name: string
	color: string
	start: number
	end: number
}

export type PersonRow = Person[]

export type TrackConfig = {
	windowStart: number
	windowEnd: number
	sunrise: number
	sunset: number
	hourly: HourlyWeather[]
	hasRain: boolean
	people: Person[]
	peopleRows: PersonRow[]
}
