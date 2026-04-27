<script lang="ts">
	import { PageShell } from '@miko/ui'
	import { ft, formatDate } from '@calendar/ui'
	import type { Person } from '@calendar/ui'
	import DevHero from '../DevHero.svelte'

	const activity = { icon: '💪', label: 'Rainbow Gym' }
	const date = new Date('2026-06-12')
	const start = 14
	const end = 16
	const capacity = 8

	const overlapping: Person[] = [
		{ name: 'Alex', color: '#d4748c', start: 14, end: 16 },
		{ name: 'Sam', color: '#6bb5a0', start: 15, end: 17 },
	]

	const crewNames = overlapping.map(p => p.name).join(' & ')
	const tz = 'Pacific'

	/* --- Auto-detect calendar platform --- */
	function isApple() {
		if (typeof navigator === 'undefined') return false
		return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent)
	}

	function googleCalUrl() {
		const pad = (n: number) => String(n).padStart(2, '0')
		const y = date.getFullYear(); const m = pad(date.getMonth() + 1); const d = pad(date.getDate())
		const sh = pad(Math.floor(start)); const sm = pad(Math.round((start % 1) * 60))
		const eh = pad(Math.floor(end)); const em = pad(Math.round((end % 1) * 60))
		const dates = `${y}${m}${d}T${sh}${sm}00/${y}${m}${d}T${eh}${em}00`
		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(activity.label)}&dates=${dates}`
	}

	function downloadIcs() {
		const pad = (n: number) => String(n).padStart(2, '0')
		const y = date.getFullYear(); const m = pad(date.getMonth() + 1); const d = pad(date.getDate())
		const sh = pad(Math.floor(start)); const sm = pad(Math.round((start % 1) * 60))
		const eh = pad(Math.floor(end)); const em = pad(Math.round((end % 1) * 60))
		const tzId = Intl.DateTimeFormat().resolvedOptions().timeZone
		const dtStart = `${y}${m}${d}T${sh}${sm}00`
		const dtEnd = `${y}${m}${d}T${eh}${em}00`
		const uid = `${dtStart}-${Math.random().toString(36).slice(2, 8)}@miko.art`
		const ics = [
			'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//miko.art//book//EN',
			'BEGIN:VEVENT', `UID:${uid}`,
			`DTSTART;TZID=${tzId}:${dtStart}`, `DTEND;TZID=${tzId}:${dtEnd}`,
			`SUMMARY:${activity.label}`, 'DESCRIPTION:Booked via MIKO.ART',
			'END:VEVENT', 'END:VCALENDAR'
		].join('\r\n')
		const blob = new Blob([ics], { type: 'text/calendar' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url; a.download = 'gym-booking.ics'
		a.click(); URL.revokeObjectURL(url)
	}
</script>

<PageShell>
	<DevHero title="Book v4 — Card Stack" />

	<div class="v4">
		<div class="v4__stage">

			<div class="v4__header">
				<span class="v4__check">✓</span>
				<span class="v4__label">Locked in</span>
			</div>

			<div class="v4__card">
				<div class="v4__card-icon">{activity.icon}</div>
				<div class="v4__card-activity">{activity.label}</div>
				<div class="v4__card-rule"></div>
				<div class="v4__card-date">{formatDate(date)}</div>
				<div class="v4__card-time">{ft(start)} &rarr; {ft(end)}</div>

				<div class="v4__card-divider"></div>

				<div class="v4__crew">
					{#each overlapping as person}
						<div class="v4__crew-row">
							<span class="v4__crew-dot" style="background:{person.color}"></span>
							<span class="v4__crew-name">{person.name}</span>
							<span class="v4__crew-time">{ft(person.start)}–{ft(person.end)}</span>
						</div>
					{/each}
				</div>

				<button type="button" class="v4__cal-btn" onclick={() => isApple() ? downloadIcs() : window.open(googleCalUrl(), '_blank')}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="16" y1="2" x2="16" y2="6"></line>
						<line x1="8" y1="2" x2="8" y2="6"></line>
						<line x1="3" y1="10" x2="21" y2="10"></line>
					</svg>
					Add to Calendar
				</button>
			</div>

			<div class="v4__footer">
				<button type="button" class="v4__link" onclick={() => alert('← different day')}>
					&larr; different day
				</button>
				<button type="button" class="v4__link" onclick={() => alert('edit →')}>
					edit &rarr;
				</button>
			</div>

		</div>
	</div>
</PageShell>

<style>
	.v4 {
		display: flex;
		justify-content: center;
		padding: 2rem 1rem 4rem;
	}

	.v4__stage {
		width: 100%;
		max-width: 340px;
		animation: v4-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes v4-in {
		from { opacity: 0; transform: translateY(12px) scale(0.97); }
		to   { opacity: 1; transform: translateY(0) scale(1); }
	}

	.v4__header {
		text-align: center;
		margin-bottom: 1.25rem;
		animation: v4-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
	}

	@keyframes v4-pop {
		from { opacity: 0; transform: scale(0.6); }
		to   { opacity: 1; transform: scale(1); }
	}

	.v4__check {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.6rem;
		height: 2.6rem;
		border-radius: 999px;
		background: rgba(74, 222, 128, 0.08);
		border: 1.5px solid rgba(74, 222, 128, 0.25);
		color: #4ade80;
		font-size: 1.1rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.v4__label {
		display: block;
		font-family: var(--font-display, Georgia);
		font-size: 1.4rem;
		font-weight: 500;
		letter-spacing: -0.03em;
		color: var(--text, #fff);
	}

	/* --- Card --- */
	.v4__card {
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 1rem;
		padding: 1.5rem 1.25rem;
		background: linear-gradient(170deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
		backdrop-filter: blur(12px);
		text-align: center;
		animation: v4-card 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
	}

	@keyframes v4-card {
		from { opacity: 0; transform: translateY(8px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.v4__card-icon {
		font-size: 2rem;
		line-height: 1;
		margin-bottom: 0.25rem;
	}

	.v4__card-activity {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.5);
		margin-bottom: 0.75rem;
	}

	.v4__card-rule {
		width: 2rem;
		height: 1px;
		background: rgba(255, 255, 255, 0.12);
		margin: 0 auto 0.75rem;
	}

	.v4__card-date {
		font-family: var(--font-display, Georgia);
		font-size: 1.05rem;
		font-weight: 400;
		letter-spacing: -0.01em;
		color: var(--text, #fff);
	}

	.v4__card-time {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.6);
		margin-top: 0.15rem;
	}

	/* --- Divider --- */
	.v4__card-divider {
		height: 1px;
		margin: 1rem -1.25rem;
		background: repeating-linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.1) 0,
			rgba(255, 255, 255, 0.1) 4px,
			transparent 4px,
			transparent 8px
		);
	}

	/* --- Crew --- */
	.v4__crew {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		margin-bottom: 1.1rem;
	}

	.v4__crew-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.78rem;
	}

	.v4__crew-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		flex-shrink: 0;
	}

	.v4__crew-name {
		color: rgba(255, 255, 255, 0.7);
		font-weight: 500;
	}

	.v4__crew-time {
		margin-left: auto;
		color: rgba(255, 255, 255, 0.35);
		font-variant-numeric: tabular-nums;
	}

	/* --- Calendar Button --- */
	.v4__cal-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.7rem;
		border: 1px solid rgba(167, 139, 250, 0.25);
		border-radius: 0.6rem;
		background: rgba(167, 139, 250, 0.08);
		color: #c4b5fd;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 180ms;
	}

	.v4__cal-btn:hover {
		background: rgba(167, 139, 250, 0.15);
		border-color: rgba(167, 139, 250, 0.4);
		color: #ddd6fe;
	}

	/* --- Footer --- */
	.v4__footer {
		display: flex;
		justify-content: space-between;
		margin-top: 0.85rem;
		animation: v4-fade 0.4s 0.3s both;
	}

	@keyframes v4-fade {
		from { opacity: 0; }
		to   { opacity: 1; }
	}

	.v4__link {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.35);
		font: inherit;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		padding: 0.4rem 0;
		transition: color 150ms;
	}

	.v4__link:hover {
		color: rgba(255, 255, 255, 0.65);
	}
</style>
