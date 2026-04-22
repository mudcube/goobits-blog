<script lang="ts">
	import { CloudRain } from '@lucide/svelte'
	import { createMockWeatherProvider, describeWeatherCode, isPrecipitation } from '$lib/app/weather'
	import TimePickerHero from '../schedule-time-picker-hero/TimePickerHero.svelte'
	import type { Person } from './types'
	import { ft, fDur } from './time'
	import SkyTrack from './SkyTrack.svelte'

	const weather = createMockWeatherProvider()
	let forceRainState = $state(false)
	const clearDay = weather.getDay('2026-04-22')!
	const rainyDay = weather.getDay('2026-04-20')!
	const day = $derived(forceRainState ? rainyDay : clearDay)

	const OTHERS: Person[] = [
		{ name: 'Jen', color: '#d4748c', start: 12, end: 14 },
		{ name: 'Tyler', color: '#d8944a', start: 13, end: 15 }
	]

	const HOURLY = $derived(day.hourly)
	const TEMP_HIGH = $derived(Math.max(...HOURLY.map((w) => w.temperature)))
	const hasAnyRain = $derived(HOURLY.some((w) => w.precipitation > 0))
	const daySummary = $derived(hasAnyRain ? 'Rain' : 'Dry')

	let start = $state(12)
	let end = $state(14)
	let confirmed = $state(false)

	const duration = $derived(end - start)
	const overlapping = $derived(OTHERS.filter((o) => o.start < end && o.end > start))
	const dayLabel = $derived(formatDayLabel(day.date))

	function formatDayLabel(date: string) {
		const value = new Date(`${date}T12:00:00`)
		return value
			.toLocaleDateString(undefined, {
				weekday: 'short',
				month: 'short',
				day: 'numeric'
			})
			.toUpperCase()
	}

	function weatherAt(hour: number) {
		const sorted = [...HOURLY].sort((a, b) => a.hour - b.hour)
		const lower = [...sorted].reverse().find((entry) => entry.hour <= hour) ?? sorted[0]
		const upper = sorted.find((entry) => entry.hour >= hour) ?? sorted[sorted.length - 1]

		if (!lower || !upper) return HOURLY[0]!
		if (lower.hour === upper.hour) return lower

		const ratio = (hour - lower.hour) / (upper.hour - lower.hour)
		return {
			...lower,
			temperature: Math.round(lower.temperature + (upper.temperature - lower.temperature) * ratio),
			precipitation: lower.precipitation + (upper.precipitation - lower.precipitation) * ratio,
			weatherCode: ratio < 0.5 ? lower.weatherCode : upper.weatherCode,
			windSpeed: lower.windSpeed + (upper.windSpeed - lower.windSpeed) * ratio,
			humidity: Math.round(lower.humidity + (upper.humidity - lower.humidity) * ratio)
		}
	}

	const wxStart = $derived(weatherAt(start))
	const wxEnd = $derived(weatherAt(end > start ? end - 0.25 : end))

	const peopleRows = $derived.by(() => {
		const rows: Person[][] = []
		for (const person of OTHERS) {
			let placed = false
			for (const row of rows) {
				if (!row.some((p) => p.start < person.end && p.end > person.start)) {
					row.push(person)
					placed = true
					break
				}
			}
			if (!placed) rows.push([person])
		}
		return rows
	})
</script>

<svelte:head><title>Time Picker v5 - Dev - MIKO.ART</title></svelte:head>

<TimePickerHero currentVersion="v5">
	{#snippet toolbar()}
		<button type="button" class="tp5__rain-btn" class:tp5__rain-btn--on={forceRainState} onclick={() => (forceRainState = !forceRainState)}>
			<CloudRain size={11} strokeWidth={2} /> {forceRainState ? 'Rain' : 'Dry'}
		</button>
	{/snippet}

	<div class="tp5__card">
		<p class="tp5__header">{dayLabel} · {TEMP_HIGH}° · {daySummary}</p>

		<SkyTrack
			sunrise={day.sunrise}
			sunset={day.sunset}
			hourly={HOURLY}
			hasRain={hasAnyRain}
			peopleRows={peopleRows}
			{overlapping}
			bind:start
			bind:end
		/>

		<div class="tp5__readout">
			<div class="tp5__readout-row1">
				<span class="tp5__r-left"><span class="tp5__r-time">{ft(start)}</span><span class="tp5__r-line"></span></span>
				<span class="tp5__r-dur">{fDur(duration)}</span>
				<span class="tp5__r-right"><span class="tp5__r-line"></span><span class="tp5__r-time">{ft(end)}</span></span>
			</div>
			<div class="tp5__readout-row2">
				<span class="tp5__r-wx" class:tp5__r-wx--rain={isPrecipitation(wxStart.weatherCode)}>{wxStart.temperature}° {describeWeatherCode(wxStart.weatherCode).toLowerCase()}</span>
				<span class="tp5__r-wx tp5__r-wx--end" class:tp5__r-wx--rain={isPrecipitation(wxEnd.weatherCode)}>{wxEnd.temperature}° {describeWeatherCode(wxEnd.weatherCode).toLowerCase()}</span>
			</div>
		</div>

		{#if OTHERS.length > 0}
			<div class="tp5__crew-card">
				{#each OTHERS as other}
					<div class="tp5__crew-row" class:tp5__crew-row--on={overlapping.includes(other)}>
						<span class="tp5__crew-dot" style="--c:{other.color};"></span>
						<span class="tp5__crew-name">{other.name}</span>
						<span class="tp5__crew-time">{ft(other.start)}–{ft(other.end)}</span>
					</div>
				{/each}
			</div>
		{/if}

		{#if !confirmed}
			<button type="button" class="tp5__confirm" onclick={() => (confirmed = true)}>
				<span>Confirm</span><span class="tp5__confirm-arrow">→</span>
			</button>
		{:else}
			<div class="tp5__set">
				<span class="tp5__set-check">✓</span>
				<span class="tp5__set-text">{ft(start)}–{ft(end)}</span>
				<button type="button" class="tp5__set-change" onclick={() => (confirmed = false)}>Change</button>
			</div>
		{/if}
	</div>
</TimePickerHero>

<style>
	.tp5__rain-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.5rem; border-radius: 0.3rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); background: transparent; color: color-mix(in srgb, var(--text) 45%, transparent); font: inherit; font-size: 0.68rem; font-weight: 600; cursor: pointer; }
	.tp5__rain-btn:hover { border-color: color-mix(in srgb, var(--text) 25%, transparent); color: var(--text); }
	.tp5__rain-btn--on { color: #60a5fa; border-color: color-mix(in srgb, #60a5fa 30%, transparent); background: color-mix(in srgb, #60a5fa 6%, transparent); }

	.tp5__card { padding: clamp(1rem, 2.5vw, 1.5rem); border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 1rem; background: linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 70%, transparent), color-mix(in srgb, var(--bg) 88%, transparent)); }
	.tp5__header { margin: 0 0 0.75rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: color-mix(in srgb, var(--text) 62%, transparent); }

	.tp5__readout { display: grid; gap: 0.2rem; margin-bottom: 0.6rem; }
	.tp5__readout-row1 { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 0.4rem; }
	.tp5__r-left, .tp5__r-right { display: flex; align-items: center; gap: 0.4rem; }
	.tp5__r-right { justify-content: flex-end; }
	.tp5__r-time { font-family: var(--font-display); font-size: 1.1rem; font-weight: 500; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; flex-shrink: 0; }
	.tp5__r-line { flex: 1; height: 1px; background: color-mix(in srgb, var(--text) 12%, transparent); min-width: 0.5rem; }
	.tp5__r-dur { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 60%, transparent); white-space: nowrap; text-align: center; }
	.tp5__readout-row2 { display: flex; justify-content: space-between; }
	.tp5__r-wx { font-size: 0.7rem; font-weight: 500; color: color-mix(in srgb, var(--text) 60%, transparent); font-variant-numeric: tabular-nums; }
	.tp5__r-wx--rain { color: #60a5fa; }
	.tp5__r-wx--end { text-align: right; }

	.tp5__crew-card { padding: 0.55rem 0.7rem; border: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-radius: 0.6rem; background: color-mix(in srgb, var(--card-bg) 50%, transparent); display: grid; gap: 0.25rem; margin-bottom: 0.5rem; }
	.tp5__crew-row { display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; color: color-mix(in srgb, var(--text) 52%, transparent); transition: color 150ms; }
	.tp5__crew-row--on { color: color-mix(in srgb, var(--text) 78%, transparent); }
	.tp5__crew-dot { width: 0.4rem; height: 0.4rem; border-radius: 999px; background: var(--c); opacity: 0.55; flex-shrink: 0; }
	.tp5__crew-row--on .tp5__crew-dot { opacity: 1; }
	.tp5__crew-name { font-weight: 600; }
	.tp5__crew-time { margin-left: auto; font-size: 0.62rem; font-variant-numeric: tabular-nums; color: color-mix(in srgb, var(--text) 42%, transparent); }
	.tp5__crew-row--on .tp5__crew-time { color: color-mix(in srgb, var(--text) 60%, transparent); }

	.tp5__confirm { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.5rem; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.4rem; background: transparent; color: var(--text); font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 160ms; }
	.tp5__confirm:hover { background: color-mix(in srgb, var(--text) 4%, transparent); border-color: color-mix(in srgb, var(--text) 20%, transparent); }
	.tp5__confirm-arrow { transition: transform 160ms; }
	.tp5__confirm:hover .tp5__confirm-arrow { transform: translateX(3px); }

	.tp5__set { display: flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.6rem; border: 1px solid color-mix(in srgb, #3cbf8a 20%, transparent); border-radius: 0.4rem; background: color-mix(in srgb, #3cbf8a 4%, transparent); animation: tp5-pop 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
	@keyframes tp5-pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
	.tp5__set-check { color: #3cbf8a; font-size: 0.82rem; font-weight: 700; }
	.tp5__set-text { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, #3cbf8a 70%, var(--text) 30%); font-variant-numeric: tabular-nums; }
	.tp5__set-change { margin-left: auto; padding: 0; border: none; background: none; font: inherit; font-size: 0.62rem; font-weight: 600; color: color-mix(in srgb, var(--text) 38%, transparent); cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
	.tp5__set-change:hover { color: color-mix(in srgb, var(--text) 58%, transparent); }

	@media (max-width: 30rem) { .tp5__card { padding: 0.85rem; } }
</style>
