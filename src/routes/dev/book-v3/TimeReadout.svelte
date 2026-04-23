<script lang="ts">
	import type { HourlyWeather } from '$lib/app/weather'
	import { describeWeatherCode, isPrecipitation } from '$lib/app/weather'
	import { ft, fDur, snap, clamp } from './time'

	let {
		start = $bindable(12),
		end = $bindable(14),
		hourly,
	}: {
		start?: number
		end?: number
		hourly: HourlyWeather[]
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

	function onKeydown(e: KeyboardEvent, field: 'start' | 'end' | 'dur') {
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
</script>

<div class="tr">
	<div class="tr__times">
		<span class="tr__time" contenteditable="true" spellcheck="false" role="textbox" tabindex="0" data-tip="Edit start time" onfocus={selectAll} onblur={(e) => commitField(e.currentTarget as HTMLElement, 'start')} onkeydown={(e) => onKeydown(e, 'start')}>{ft(start)}</span>
		<span class="tr__line"></span>
		<span class="tr__dur" contenteditable="true" spellcheck="false" role="textbox" tabindex="0" data-tip="Edit duration" onfocus={selectAll} onblur={(e) => commitField(e.currentTarget as HTMLElement, 'dur')} onkeydown={(e) => onKeydown(e, 'dur')}>{fDur(duration)}</span>
		<span class="tr__line"></span>
		<span class="tr__time tr__time--end" contenteditable="true" spellcheck="false" role="textbox" tabindex="0" data-tip="Edit end time" onfocus={selectAll} onblur={(e) => commitField(e.currentTarget as HTMLElement, 'end')} onkeydown={(e) => onKeydown(e, 'end')}>{ft(end)}</span>
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
