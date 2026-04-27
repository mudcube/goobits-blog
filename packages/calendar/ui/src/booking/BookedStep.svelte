<script lang="ts">
	import { Calendar, Apple, Mail, Download } from '@lucide/svelte'
	import type { Person } from './types'
	import { ft, formatDate } from './time'
	import { getCalendarConfig } from '@calendar/core'
	import { onMount } from 'svelte'

	const { brand, ics } = getCalendarConfig()
	const siteName = brand.siteName
	const uidDomain = ics.uidDomain

	let {
		activityIcon,
		activityLabel,
		date,
		start,
		end,
		overlapping = [],
		capacity = 0,
		onBack,
		onEdit,
	}: {
		activityIcon: string
		activityLabel: string
		date: Date
		start: number
		end: number
		overlapping?: Person[]
		capacity?: number
		onBack: () => void
		onEdit?: () => void
	} = $props()

	const crewNames = $derived(
		overlapping.length === 0 ? '' :
		overlapping.length === 1 ? overlapping[0]!.name :
		overlapping.slice(0, -1).map(p => p.name).join(', ') + ' and ' + overlapping[overlapping.length - 1]!.name
	)

	function googleCalUrl() {
		const pad = (n: number) => String(n).padStart(2, '0')
		const y = date.getFullYear(); const m = pad(date.getMonth() + 1); const d = pad(date.getDate())
		const sh = pad(Math.floor(start)); const sm = pad(Math.round((start % 1) * 60))
		const eh = pad(Math.floor(end)); const em = pad(Math.round((end % 1) * 60))
		const dates = `${y}${m}${d}T${sh}${sm}00/${y}${m}${d}T${eh}${em}00`
		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(activityLabel)}&dates=${dates}&details=${encodeURIComponent('Booked via ' + siteName)}`
	}

	function outlookUrl() {
		const pad = (n: number) => String(n).padStart(2, '0')
		const y = date.getFullYear(); const m = pad(date.getMonth() + 1); const d = pad(date.getDate())
		const sh = pad(Math.floor(start)); const sm = pad(Math.round((start % 1) * 60))
		const eh = pad(Math.floor(end)); const em = pad(Math.round((end % 1) * 60))
		return `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(activityLabel)}&startdt=${y}-${m}-${d}T${sh}:${sm}:00&enddt=${y}-${m}-${d}T${eh}:${em}:00&body=${encodeURIComponent('Booked via ' + siteName)}`
	}

	function downloadIcs() {
		const pad = (n: number) => String(n).padStart(2, '0')
		const y = date.getFullYear(); const m = pad(date.getMonth() + 1); const d = pad(date.getDate())
		const sh = pad(Math.floor(start)); const sm = pad(Math.round((start % 1) * 60))
		const eh = pad(Math.floor(end)); const em = pad(Math.round((end % 1) * 60))
		const tzId = Intl.DateTimeFormat().resolvedOptions().timeZone
		const dtStart = `${y}${m}${d}T${sh}${sm}00`
		const dtEnd = `${y}${m}${d}T${eh}${em}00`
		const uid = `${dtStart}-${Math.random().toString(36).slice(2, 8)}@${uidDomain}`
		const icsContent = [
			'BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${uidDomain}//book//EN`,
			'BEGIN:VEVENT', `UID:${uid}`,
			`DTSTART;TZID=${tzId}:${dtStart}`, `DTEND;TZID=${tzId}:${dtEnd}`,
			`SUMMARY:${activityLabel}`, `DESCRIPTION:Booked via ${siteName}`,
			'END:VEVENT', 'END:VCALENDAR'
		].join('\r\n')
		const blob = new Blob([icsContent], { type: 'text/calendar' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url; a.download = `${activityLabel.toLowerCase().replace(/\s+/g, '-')}.ics`
		a.click(); URL.revokeObjectURL(url)
	}

	/* --- Sparkles --- */
	let sparkleEl: HTMLDivElement | undefined
	const SPARKLE_COLORS = ['#c4b5fd', '#6ee7b7', '#a78bfa', '#4ade80', '#f9a8d4', '#fbbf24', '#818cf8', '#34d399']

	function spawnSparkles() {
		if (!sparkleEl) return
		sparkleEl.innerHTML = ''
		for (let i = 0; i < 8; i++) {
			const dot = document.createElement('div')
			dot.className = 'bs__sparkle-dot'
			const color = SPARKLE_COLORS[i % SPARKLE_COLORS.length]
			const angle = (i / 8) * 360 + (Math.random() - 0.5) * 25
			const dist = 26 + Math.random() * 16
			const delay = i * 0.035
			dot.style.cssText = `background:${color};--angle:${angle}deg;--dist:${dist}px;animation-delay:${delay}s;`
			sparkleEl.appendChild(dot)
		}
		setTimeout(() => { if (sparkleEl) sparkleEl.innerHTML = '' }, 1200)
	}

	onMount(() => { spawnSparkles() })
</script>

<div class="bs">
	<div class="bs__sparkles" bind:this={sparkleEl}></div>

	<div class="bs__check-wrap">
		<div class="bs__check-glow"></div>
		<div class="bs__check">✓</div>
	</div>
	<h2 class="bs__title">Booked.</h2>

	<div class="bs__card">
		<p class="bs__detail">{formatDate(date)} &middot; {ft(start)}–{ft(end)}</p>
		{#if crewNames}
			<p class="bs__crew">with {crewNames}</p>
		{/if}
	</div>

	<p class="bs__greeting">See you there <img src="/media/page-icons/holidays-party.png" alt="" class="bs__greeting-icon" loading="eager" decoding="async" /></p>

	<div class="bs__cal-list">
		<a class="bs__cal-option" href={googleCalUrl()} target="_blank" rel="noopener">
			<Calendar class="bs__cal-icon" size={15} strokeWidth={2} />
			<span>Google Calendar</span>
		</a>
		<button type="button" class="bs__cal-option" onclick={downloadIcs}>
			<Apple class="bs__cal-icon" size={15} strokeWidth={2} />
			<span>Apple Calendar</span>
		</button>
		<a class="bs__cal-option" href={outlookUrl()} target="_blank" rel="noopener">
			<Mail class="bs__cal-icon" size={15} strokeWidth={2} />
			<span>Outlook</span>
		</a>
		<button type="button" class="bs__cal-option" onclick={downloadIcs}>
			<Download class="bs__cal-icon" size={15} strokeWidth={2} />
			<span>Other calendar</span>
		</button>
	</div>

	<div class="bs__nav">
		{#if onBack}
			<button type="button" class="bs__nav-link" onclick={onBack}>
				&larr; different day
			</button>
		{/if}
		{#if onEdit}
			<button type="button" class="bs__nav-link" onclick={onEdit}>
				edit time &rarr;
			</button>
		{/if}
	</div>
</div>

<style>
	.bs { text-align: center; position: relative; }

	/* Sparkles */
	.bs__sparkles {
		position: absolute;
		top: 1.2rem;
		left: 50%;
		width: 0; height: 0;
		pointer-events: none;
		z-index: 5;
	}

	:global(.bs__sparkle-dot) {
		position: absolute;
		width: 5px; height: 5px;
		border-radius: 999px;
		opacity: 0;
		animation: bs-spark 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes bs-spark {
		0%  { opacity: 0; transform: translate(0, 0) scale(0); }
		40% { opacity: 1; transform: translate(calc(cos(var(--angle)) * var(--dist)), calc(sin(var(--angle)) * var(--dist) * -1)) scale(1); }
		100% { opacity: 0; transform: translate(calc(cos(var(--angle)) * var(--dist) * 1.3), calc(sin(var(--angle)) * var(--dist) * -1.3)) scale(0); }
	}

	/* Check */
	.bs__check-wrap { position: relative; display: inline-block; margin-bottom: 0.65rem; }
	.bs__check-glow { position: absolute; inset: -10px; border-radius: 999px; background: radial-gradient(circle, rgba(74, 222, 128, 0.15) 0%, transparent 70%); animation: bs-glow 2.5s ease-in-out infinite alternate; }
	@keyframes bs-glow { from { opacity: 0.5; transform: scale(0.9); } to { opacity: 1; transform: scale(1.08); } }

	.bs__check {
		position: relative;
		display: inline-flex; align-items: center; justify-content: center;
		width: 2.8rem; height: 2.8rem;
		border-radius: 999px;
		background: rgba(74, 222, 128, 0.1);
		border: 1.5px solid rgba(74, 222, 128, 0.3);
		color: #4ade80;
		font-size: 1.2rem; font-weight: 700;
		animation: bs-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	@keyframes bs-pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

	/* Title */
	.bs__title {
		margin: 0 0 0.6rem;
		font-family: var(--font-display, Georgia);
		font-size: 1.5rem; font-weight: 500;
		letter-spacing: -0.03em;
		color: var(--text, #fff);
	}

	/* Card */
	.bs__card {
		padding: 0.5rem 0;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.bs__detail { margin: 0; font-size: 0.82rem; color: rgba(255, 255, 255, 0.55); }
	.bs__crew { margin: 0.1rem 0 0; font-size: 0.78rem; color: rgba(255, 255, 255, 0.35); }

	/* Greeting */
	.bs__greeting {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		margin: 0.75rem 0 0;
		font-family: var(--font-display, Georgia);
		font-size: 0.95rem; font-weight: 400; font-style: italic;
		background: linear-gradient(135deg, #a78bfa, #6ee7b7);
		-webkit-background-clip: text; -webkit-text-fill-color: transparent;
		background-clip: text;
	}

	:global(.bs__greeting-icon) {
		width: 1.1rem;
		height: 1.1rem;
		vertical-align: -0.1em;
		-webkit-text-fill-color: initial;
	}

	/* Calendar list */
	.bs__cal-list {
		display: flex; flex-direction: column;
		margin-top: 1rem;
		border: 1px solid rgba(167, 139, 250, 0.12);
		border-radius: 0.6rem;
		overflow: hidden;
		background: rgba(167, 139, 250, 0.03);
	}

	.bs__cal-option {
		display: flex; align-items: center; gap: 0.55rem;
		padding: 0.6rem 0.75rem;
		background: transparent; border: none;
		color: rgba(255, 255, 255, 0.5);
		font: inherit; font-size: 0.75rem; font-weight: 500;
		cursor: pointer; text-decoration: none; text-align: left;
		transition: background 150ms, color 150ms;
	}
	.bs__cal-option:hover { background: rgba(167, 139, 250, 0.08); color: #c4b5fd; }
	.bs__cal-option + .bs__cal-option { border-top: 1px solid rgba(167, 139, 250, 0.08); }

	:global(.bs__cal-icon) { flex-shrink: 0; opacity: 0.4; transition: opacity 150ms; }
	.bs__cal-option:hover :global(.bs__cal-icon) { opacity: 0.8; }

	/* Nav */
	.bs__nav {
		display: flex; justify-content: space-between;
		margin-top: 0.85rem;
	}

	.bs__nav-link {
		background: none; border: none;
		color: rgba(255, 255, 255, 0.25);
		font: inherit; font-size: 0.72rem; font-weight: 500;
		cursor: pointer; padding: 0.3rem 0;
		transition: color 150ms;
	}
	.bs__nav-link:hover { color: rgba(255, 255, 255, 0.55); }
</style>
