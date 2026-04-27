<script lang="ts">
	import { PageShell } from '@miko/ui'
	import { ft, formatDate } from '@calendar/ui'
	import type { Person } from '@calendar/ui'
	import DevHero from '../DevHero.svelte'

	const activity = { icon: '💪', label: 'Rainbow Gym' }
	const date = new Date('2026-06-12')
	const start = 14
	const end = 16

	const overlapping: Person[] = [
		{ name: 'Alex', color: '#d4748c', start: 14, end: 16 },
		{ name: 'Sam', color: '#6bb5a0', start: 15, end: 17 },
	]

	const crewNames = overlapping.map(p => p.name).join(', ')

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

	let calAdded = $state(false)

	function addToCal() {
		if (isApple()) {
			downloadIcs()
		} else {
			window.open(googleCalUrl(), '_blank')
		}
		calAdded = true
	}
</script>

<PageShell>
	<DevHero title="Book v5 — Minimal Toast" />

	<div class="v5">
		<div class="v5__stage">

			<div class="v5__mark">✓</div>
			<h2 class="v5__title">Booked.</h2>

			<p class="v5__detail">
				{formatDate(date)} &middot; {ft(start)}–{ft(end)}
			</p>

			{#if overlapping.length > 0}
				<p class="v5__crew">
					with {crewNames}
				</p>
			{/if}

			<div class="v5__spacer"></div>

			{#if !calAdded}
				<button type="button" class="v5__cal-btn" onclick={addToCal}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="16" y1="2" x2="16" y2="6"></line>
						<line x1="8" y1="2" x2="8" y2="6"></line>
						<line x1="3" y1="10" x2="21" y2="10"></line>
					</svg>
					Add to Calendar
				</button>
			{:else}
				<div class="v5__added">
					<span class="v5__added-check">✓</span> Added
				</div>
			{/if}

			<p class="v5__aside">or just show up.</p>

			<div class="v5__spacer v5__spacer--lg"></div>

			<button type="button" class="v5__back" onclick={() => alert('← back')}>
				&larr; change
			</button>

		</div>
	</div>
</PageShell>

<style>
	.v5 {
		display: flex;
		justify-content: center;
		padding: 3rem 1rem 5rem;
	}

	.v5__stage {
		width: 100%;
		max-width: 300px;
		text-align: center;
		animation: v5-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes v5-in {
		from { opacity: 0; transform: translateY(16px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	/* --- Checkmark --- */
	.v5__mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 999px;
		background: rgba(74, 222, 128, 0.06);
		border: 2px solid rgba(74, 222, 128, 0.2);
		color: #4ade80;
		font-size: 1.6rem;
		font-weight: 700;
		margin-bottom: 1rem;
		animation: v5-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
	}

	@keyframes v5-pop {
		from { transform: scale(0.4); opacity: 0; }
		60%  { transform: scale(1.08); }
		to   { transform: scale(1); opacity: 1; }
	}

	/* --- Title --- */
	.v5__title {
		margin: 0 0 0.85rem;
		font-family: var(--font-display, Georgia);
		font-size: 2rem;
		font-weight: 500;
		letter-spacing: -0.04em;
		color: var(--text, #fff);
		animation: v5-text 0.4s 0.2s both;
	}

	@keyframes v5-text {
		from { opacity: 0; transform: translateY(6px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	/* --- Details --- */
	.v5__detail {
		margin: 0;
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.55);
		animation: v5-text 0.4s 0.25s both;
	}

	.v5__crew {
		margin: 0.2rem 0 0;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.4);
		animation: v5-text 0.4s 0.3s both;
	}

	/* --- Spacers --- */
	.v5__spacer {
		height: 1.5rem;
	}

	.v5__spacer--lg {
		height: 2.5rem;
	}

	/* --- Calendar Button --- */
	.v5__cal-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.55rem;
		width: 100%;
		padding: 0.85rem 1.5rem;
		border: 1px solid rgba(167, 139, 250, 0.25);
		border-radius: 0.7rem;
		background: rgba(167, 139, 250, 0.08);
		color: #c4b5fd;
		font: inherit;
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 200ms;
		animation: v5-btn 0.4s 0.35s both;
	}

	@keyframes v5-btn {
		from { opacity: 0; transform: translateY(8px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.v5__cal-btn:hover {
		background: rgba(167, 139, 250, 0.15);
		border-color: rgba(167, 139, 250, 0.4);
		color: #ddd6fe;
		transform: translateY(-1px);
	}

	.v5__cal-btn:active {
		transform: translateY(0);
	}

	/* --- Added State --- */
	.v5__added {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.85rem 1.5rem;
		color: #4ade80;
		font-size: 0.88rem;
		font-weight: 600;
		animation: v5-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.v5__added-check {
		font-size: 1rem;
	}

	/* --- Aside --- */
	.v5__aside {
		margin: 0.65rem 0 0;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.22);
		font-style: italic;
		animation: v5-text 0.4s 0.45s both;
	}

	/* --- Back link --- */
	.v5__back {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.3);
		font: inherit;
		font-size: 0.78rem;
		font-weight: 500;
		cursor: pointer;
		padding: 0.4rem 0.8rem;
		transition: color 150ms;
		animation: v5-text 0.4s 0.5s both;
	}

	.v5__back:hover {
		color: rgba(255, 255, 255, 0.6);
	}
</style>
