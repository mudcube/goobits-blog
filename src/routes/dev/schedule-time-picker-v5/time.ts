export const SNAP = 0.25

export function snap(v: number) { return Math.round(v / SNAP) * SNAP }
export function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
export function pct(h: number, windowStart: number, windowEnd: number) { return ((h - windowStart) / (windowEnd - windowStart)) * 100 }

export function ft(h: number) {
	const hr = Math.floor(h) % 24
	const min = Math.round((h - Math.floor(h)) * 60)
	const sfx = hr >= 12 ? 'p' : 'a'
	const display = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr
	return min === 0 ? `${display}${sfx}` : `${display}:${String(min).padStart(2, '0')}${sfx}`
}

export function ftShort(h: number) {
	const hr = Math.floor(h) % 24
	if (hr === 0 || hr === 24) return '12a'
	if (hr < 12) return `${hr}`
	if (hr === 12) return '12'
	return `${hr - 12}`
}

export function fDur(d: number) {
	const h = Math.floor(d)
	const m = Math.round((d - h) * 60)
	if (h === 0) return `${m}m`
	if (m === 0) return `${h}h`
	return `${h}h ${m}m`
}
