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
	<div class="tr__times">
		<span class="tr__time">{ft(start)}</span>
		<span class="tr__line"></span>
		<span class="tr__dur">{fDur(duration)}</span>
		<span class="tr__line"></span>
		<span class="tr__time tr__time--end">{ft(end)}</span>
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
	.tr__time { font-family: var(--font-display); font-size: 1.05rem; font-weight: 500; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; flex-shrink: 0; }
	.tr__time--end { margin-left: auto; }
	.tr__line { flex: 1; height: 1px; background: color-mix(in srgb, var(--text) 12%, transparent); min-width: 0.5rem; }
	.tr__dur { font-size: 0.78rem; font-weight: 600; color: color-mix(in srgb, var(--text) 55%, transparent); flex-shrink: 0; }
	.tr__wx { display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 500; color: color-mix(in srgb, var(--text) 55%, transparent); font-variant-numeric: tabular-nums; }
	.tr__wx--end { text-align: right; }
	.tr__rain { color: #60a5fa; }
</style>
