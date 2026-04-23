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

	let editing = $state<'start' | 'end' | 'dur' | null>(null)
	let editValue = $state('')

	function weatherAt(hour: number) {
		if (!hourly.length) return null
		const exact = hourly.find(w => w.hour === Math.floor(hour))
		return exact ?? hourly.reduce((a, b) => Math.abs(a.hour - hour) < Math.abs(b.hour - hour) ? a : b)
	}

	const wxS = $derived(weatherAt(start))
	const wxE = $derived(weatherAt(end > start ? end - 1 : end))

	function beginEdit(field: 'start' | 'end' | 'dur') {
		editing = field
		if (field === 'dur') editValue = String(duration)
		else editValue = ft(field === 'start' ? start : end)
	}

	function parseTime(input: string): number | null {
		const s = input.trim().toLowerCase().replace(/\s+/g, '')
		// Match patterns: "2pm", "2:30pm", "14", "14:30", "2p", "2:30p"
		const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/i)
		if (!m) return null
		let hr = parseInt(m[1]!, 10)
		const min = m[2] ? parseInt(m[2], 10) : 0
		const ampm = m[3]?.toLowerCase()
		if (ampm === 'pm' || ampm === 'p') { if (hr < 12) hr += 12 }
		else if (ampm === 'am' || ampm === 'a') { if (hr === 12) hr = 0 }
		else { /* 24h format, no adjustment */ }
		if (hr < 0 || hr > 24 || min < 0 || min > 59) return null
		return hr + min / 60
	}

	function parseDuration(input: string): number | null {
		const s = input.trim().toLowerCase()
		// "2h", "2h 30m", "2.5", "30m", "2h30m"
		const hm = s.match(/^(\d+)\s*h\s*(?:(\d+)\s*m)?$/)
		if (hm) return parseInt(hm[1]!, 10) + (hm[2] ? parseInt(hm[2], 10) / 60 : 0)
		const mOnly = s.match(/^(\d+)\s*m$/)
		if (mOnly) return parseInt(mOnly[1]!, 10) / 60
		const num = parseFloat(s)
		if (!isNaN(num) && num > 0) return num
		return null
	}

	function commitEdit() {
		if (!editing) return
		if (editing === 'start') {
			const t = parseTime(editValue)
			if (t !== null) start = snap(clamp(t, 0, end - 0.25))
		} else if (editing === 'end') {
			const t = parseTime(editValue)
			if (t !== null) end = snap(clamp(t, start + 0.25, 24))
		} else {
			const d = parseDuration(editValue)
			if (d !== null && d > 0) end = snap(clamp(start + d, start + 0.25, 24))
		}
		editing = null
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
		if (e.key === 'Escape') { editing = null }
	}
</script>

<div class="tr">
	<div class="tr__times">
		{#if editing === 'start'}
			<!-- svelte-ignore a11y_autofocus -->
			<input class="tr__input" type="text" bind:value={editValue} onblur={commitEdit} onkeydown={onKeydown} autofocus />
		{:else}
			<button type="button" class="tr__time" onclick={() => beginEdit('start')}>{ft(start)}</button>
		{/if}
		<span class="tr__line"></span>
		{#if editing === 'dur'}
			<!-- svelte-ignore a11y_autofocus -->
			<input class="tr__input tr__input--sm" type="text" bind:value={editValue} onblur={commitEdit} onkeydown={onKeydown} autofocus />
		{:else}
			<button type="button" class="tr__dur" onclick={() => beginEdit('dur')}>{fDur(duration)}</button>
		{/if}
		<span class="tr__line"></span>
		{#if editing === 'end'}
			<!-- svelte-ignore a11y_autofocus -->
			<input class="tr__input" type="text" bind:value={editValue} onblur={commitEdit} onkeydown={onKeydown} autofocus />
		{:else}
			<button type="button" class="tr__time" onclick={() => beginEdit('end')}>{ft(end)}</button>
		{/if}
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
	.tr__time { font-family: var(--font-display); font-size: 1.05rem; font-weight: 500; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; flex-shrink: 0; background: none; border: none; border-bottom: 1px dashed color-mix(in srgb, var(--text) 18%, transparent); color: var(--text); padding: 0 0.1rem; cursor: text; transition: border-color 150ms; }
	.tr__time:hover { border-color: color-mix(in srgb, var(--text) 40%, transparent); }
	.tr__line { flex: 1; height: 1px; background: color-mix(in srgb, var(--text) 12%, transparent); min-width: 0.5rem; }
	.tr__dur { font-size: 0.78rem; font-weight: 600; color: color-mix(in srgb, var(--text) 55%, transparent); flex-shrink: 0; background: none; border: none; border-bottom: 1px dashed color-mix(in srgb, var(--text) 12%, transparent); padding: 0 0.1rem; cursor: text; font: inherit; font-size: 0.78rem; font-weight: 600; transition: border-color 150ms; }
	.tr__dur:hover { border-color: color-mix(in srgb, var(--text) 35%, transparent); }
	.tr__input { font-family: var(--font-display); font-size: 1.05rem; font-weight: 500; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; background: color-mix(in srgb, var(--text) 6%, transparent); border: 1px solid color-mix(in srgb, #a78bfa 35%, transparent); border-radius: 0.3rem; color: var(--text); padding: 0.1rem 0.3rem; width: 5rem; outline: none; }
	.tr__input--sm { font-size: 0.78rem; width: 3.5rem; font-family: inherit; }
	.tr__wx { display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 500; color: color-mix(in srgb, var(--text) 55%, transparent); font-variant-numeric: tabular-nums; }
	.tr__wx--end { text-align: right; }
	.tr__rain { color: #60a5fa; }
</style>
