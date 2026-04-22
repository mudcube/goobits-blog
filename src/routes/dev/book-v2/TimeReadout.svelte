<script lang="ts">
	import type { HourlyWeather } from '$lib/app/weather'
	import { describeWeatherCode, isPrecipitation } from '$lib/app/weather'
	import { ft, fDur } from './time'

	let {
		start,
		end,
		hourly,
	}: {
		start: number
		end: number
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
</script>

<div class="tr">
	<div class="tr__row1">
		<span class="tr__left"><span class="tr__time">{ft(start)}</span><span class="tr__line"></span></span>
		<span class="tr__dur">{fDur(duration)}</span>
		<span class="tr__right"><span class="tr__line"></span><span class="tr__time">{ft(end)}</span></span>
	</div>
	{#if wxS && wxE}
		<div class="tr__row2">
			<span class="tr__wx" class:tr__wx--rain={isPrecipitation(wxS.weatherCode)}>{wxS.temperature}° {describeWeatherCode(wxS.weatherCode).toLowerCase()}</span>
			<span class="tr__wx tr__wx--end" class:tr__wx--rain={isPrecipitation(wxE.weatherCode)}>{wxE.temperature}° {describeWeatherCode(wxE.weatherCode).toLowerCase()}</span>
		</div>
	{/if}
</div>

<style>
	.tr { display: grid; gap: 0.2rem; margin-top: 0.65rem; margin-bottom: 0.5rem; }
	.tr__row1 { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 0.4rem; }
	.tr__left, .tr__right { display: flex; align-items: center; gap: 0.4rem; }
	.tr__right { justify-content: flex-end; }
	.tr__time { font-family: var(--font-display); font-size: 1.1rem; font-weight: 500; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; flex-shrink: 0; }
	.tr__line { flex: 1; height: 1px; background: color-mix(in srgb, var(--text) 12%, transparent); min-width: 0.5rem; }
	.tr__dur { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 60%, transparent); white-space: nowrap; text-align: center; }
	.tr__row2 { display: flex; justify-content: space-between; }
	.tr__wx { font-size: 0.7rem; font-weight: 500; color: color-mix(in srgb, var(--text) 60%, transparent); font-variant-numeric: tabular-nums; }
	.tr__wx--rain { color: #60a5fa; }
	.tr__wx--end { text-align: right; }
</style>
