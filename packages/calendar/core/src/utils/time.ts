export function toIsoString(date: string | number | Date) {
	return new Date(date).toISOString()
}

export function addMinutes(isoString: string, minutes: number) {
	const date = new Date(isoString)
	date.setMinutes(date.getMinutes() + minutes)
	return date.toISOString()
}

export function overlaps(
	aStart: string | number | Date,
	aEnd: string | number | Date,
	bStart: string | number | Date,
	bEnd: string | number | Date
) {
	return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd)
}
