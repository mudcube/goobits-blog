<script lang="ts">
	import { Calendar, Apple, Mail, Download } from '@lucide/svelte'
	import type { Person } from './types'
	import { ft, formatDate } from './time'
	import { getCalendarConfig } from '@calendar/core/config'
	import { onMount } from 'svelte'
	import PaymentCheckout from '../member/booking/PaymentCheckout.svelte'

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
		event = null,
		confirmationId = null,
		status = 'booked',
		onBack,
		onEdit,
	}: {
		activityIcon: string
		activityLabel: string
		date: Date
		start: number
		end: number
		overlapping?: Person[]
		event?: {
			id: number
			title: string
			costCents: number
			currency: string
			paymentProvider: string | null
			paymentHandle: string | null
			payUrl?: string | null
		} | null
		confirmationId?: string | null
		status?: 'booked' | 'waitlist'
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
	type Sparkle = {
		id: number
		color: string
		angle: number
		dist: number
		delay: number
	}

	let sparkles = $state<Sparkle[]>([])
	let sparkleReset: ReturnType<typeof setTimeout> | undefined
	const SPARKLE_COLORS = ['#c4b5fd', '#6ee7b7', '#a78bfa', '#4ade80', '#f9a8d4', '#fbbf24', '#818cf8', '#34d399']

	function spawnSparkles() {
		sparkles = Array.from({ length: 8 }, (_, i) => {
			const color = SPARKLE_COLORS[i % SPARKLE_COLORS.length] ?? '#c4b5fd'
			const angle = (i / 8) * 360 + (Math.random() - 0.5) * 25
			const dist = 26 + Math.random() * 16
			const delay = i * 0.035
			return { id: i, color, angle, dist, delay }
		})
		clearTimeout(sparkleReset)
		sparkleReset = setTimeout(() => {
			sparkles = []
		}, 1200)
	}

	onMount(() => {
		spawnSparkles()
		return () => clearTimeout(sparkleReset)
	})
</script>

<div class="bs">
	<div class="bs__sparkles">
		{#each sparkles as sparkle (sparkle.id)}
			<span
				class="bs__sparkle-dot"
				style={`background:${sparkle.color};--angle:${sparkle.angle}deg;--dist:${sparkle.dist}px;animation-delay:${sparkle.delay}s;`}
			></span>
		{/each}
	</div>

	<div class="bs__check-wrap">
		<div class="bs__check-glow"></div>
		<div class="bs__check">✓</div>
	</div>
	<h2 class="bs__title">{status === 'waitlist' ? 'Waitlisted.' : 'Booked.'}</h2>

	<div class="bs__card">
		<p class="bs__activity">{activityIcon} {activityLabel}</p>
		<p class="bs__detail">{formatDate(date)} &middot; {ft(start)}–{ft(end)}</p>
	</div>

	{#if overlapping.length > 0}
		<div class="bs__crew-summary">
			<div class="bs__crew-dots">
				{#each overlapping as person}
					<span class="bs__crew-dot" style="background:{person.color};"></span>
				{/each}
			</div>
			<p class="bs__crew-text">{crewNames} will be there too</p>
		</div>
	{/if}

	<p class="bs__greeting">
		{status === 'waitlist' ? "We'll let you know if a spot opens" : 'See you there'}
		{#if status === 'booked'}
			<span class="bs__greeting-icon" aria-hidden="true">!</span>
		{/if}
	</p>

	<PaymentCheckout {event} {confirmationId} />

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

	.bs__sparkle-dot {
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
		color: var(--text, var(--color-white, #fff));
	}

	/* Card */
	.bs__card {
		padding: 0.5rem 0;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.bs__activity { margin: 0 0 0.15rem; font-size: 0.78rem; color: rgba(255, 255, 255, 0.45); }
	.bs__detail { margin: 0; font-size: 0.82rem; color: rgba(255, 255, 255, 0.55); }

	.bs__crew-summary { margin-top: 0.65rem; }
	.bs__crew-dots { display: flex; justify-content: center; gap: 0.3rem; margin-bottom: 0.25rem; }
	.bs__crew-dot { width: 0.5rem; height: 0.5rem; border-radius: 999px; }
	.bs__crew-text { margin: 0; font-size: 0.78rem; color: rgba(255, 255, 255, 0.45); }

	/* Greeting */
	.bs__greeting {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		margin: 0.75rem 0 0;
		font-family: var(--font-display, Georgia);
		font-size: 0.95rem; font-weight: 400; font-style: italic;
		color: rgba(255, 255, 255, 0.45);
	}

	:global(.bs__greeting-icon) {
		display: block;
		width: 1.4rem;
		height: 1.4rem;
		flex-shrink: 0;
	}

	/* Calendar list */
	.bs__cal-list {
		display: flex; flex-direction: column;
		margin-top: 1rem;
		border: 1px solid color-mix(in srgb, var(--book-accent, #a78bfa) 12%, transparent);
		border-radius: 0.6rem;
		overflow: hidden;
		background: color-mix(in srgb, var(--book-accent, #a78bfa) 3%, transparent);
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
	.bs__cal-option:hover { background: color-mix(in srgb, var(--book-accent, #a78bfa) 8%, transparent); color: #c4b5fd; }
	.bs__cal-option + .bs__cal-option { border-top: 1px solid color-mix(in srgb, var(--book-accent, #a78bfa) 8%, transparent); }

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
