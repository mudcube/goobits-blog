export function toIsoString(date) {
	return new Date(date).toISOString()
}

export function addMinutes(isoString, minutes) {
	const date = new Date(isoString)
	date.setMinutes(date.getMinutes() + minutes)
	return date.toISOString()
}

export function overlaps(aStart, aEnd, bStart, bEnd) {
	return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd)
}
