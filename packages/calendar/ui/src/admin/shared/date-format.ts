export function formatAdminDayLabel(iso: string) {
	const date = new Date(iso)
	return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }).toUpperCase()
}

export function formatAdminTimeLabel(iso: string) {
	return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase()
}
