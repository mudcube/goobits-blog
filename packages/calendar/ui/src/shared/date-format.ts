export function formatEventDayLabel(iso: string) {
	const date = new Date(iso)
	return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }).toUpperCase()
}

export function formatEventTimeLabel(iso: string) {
	return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase()
}
