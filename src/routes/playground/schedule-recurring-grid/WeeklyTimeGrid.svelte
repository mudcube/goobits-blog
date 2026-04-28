<script lang="ts">
	import type { RecurringSlot } from './+page.server'

	let {
		slots,
		hourStart = 6,
		hourEnd = 21,
		mode = 'browse',
		selectedId = $bindable<string | null>(null),
		onAddSlot
	}: {
		slots: RecurringSlot[]
		hourStart?: number
		hourEnd?: number
		mode?: 'browse' | 'author'
		selectedId?: string | null
		onAddSlot?: (day: number, startMin: number) => void
	} = $props()

	const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

	const totalHours = $derived(hourEnd - hourStart)
	const totalMins = $derived(totalHours * 60)

	function fmtHour(h: number) {
		const h12 = h % 12 === 0 ? 12 : h % 12
		const ampm = h < 12 || h === 24 ? 'am' : 'pm'
		return `${h12}${ampm}`
	}

	function pickEmpty(day: number, e: MouseEvent) {
		if (mode !== 'author') return
		const target = e.currentTarget as HTMLElement
		const rect = target.getBoundingClientRect()
		const ratio = (e.clientY - rect.top) / rect.height
		const minutesIntoView = Math.round((ratio * totalMins) / 30) * 30
		const startMin = hourStart * 60 + minutesIntoView
		onAddSlot?.(day, startMin)
	}

	function topPct(slot: RecurringSlot) {
		return ((slot.startMin - hourStart * 60) / totalMins) * 100
	}

	function heightPct(slot: RecurringSlot) {
		return (slot.durationMin / totalMins) * 100
	}
</script>

<div class="wtg" style="--wtg-rows: {totalHours};">
	<div class="wtg__corner" aria-hidden="true"></div>
	{#each dayLabels as label}
		<div class="wtg__head">{label}</div>
	{/each}

	<div class="wtg__hours" aria-hidden="true">
		{#each Array.from({ length: totalHours + 1 }, (_, i) => hourStart + i) as h}
			<span class="wtg__hour">{fmtHour(h)}</span>
		{/each}
	</div>

	{#each dayLabels as _label, day}
		<div
			role="button"
			tabindex="0"
			class="wtg__col"
			class:wtg__col--author={mode === 'author'}
			aria-label="{mode === 'author' ? 'Add slot for' : 'Day'} {dayLabels[day]}"
			onclick={(e) => pickEmpty(day, e)}
			onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') pickEmpty(day, e as unknown as MouseEvent) }}
		>
			<div class="wtg__lines" aria-hidden="true">
				{#each Array.from({ length: totalHours }) as _line}
					<div class="wtg__line"></div>
				{/each}
			</div>
			{#each slots.filter((s) => s.day === day) as slot (slot.id)}
				<button
					type="button"
					class="wtg__slot"
					class:wtg__slot--on={selectedId === slot.id}
					style="top:{topPct(slot)}%; height:{heightPct(slot)}%; --c:{slot.color};"
					onclick={(e) => {
						e.stopPropagation()
						selectedId = selectedId === slot.id ? null : slot.id
					}}
				>
					<span class="wtg__slot-title">{slot.title}</span>
					<span class="wtg__slot-time">{Math.floor(slot.startMin / 60)}:{(slot.startMin % 60).toString().padStart(2, '0')}</span>
				</button>
			{/each}
		</div>
	{/each}
</div>

<style>
	.wtg {
		display: grid;
		grid-template-columns: 3rem repeat(7, 1fr);
		gap: 1px;
		background: color-mix(in srgb, var(--text) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		border-radius: 0.625rem;
		overflow: hidden;
	}
	.wtg__corner,
	.wtg__head {
		background: var(--admin-card-bg);
		padding: 0.45rem 0.4rem;
		font-size: 0.7rem;
		font-weight: 650;
		text-align: center;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.wtg__hours {
		grid-column: 1;
		grid-row: 2;
		background: var(--admin-card-bg);
		display: grid;
		grid-template-rows: repeat(calc(var(--wtg-rows) + 1), 1fr);
		padding: 0.2rem 0.3rem;
		font-variant-numeric: tabular-nums;
	}
	.wtg__hour {
		font-size: 0.6rem;
		color: color-mix(in srgb, var(--text) 42%, transparent);
		text-align: right;
		line-height: 1;
		transform: translateY(-0.4em);
	}
	.wtg__col {
		grid-row: 2;
		position: relative;
		background: var(--admin-card-bg);
		min-height: calc(var(--wtg-rows) * 2.4rem);
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: default;
	}
	.wtg__col--author {
		cursor: copy;
	}
	.wtg__col--author:hover {
		background: color-mix(in srgb, var(--book-accent) 4%, var(--admin-card-bg));
	}
	.wtg__lines {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-rows: repeat(var(--wtg-rows), 1fr);
		pointer-events: none;
	}
	.wtg__line + .wtg__line {
		border-top: 1px dashed color-mix(in srgb, var(--text) 8%, transparent);
	}
	.wtg__slot {
		position: absolute;
		left: 0.2rem;
		right: 0.2rem;
		background: color-mix(in srgb, var(--c) 22%, transparent);
		border: 1px solid color-mix(in srgb, var(--c) 60%, transparent);
		border-left: 3px solid var(--c);
		border-radius: 0.35rem;
		padding: 0.2rem 0.4rem;
		font: inherit;
		color: inherit;
		text-align: left;
		display: grid;
		gap: 0.05rem;
		cursor: pointer;
		transition: background 140ms, transform 140ms;
		overflow: hidden;
	}
	.wtg__slot:hover {
		background: color-mix(in srgb, var(--c) 32%, transparent);
		transform: translateY(-1px);
	}
	.wtg__slot--on {
		background: color-mix(in srgb, var(--c) 50%, transparent);
		box-shadow: 0 2px 12px color-mix(in srgb, var(--c) 35%, transparent);
	}
	.wtg__slot-title {
		font-size: 0.7rem;
		font-weight: 650;
		line-height: 1.15;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.wtg__slot-time {
		font-size: 0.6rem;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		font-variant-numeric: tabular-nums;
	}
</style>
