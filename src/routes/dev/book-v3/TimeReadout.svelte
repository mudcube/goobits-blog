<script lang="ts">
	import type { HourlyWeather } from '$lib/app/weather'
	import { describeWeatherCode, isPrecipitation } from '$lib/app/weather'
	import { ft, fDur, snap, clamp, SNAP } from './time'

	let {
		start = $bindable(12),
		end = $bindable(14),
		hourly,
		onNudge,
	}: {
		start?: number
		end?: number
		hourly: HourlyWeather[]
		onNudge?: () => void
	} = $props()

	const duration = $derived(end - start)

	function weatherAt(hour: number) {
		if (!hourly.length) return null
		const exact = hourly.find(w => w.hour === Math.floor(hour))
		return exact ?? hourly.reduce((a, b) => Math.abs(a.hour - hour) < Math.abs(b.hour - hour) ? a : b)
	}

	const wxS = $derived(weatherAt(start))
	const wxE = $derived(weatherAt(end > start ? end - 1 : end))

	function parseTime(input: string): number | null {
		const s = input.trim().toLowerCase().replace(/\s+/g, '')
		const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/i)
		if (!m) return null
		let hr = parseInt(m[1]!, 10)
		const min = m[2] ? parseInt(m[2], 10) : 0
		const ampm = m[3]?.toLowerCase()
		if (ampm === 'pm' || ampm === 'p') { if (hr < 12) hr += 12 }
		else if (ampm === 'am' || ampm === 'a') { if (hr === 12) hr = 0 }
		if (hr < 0 || hr > 24 || min < 0 || min > 59) return null
		return hr + min / 60
	}

	function parseDuration(input: string): number | null {
		const s = input.trim().toLowerCase()
		const hm = s.match(/^(\d+)\s*h\s*(?:(\d+)\s*m)?$/)
		if (hm) return parseInt(hm[1]!, 10) + (hm[2] ? parseInt(hm[2], 10) / 60 : 0)
		const mOnly = s.match(/^(\d+)\s*m$/)
		if (mOnly) return parseInt(mOnly[1]!, 10) / 60
		const num = parseFloat(s)
		if (!isNaN(num) && num > 0) return num
		return null
	}

	function commitField(el: HTMLElement, field: 'start' | 'end' | 'dur') {
		const text = el.textContent?.trim() ?? ''
		if (field === 'start') {
			const t = parseTime(text)
			if (t !== null) start = snap(clamp(t, 0, end - 0.25))
		} else if (field === 'end') {
			const t = parseTime(text)
			if (t !== null) end = snap(clamp(t, start + 0.25, 24))
		} else {
			const d = parseDuration(text)
			if (d !== null && d > 0) end = snap(clamp(start + d, start + 0.25, 24))
		}
		// Reset display to formatted value
		if (field === 'start') el.textContent = ft(start)
		else if (field === 'end') el.textContent = ft(end)
		else el.textContent = fDur(end - start)
	}

	function nudge(field: 'start' | 'end' | 'dur', dir: 1 | -1, fast = false) {
		const step = (fast ? 1 : SNAP) * dir
		if (field === 'start') {
			const dur = end - start
			const ns = snap(clamp(start + step, 0, 24 - dur))
			start = ns
			end = ns + dur
		} else if (field === 'end') {
			end = snap(clamp(end + step, start + SNAP, 24))
		} else {
			// Duration: try extending from end, if blocked extend from start
			const target = duration + step
			if (target < SNAP) return
			let ne = snap(start + target)
			if (ne <= 24) {
				end = ne
			} else {
				// End is capped — push start earlier
				const ns = snap(clamp(24 - target, 0, start))
				start = ns
				end = 24
			}
		}
	}

	function onKeydown(e: KeyboardEvent, field: 'start' | 'end' | 'dur') {
		if (e.key === 'ArrowUp') {
			e.preventDefault()
			onNudge?.()
			nudge(field, 1, e.shiftKey)
			;(e.currentTarget as HTMLElement).textContent = field === 'start' ? ft(start) : field === 'end' ? ft(end) : fDur(end - start)
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			onNudge?.()
			nudge(field, -1, e.shiftKey)
			;(e.currentTarget as HTMLElement).textContent = field === 'start' ? ft(start) : field === 'end' ? ft(end) : fDur(end - start)
		}
		if (e.key === 'Enter') {
			e.preventDefault()
			commitField(e.currentTarget as HTMLElement, field)
			;(e.currentTarget as HTMLElement).blur()
		}
		if (e.key === 'Escape') {
			const el = e.currentTarget as HTMLElement
			if (field === 'start') el.textContent = ft(start)
			else if (field === 'end') el.textContent = ft(end)
			else el.textContent = fDur(duration)
			el.blur()
		}
	}

	function selectAll(e: FocusEvent) {
		const el = e.currentTarget as HTMLElement
		const range = document.createRange()
		range.selectNodeContents(el)
		const sel = window.getSelection()
		sel?.removeAllRanges()
		sel?.addRange(range)
	}

	let startEl = $state<HTMLElement | null>(null)
	let durEl = $state<HTMLElement | null>(null)
	let endEl = $state<HTMLElement | null>(null)

	// Sync contenteditable text when values change (e.g. from drag)
	$effect(() => {
		if (startEl && document.activeElement !== startEl) startEl.textContent = ft(start)
	})
	$effect(() => {
		// Access both start and end to track duration changes
		const d = fDur(end - start)
		if (durEl && document.activeElement !== durEl) durEl.textContent = d
	})
	$effect(() => {
		if (endEl && document.activeElement !== endEl) endEl.textContent = ft(end)
	})
</script>

<div class="tr">
	<div class="tr__times">
		<span class="tr__time" bind:this={startEl} contenteditable="true" spellcheck="false" role="textbox" tabindex="0" data-tip="Type or ↑↓ to adjust" onfocus={selectAll} onblur={(e) => commitField(e.currentTarget as HTMLElement, 'start')} onkeydown={(e) => onKeydown(e, 'start')}>{ft(start)}</span>
		<span class="tr__line"></span>
		<span class="tr__dur" bind:this={durEl} contenteditable="true" spellcheck="false" role="textbox" tabindex="0" data-tip="Type or ↑↓ to adjust" onfocus={selectAll} onblur={(e) => commitField(e.currentTarget as HTMLElement, 'dur')} onkeydown={(e) => onKeydown(e, 'dur')}>{fDur(duration)}</span>
		<span class="tr__line"></span>
		<span class="tr__time tr__time--end" bind:this={endEl} contenteditable="true" spellcheck="false" role="textbox" tabindex="0" data-tip="Type or ↑↓ to adjust" onfocus={selectAll} onblur={(e) => commitField(e.currentTarget as HTMLElement, 'end')} onkeydown={(e) => onKeydown(e, 'end')}>{ft(end)}</span>
	</div>
	{#if wxS && wxE}
		<div class="tr__wx">
			<span class:tr__rain={isPrecipitation(wxS.weatherCode)}>{wxS.temperature}° {describeWeatherCode(wxS.weatherCode).toLowerCase()}</span>
			<span class="tr__wx--end" class:tr__rain={isPrecipitation(wxE.weatherCode)}>{wxE.temperature}° {describeWeatherCode(wxE.weatherCode).toLowerCase()}</span>
		</div>
	{/if}
</div>

<style>
	.tr { display: grid; gap: 0.15rem; margin: 0.25rem 0 0.75rem; }
	.tr__times { display: flex; align-items: center; gap: 0.4rem; }
	.tr__time { font-family: var(--font-display); font-size: 1.05rem; font-weight: 500; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; flex-shrink: 0; border-bottom: 1px dashed color-mix(in srgb, var(--text) 18%, transparent); padding: 0 0.1rem; cursor: text; outline: none; transition: border-color 150ms; }
	.tr__time:hover, .tr__time:focus { border-color: color-mix(in srgb, var(--text) 40%, transparent); }
	.tr__time--end { margin-left: auto; }
	.tr__line { flex: 1; height: 1px; background: color-mix(in srgb, var(--text) 12%, transparent); min-width: 0.5rem; }
	.tr__dur { font-size: 0.78rem; font-weight: 600; color: color-mix(in srgb, var(--text) 55%, transparent); flex-shrink: 0; border-bottom: 1px dashed color-mix(in srgb, var(--text) 12%, transparent); padding: 0 0.1rem; cursor: text; outline: none; transition: border-color 150ms; }
	.tr__dur:hover, .tr__dur:focus { border-color: color-mix(in srgb, var(--text) 35%, transparent); }
	.tr__wx { display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 500; color: color-mix(in srgb, var(--text) 55%, transparent); font-variant-numeric: tabular-nums; }
	.tr__wx--end { text-align: right; }
	.tr__rain { color: #60a5fa; }
</style>
