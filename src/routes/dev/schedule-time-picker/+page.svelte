<script lang="ts">
	import { ArrowRight, GripVertical } from '@lucide/svelte'
	import DevBreadcrumb from '../DevBreadcrumb.svelte'
	import { Hero, PageShell, PillButton } from '@miko/ui'

	const SNAP = 0.25
	const MIN_DUR = 0.5
	const SUNRISE = 6.75
	const SUNSET = 18.25
	const HOURS = [0, 3, 6, 9, 12, 15, 18, 21, 24]
	const OTHERS = [
		{ name: 'Jen', color: '#d4748c' },
		{ name: 'Tyler', color: '#d8944a' }
	]
	const QUICK_DURATIONS = [0.5, 1, 1.5, 2, 3, 4]

	type DragTarget = 'start' | 'end' | 'range' | null

	let start = $state(12)
	let end = $state(14)
	let dragging = $state<DragTarget>(null)
	let confirmed = $state(false)
	let trackEl = $state<HTMLDivElement | null>(null)
	let dragOffset = 0

	const duration = $derived(end - start)
	const isDaylight = $derived(start >= SUNRISE && end <= SUNSET)
	const isNight = $derived(end <= SUNRISE || start >= SUNSET)
	const lightHint = $derived.by(() => {
		if (isDaylight) return { icon: '☀️', label: 'Daytime', color: '#d4a85a' }
		if (isNight) return { icon: '🌙', label: 'Nighttime', color: '#6a7ab0' }
		return { icon: '🌤', label: 'Partial daylight', color: '#b08a5a' }
	})

	function ft(h: number) {
		const hr = Math.floor(h) % 24
		const min = Math.round((h - Math.floor(h)) * 60)
		const sfx = hr >= 12 ? 'pm' : 'am'
		const display = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr
		return min === 0 ? `${display} ${sfx}` : `${display}:${String(min).padStart(2, '0')} ${sfx}`
	}

	function fDur(d: number) {
		const h = Math.floor(d)
		const m = Math.round((d - h) * 60)
		if (h === 0) return `${m}m`
		if (m === 0) return h === 1 ? '1 hr' : `${h} hrs`
		return `${h}h ${m}m`
	}

	function snap(v: number) {
		return Math.round(v / SNAP) * SNAP
	}

	function clamp(v: number, lo: number, hi: number) {
		return Math.max(lo, Math.min(hi, v))
	}

	function pct(h: number) {
		return (h / 24) * 100
	}

	function getHour(clientX: number) {
		if (!trackEl) return 0
		const rect = trackEl.getBoundingClientRect()
		return snap(clamp(((clientX - rect.left) / rect.width) * 24, 0, 24))
	}

	function onDown(event: PointerEvent, type: Exclude<DragTarget, null>) {
		event.preventDefault()
		event.stopPropagation()
		dragging = type
		if (type === 'range') {
			dragOffset = getHour(event.clientX) - start
		}
		;(event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId)
	}

	function onMove(event: PointerEvent) {
		if (!dragging) return
		const hour = getHour(event.clientX)
		if (dragging === 'start') {
			start = snap(clamp(hour, 0, end - MIN_DUR))
			return
		}
	if (dragging === 'end') {
		end = snap(clamp(hour, start + MIN_DUR, 24))
		return
	}

	const currentDuration = end - start
	let nextStart = snap(hour - dragOffset)
	nextStart = clamp(nextStart, 0, 24 - currentDuration)
	start = nextStart
	end = nextStart + currentDuration
	}

	function onUp() {
		dragging = null
	}

	function selectDuration(nextDuration: number) {
		if (start + nextDuration <= 24) {
			end = start + nextDuration
		}
	}

	function hourLabel(hour: number) {
		if (hour === 0 || hour === 24) return '12a'
		if (hour === 6) return '6a'
		if (hour === 12) return 'Noon'
		if (hour === 18) return '6p'
		return hour < 12 ? `${hour}a` : `${hour - 12}p`
	}
</script>

<svelte:head>
	<title>Schedule Time Picker - Dev - MIKO.ART</title>
</svelte:head>

<svelte:window onpointermove={onMove} onpointerup={onUp} />

<PageShell className="schedule-time-picker">
	<div class="schedule-time-picker__inner">
		<DevBreadcrumb />
		<Hero
			eyebrow="Dev"
			title="Time Picker"
			icon="/media/page-icons/labs-flask.png"
			iconAlt="Flask"
			subtitle="Drag a time window across the day with weather and daylight cues."
			compact
		/>
		<nav class="schedule-time-picker__versions">
			<a href="/dev/schedule-time-picker/" aria-current="page">v1</a>
			<a href="/dev/schedule-time-picker-v2/">v2</a>
			<a href="/dev/schedule-time-picker-v3/">v3</a>
			<a href="/dev/schedule-time-picker-v4/">v4</a><a href="/dev/schedule-time-picker-v5/">v5</a>
		</nav>

		<div class="schedule-time-picker__frame">
			<div class="schedule-time-picker__header">
				<div>
					<p class="schedule-time-picker__weekday">Friday</p>
					<h2 class="schedule-time-picker__date">February 27</h2>
					<p class="schedule-time-picker__sun-meta">
						Sunrise {ft(SUNRISE)} · Sunset {ft(SUNSET)} · {fDur(SUNSET - SUNRISE)} daylight
					</p>
				</div>
			</div>

			{#if confirmed}
				<div class="schedule-time-picker__confirmed">
					<div class="schedule-time-picker__confirmed-card">
						<div class="schedule-time-picker__confirmed-badge">✓</div>
						<div>
							<p class="schedule-time-picker__confirmed-label">You're booked</p>
							<h3>{ft(start)} - {ft(end)}</h3>
							<p>{fDur(duration)} · Friday, February 27</p>
						</div>
					</div>

					{#if OTHERS.length > 0}
						<div class="schedule-time-picker__others">
							<span>Also training:</span>
							{#each OTHERS as other}
								<div class="schedule-time-picker__other-pill">
									<span class="schedule-time-picker__avatar" style={`--avatar:${other.color};`}>
										{other.name[0]}
									</span>
									{other.name}
								</div>
							{/each}
						</div>
					{/if}

					<PillButton className="schedule-time-picker__secondary" type="button" variant="secondary" size="lg" onClick={() => (confirmed = false)}>
						Change Time
					</PillButton>
				</div>
			{:else}
				<div class="schedule-time-picker__picker">
					<div class="schedule-time-picker__selection">
						<h3>{ft(start)} - {ft(end)}</h3>
						<div class="schedule-time-picker__selection-meta">
							<span>{fDur(duration)}</span>
							<span class="schedule-time-picker__dot"></span>
							<span class="schedule-time-picker__light" style={`--light:${lightHint.color};`}>
								{lightHint.icon} {lightHint.label}
							</span>
						</div>
					</div>

					<div class="schedule-time-picker__track-wrap">
						<div class="schedule-time-picker__track" bind:this={trackEl}>
							<div class="schedule-time-picker__sky schedule-time-picker__sky--base"></div>
							<div class="schedule-time-picker__sky schedule-time-picker__sky--predawn" style={`left:${pct(SUNRISE - 1.5)}%; width:${pct(2)}%;`}></div>
							<div class="schedule-time-picker__sky schedule-time-picker__sky--sunrise" style={`left:${pct(SUNRISE - 0.25)}%; width:${pct(1.25)}%;`}></div>
							<div class="schedule-time-picker__sky schedule-time-picker__sky--day" style={`left:${pct(SUNRISE + 0.5)}%; width:${pct(SUNSET - SUNRISE - 1)}%;`}></div>
							<div class="schedule-time-picker__sky schedule-time-picker__sky--midday" style={`left:${pct(10)}%; width:${pct(4)}%;`}></div>
							<div class="schedule-time-picker__sky schedule-time-picker__sky--sunset" style={`left:${pct(SUNSET - 0.75)}%; width:${pct(2.25)}%;`}></div>

							<div class="schedule-time-picker__line schedule-time-picker__line--sunrise" style={`left:${pct(SUNRISE)}%;`}></div>
							<div class="schedule-time-picker__line schedule-time-picker__line--sunset" style={`left:${pct(SUNSET)}%;`}></div>
							<div class="schedule-time-picker__emoji" style={`left:${pct(SUNRISE)}%;`}>🌅</div>
							<div class="schedule-time-picker__emoji schedule-time-picker__emoji--midday" style={`left:${pct(12)}%;`}>☀️</div>
							<div class="schedule-time-picker__emoji" style={`left:${pct(SUNSET)}%;`}>🌇</div>
							<div class="schedule-time-picker__emoji" style={`left:${pct(2)}%;`}>🌙</div>

							{#each HOURS.slice(1, -1) as hour}
								<div class="schedule-time-picker__gridline" style={`left:${pct(hour)}%;`}></div>
							{/each}

							{#each [1, 2.5, 4, 20.5, 22, 23.2] as hour, index}
								<div
									class="schedule-time-picker__star"
									style={`left:${pct(hour)}%; top:${20 + (index * 19) % 45}%; opacity:${0.1 + (index % 3) * 0.06};`}
								></div>
							{/each}

							{#each [0.5, 3.2, 21.5, 23.8] as hour, index}
								<div
									class="schedule-time-picker__star schedule-time-picker__star--small"
									style={`left:${pct(hour)}%; top:${30 + (index * 23) % 35}%;`}
								></div>
							{/each}

							<button
								type="button"
								class="schedule-time-picker__range"
								style={`left:${pct(start)}%; width:${pct(end) - pct(start)}%;`}
								onpointerdown={(event) => onDown(event, 'range')}
								aria-label={`Selected range ${ft(start)} to ${ft(end)}`}
							>
								<span>{fDur(duration)}</span>
							</button>

							<button
								type="button"
								class="schedule-time-picker__handle"
								style={`left:${pct(start)}%;`}
								onpointerdown={(event) => onDown(event, 'start')}
								aria-label={`Adjust start time from ${ft(start)}`}
							>
								<GripVertical size={12} strokeWidth={2.4} aria-hidden="true" />
							</button>
							<button
								type="button"
								class="schedule-time-picker__handle"
								style={`left:${pct(end)}%;`}
								onpointerdown={(event) => onDown(event, 'end')}
								aria-label={`Adjust end time from ${ft(end)}`}
							>
								<GripVertical size={12} strokeWidth={2.4} aria-hidden="true" />
							</button>
						</div>

						<div class="schedule-time-picker__value-label schedule-time-picker__value-label--start" style={`left:${pct(start)}%;`}>
							{ft(start)}
						</div>
						<div class="schedule-time-picker__value-label schedule-time-picker__value-label--end" style={`left:${pct(end)}%;`}>
							{ft(end)}
						</div>
					</div>

					<div class="schedule-time-picker__axis">
						{#each HOURS as hour}
							<span
								class="schedule-time-picker__axis-label"
								style={`left:${pct(hour === 24 ? 23.95 : hour)}%;`}
								data-edge={hour === 0 ? 'start' : hour === 24 ? 'end' : 'mid'}
							>
								{hourLabel(hour)}
							</span>
						{/each}
					</div>

					<div class="schedule-time-picker__durations">
						{#each QUICK_DURATIONS as value}
							<button
								type="button"
								class={`schedule-time-picker__duration ${Math.abs(duration - value) < 0.01 ? 'schedule-time-picker__duration--active' : ''}`}
								disabled={start + value > 24}
								onclick={() => selectDuration(value)}
							>
								{fDur(value)}
							</button>
						{/each}
					</div>

					<PillButton className="schedule-time-picker__confirm" type="button" variant="primary" size="lg" onClick={() => (confirmed = true)}>
						Confirm
						<ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
					</PillButton>

					{#if OTHERS.length > 0}
						<div class="schedule-time-picker__others schedule-time-picker__others--footer">
							<span>Also training this day:</span>
							{#each OTHERS as other}
								<div class="schedule-time-picker__other-pill">
									<span class="schedule-time-picker__avatar" style={`--avatar:${other.color};`}>
										{other.name[0]}
									</span>
									{other.name}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</PageShell>

<style lang="scss">
	.schedule-time-picker__versions { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem; }
	.schedule-time-picker__versions a { font-size: 0.72rem; font-weight: 600; color: color-mix(in srgb, var(--text) 45%, transparent); text-decoration: none; padding: 0.2rem 0.5rem; border-radius: 0.3rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); }
	.schedule-time-picker__versions a:hover { color: var(--text); border-color: color-mix(in srgb, var(--text) 25%, transparent); }
	.schedule-time-picker__versions a[aria-current="page"] { color: #a78bfa; border-color: color-mix(in srgb, #a78bfa 30%, transparent); background: color-mix(in srgb, #a78bfa 6%, transparent); }

	.schedule-time-picker__frame {
		max-width: 34rem;
		margin: 0 auto;
		padding: clamp(1.5rem, 3vw, 2rem);
		border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
		border-radius: 1.25rem;
		background:
			radial-gradient(circle at top, color-mix(in srgb, #3b82f6 8%, transparent), transparent 32%),
			linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 84%, transparent), color-mix(in srgb, var(--bg) 92%, transparent));
		box-shadow: 0 24px 64px color-mix(in srgb, var(--text) 8%, transparent);
	}

	.schedule-time-picker__header {
		margin-bottom: 2rem;
	}

	.schedule-time-picker__weekday {
		margin: 0 0 0.35rem;
		font-size: 0.72rem;
		font-weight: 650;
		color: color-mix(in srgb, var(--muted) 95%, var(--text));
		text-transform: uppercase;
		letter-spacing: 0.11em;
	}

	.schedule-time-picker__date {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(2rem, 5vw, 2.6rem);
		line-height: 0.98;
		letter-spacing: -0.045em;
	}

	.schedule-time-picker__sun-meta {
		margin: 0.55rem 0 0;
		font-size: 0.85rem;
		color: color-mix(in srgb, var(--muted) 88%, var(--text));
	}

	.schedule-time-picker__picker,
	.schedule-time-picker__confirmed {
		animation: schedule-time-picker-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.schedule-time-picker__selection h3 {
		margin: 0;
		font-size: clamp(2rem, 6vw, 2.5rem);
		line-height: 0.98;
		letter-spacing: -0.045em;
		font-family: var(--font-display);
	}

	.schedule-time-picker__selection-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
		font-size: 0.88rem;
		color: #666;
	}

	.schedule-time-picker__dot {
		width: 0.2rem;
		height: 0.2rem;
		border-radius: 999px;
		background: #333;
	}

	.schedule-time-picker__light {
		color: var(--light);
		font-size: 0.8rem;
		font-weight: 650;
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
	}

	.schedule-time-picker__track-wrap {
		position: relative;
		margin-top: 1.5rem;
		margin-bottom: 2rem;
		padding-bottom: 1.7rem;
	}

	.schedule-time-picker__track {
		position: relative;
		height: 3.5rem;
		border-radius: 0.85rem;
		border: 1px solid #1a1c24;
		overflow: visible;
		cursor: default;
		touch-action: none;
	}

	.schedule-time-picker__sky {
		position: absolute;
		top: 0;
		bottom: 0;
	}

	.schedule-time-picker__sky--base {
		inset: 0;
		background: #080a14;
		border-radius: inherit;
	}

	.schedule-time-picker__sky--predawn {
		background: linear-gradient(90deg, transparent, #1a1228, #2d1f3d, #4a2a4a);
		opacity: 0.6;
	}

	.schedule-time-picker__sky--sunrise {
		background: linear-gradient(90deg, #4a2a4a, #8b4a3a, #c4794a, #d4944a);
		opacity: 0.45;
	}

	.schedule-time-picker__sky--day {
		background: linear-gradient(180deg, #1a2a4a 0%, #162040 50%, #141c38 100%);
		opacity: 0.6;
	}

	.schedule-time-picker__sky--midday {
		background: radial-gradient(ellipse at center, #2a3a5a30 0%, transparent 100%);
	}

	.schedule-time-picker__sky--sunset {
		background: linear-gradient(90deg, #c4794a, #8b4a3a, #4a2a4a, #1a1228, transparent);
		opacity: 0.45;
	}

	.schedule-time-picker__gridline,
	.schedule-time-picker__line {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
	}

	.schedule-time-picker__gridline {
		background: #ffffff08;
		z-index: 2;
	}

	.schedule-time-picker__line--sunrise,
	.schedule-time-picker__line--sunset {
		background: #c4794a30;
		z-index: 3;
	}

	.schedule-time-picker__emoji {
		position: absolute;
		top: -0.1rem;
		transform: translateX(-50%);
		z-index: 5;
		pointer-events: none;
		font-size: 0.62rem;
	}

	.schedule-time-picker__emoji--midday {
		font-size: 0.85rem;
		filter: drop-shadow(0 0 4px rgba(255, 200, 50, 0.3));
	}

	.schedule-time-picker__star {
		position: absolute;
		width: 1.5px;
		height: 1.5px;
		border-radius: 999px;
		background: white;
	}

	.schedule-time-picker__star--small {
		width: 1px;
		height: 1px;
		opacity: 0.06;
	}

	.schedule-time-picker__range {
		position: absolute;
		top: 0.25rem;
		bottom: 0.25rem;
		padding: 0;
		border-radius: 0.55rem;
		background: linear-gradient(135deg, #a78bfa10, #818cf810);
		border: 1.5px solid #a78bfa38;
		cursor: grab;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		font: inherit;
	}

	.schedule-time-picker__range span {
		font-size: 0.68rem;
		font-weight: 700;
		color: #c4b5fd;
		pointer-events: none;
		user-select: none;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
	}

	.schedule-time-picker__handle {
		position: absolute;
		top: 50%;
		padding: 0;
		width: 1.15rem;
		height: 1.15rem;
		border-radius: 999px;
		background: #14161e;
		border: 2px solid #a78bfa;
		cursor: ew-resize;
		transform: translate(-50%, -50%);
		z-index: 20;
		box-shadow: 0 2px 8px rgba(167, 139, 250, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		font: inherit;
	}

	.schedule-time-picker__handle :global(svg) {
		color: #a78bfa;
	}

	.schedule-time-picker__value-label {
		position: absolute;
		top: calc(100% - 0.25rem);
		transform: translateX(-50%);
		font-size: 0.68rem;
		font-weight: 650;
		color: #a78bfa;
		white-space: nowrap;
		pointer-events: none;
	}

	.schedule-time-picker__axis {
		position: relative;
		height: 1rem;
		margin-top: 0.35rem;
	}

	.schedule-time-picker__axis-label {
		position: absolute;
		font-size: 0.58rem;
		color: #444;
		font-weight: 500;
		white-space: nowrap;
	}

	.schedule-time-picker__axis-label[data-edge='start'] {
		transform: none;
	}

	.schedule-time-picker__axis-label[data-edge='mid'] {
		transform: translateX(-50%);
		text-align: center;
	}

	.schedule-time-picker__axis-label[data-edge='end'] {
		transform: translateX(-100%);
		text-align: right;
	}

	.schedule-time-picker__durations {
		display: flex;
		gap: 0.35rem;
		flex-wrap: wrap;
		margin: 1.4rem 0 1.7rem;
	}

	.schedule-time-picker__duration {
		padding: 0.45rem 0.9rem;
		border-radius: 0.6rem;
		border: 1.5px solid #1a1c24;
		background: #10111a;
		color: #777;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s;
	}

	.schedule-time-picker__duration:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.schedule-time-picker__duration--active {
		border-color: #a78bfa30;
		background: #a78bfa08;
		color: #c4b5fd;
	}

	.schedule-time-picker__confirm,
	.schedule-time-picker__secondary {
		width: 100%;
		justify-content: center;
	}

	.schedule-time-picker__others {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		flex-wrap: wrap;
	}

	.schedule-time-picker__others span:first-child {
		font-size: 0.72rem;
		color: #3a3a44;
	}

	.schedule-time-picker__others--footer {
		margin-top: 1.2rem;
		justify-content: center;
	}

	.schedule-time-picker__other-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.72rem;
		color: #555;
		font-weight: 500;
	}

	.schedule-time-picker__avatar {
		width: 0.95rem;
		height: 0.95rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--avatar) 14%, transparent);
		color: var(--avatar);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.38rem;
		font-weight: 700;
		border: 1px solid color-mix(in srgb, var(--avatar) 25%, transparent);
		flex-shrink: 0;
	}

	.schedule-time-picker__confirmed-card {
		display: flex;
		align-items: flex-start;
		gap: 0.9rem;
		padding: 1.5rem 1.3rem;
		background: #3cbf8a06;
		border: 1px solid #3cbf8a18;
		border-radius: 1.1rem;
		margin-bottom: 1rem;
	}

	.schedule-time-picker__confirmed-badge {
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		background: #3cbf8a10;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #3cbf8a;
		font-size: 0.9rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	.schedule-time-picker__confirmed-label {
		margin: 0 0 0.2rem;
		font-size: 0.68rem;
		font-weight: 650;
		color: #3cbf8a80;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.schedule-time-picker__confirmed h3 {
		margin: 0;
		font-size: 1.9rem;
		font-weight: 700;
		color: #3cbf8a;
		letter-spacing: -0.03em;
		font-family: var(--font-display);
	}

	.schedule-time-picker__confirmed p:last-child {
		margin: 0.45rem 0 0;
		font-size: 0.85rem;
		color: #3cbf8a50;
	}

	@keyframes schedule-time-picker-slide-up {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 40rem) {
		.schedule-time-picker__frame {
			padding: 1.15rem;
		}

		.schedule-time-picker__selection h3 {
			font-size: 1.85rem;
		}
	}
</style>
