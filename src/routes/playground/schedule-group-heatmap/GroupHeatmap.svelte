<script lang="ts">
	import type { GroupDay, GroupPerson } from './types'

	let {
		days,
		people,
		hourStart,
		hourEnd,
		slotLen,
		selected = $bindable<string | null>(null)
	}: {
		days: GroupDay[]
		people: GroupPerson[]
		hourStart: number
		hourEnd: number
		slotLen: number
		selected?: string | null
	} = $props()

	const slotMinutes = $derived(
		Array.from({ length: ((hourEnd - hourStart) * 60) / slotLen }, (_, i) => hourStart * 60 + i * slotLen)
	)

	function fmtSlot(min: number) {
		const h24 = Math.floor(min / 60)
		const m = min % 60
		const h12 = h24 % 12 === 0 ? 12 : h24 % 12
		const ampm = h24 < 12 || h24 === 24 ? 'am' : 'pm'
		return `${h12}:${m.toString().padStart(2, '0')}${ampm}`
	}

	function slotKey(dayId: string, min: number) {
		return `${dayId}:${min}`
	}

	function availableNames(dayId: string, min: number): string[] {
		const key = slotKey(dayId, min)
		return people.filter((p) => p.availableSlots.includes(key)).map((p) => p.name)
	}

	function intensity(dayId: string, min: number): number {
		return availableNames(dayId, min).length / people.length
	}

	function intensityClass(i: number) {
		if (i === 0) return 'gh__cell--l0'
		if (i < 0.34) return 'gh__cell--l1'
		if (i < 0.6) return 'gh__cell--l2'
		if (i < 0.85) return 'gh__cell--l3'
		return 'gh__cell--l4'
	}

	const bestSlot = $derived.by(() => {
		let best: { key: string; count: number; dayId: string; min: number } | null = null
		for (const d of days) {
			for (const m of slotMinutes) {
				const count = availableNames(d.id, m).length
				if (!best || count > best.count) {
					best = { key: slotKey(d.id, m), count, dayId: d.id, min: m }
				}
			}
		}
		return best
	})
</script>

<div class="gh">
	<div class="gh__legend">
		<span class="gh__legend-label">Fewer free</span>
		<span class="gh__legend-swatch gh__cell--l0"></span>
		<span class="gh__legend-swatch gh__cell--l1"></span>
		<span class="gh__legend-swatch gh__cell--l2"></span>
		<span class="gh__legend-swatch gh__cell--l3"></span>
		<span class="gh__legend-swatch gh__cell--l4"></span>
		<span class="gh__legend-label">All free</span>
	</div>

	<div class="gh__grid" style="--gh-cols: {days.length};">
		<div class="gh__corner" aria-hidden="true"></div>
		{#each days as day}
			<div class="gh__head">
				<span class="gh__head-day">{day.label}</span>
				<span class="gh__head-date">{day.dateLabel}</span>
			</div>
		{/each}

		{#each slotMinutes as min}
			<div class="gh__time">{fmtSlot(min)}</div>
			{#each days as day (day.id)}
				{@const key = slotKey(day.id, min)}
				{@const names = availableNames(day.id, min)}
				{@const i = intensity(day.id, min)}
				<button
					type="button"
					class="gh__cell {intensityClass(i)}"
					class:gh__cell--on={selected === key}
					class:gh__cell--best={bestSlot && bestSlot.key === key}
					title="{names.length} of {people.length} free{names.length ? ': ' + names.join(', ') : ''}"
					aria-label="{day.dayLabel} {fmtSlot(min)} — {names.length} of {people.length} free"
					onclick={() => (selected = selected === key ? null : key)}
				>
					{#if names.length > 0}<span class="gh__cell-num">{names.length}</span>{/if}
				</button>
			{/each}
		{/each}
	</div>

	<div class="gh__people">
		{#each people as p}
			<span class="gh__person">
				<span class="gh__person-dot" style="background:{p.color};"></span>
				{p.name}
			</span>
		{/each}
	</div>
</div>

<style>
	.gh {
		display: grid;
		gap: 0.85rem;
	}
	.gh__legend {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.7rem;
		color: color-mix(in srgb, var(--text) 55%, transparent);
		justify-self: end;
	}
	.gh__legend-swatch {
		width: 0.9rem;
		height: 0.9rem;
		border-radius: 0.2rem;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
	}
	.gh__grid {
		display: grid;
		grid-template-columns: 4.5rem repeat(var(--gh-cols), 1fr);
		gap: 1px;
		background: color-mix(in srgb, var(--text) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		border-radius: 0.625rem;
		overflow: hidden;
	}
	.gh__corner,
	.gh__head,
	.gh__time {
		background: var(--admin-card-bg);
		padding: 0.4rem 0.5rem;
		font-size: 0.7rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.gh__head {
		flex-direction: column;
		gap: 0.05rem;
		padding: 0.5rem 0.4rem;
	}
	.gh__head-day {
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--text);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.gh__head-date {
		font-size: 0.62rem;
		color: color-mix(in srgb, var(--text) 50%, transparent);
	}
	.gh__time {
		justify-content: flex-end;
		font-variant-numeric: tabular-nums;
		font-size: 0.62rem;
	}
	.gh__cell {
		position: relative;
		min-height: 1.95rem;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
		transition: outline 100ms, transform 140ms;
	}
	.gh__cell:hover {
		outline: 2px solid color-mix(in srgb, var(--book-accent) 60%, transparent);
		outline-offset: -2px;
		z-index: 1;
	}
	.gh__cell--on {
		outline: 2px solid var(--book-accent);
		outline-offset: -2px;
		z-index: 2;
	}
	.gh__cell--best::after {
		content: '★';
		position: absolute;
		top: 1px;
		right: 3px;
		font-size: 0.55rem;
		color: var(--playground-highlight);
		text-shadow: 0 0 2px color-mix(in srgb, var(--text) 35%, transparent);
		pointer-events: none;
	}
	.gh__cell-num {
		display: inline-block;
		font-size: 0.62rem;
		font-weight: 700;
		color: color-mix(in srgb, var(--text) 78%, transparent);
		padding: 0 0.25rem;
	}
	.gh__cell--l0 { background: color-mix(in srgb, var(--text) 4%, var(--admin-card-bg)); }
	.gh__cell--l1 { background: color-mix(in srgb, var(--book-accent) 14%, var(--admin-card-bg)); }
	.gh__cell--l2 { background: color-mix(in srgb, var(--book-accent) 28%, var(--admin-card-bg)); }
	.gh__cell--l3 { background: color-mix(in srgb, var(--book-accent) 50%, var(--admin-card-bg)); }
	.gh__cell--l4 { background: color-mix(in srgb, var(--book-accent) 78%, var(--admin-card-bg)); color: #fff; }
	.gh__cell--l4 .gh__cell-num { color: #fff; }
	.gh__people {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
		font-size: 0.78rem;
		color: color-mix(in srgb, var(--text) 70%, transparent);
	}
	.gh__person {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.gh__person-dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 999px;
	}
</style>
