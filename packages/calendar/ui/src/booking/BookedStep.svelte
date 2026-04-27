<script lang="ts">
	import { ChevronLeft, ChevronDown, Calendar, Apple, Mail } from '@lucide/svelte'
	import type { Person } from './types'
	import { ft, formatDate } from './time'
	import { getCalendarConfig } from '@calendar/core'

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

	const tz = $derived(Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ').replace(/.*\//, ''))

	const spotsLabel = $derived(capacity > 0 ? ` · ${overlapping.length + 1} of ${capacity} spots` : '')

	let calOpen = $state(false)

	function toggleCal() { calOpen = !calOpen }

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
		const ics = [
			'BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${uidDomain}//book//EN`,
			'BEGIN:VEVENT', `UID:${uid}`,
			`DTSTART;TZID=${tzId}:${dtStart}`, `DTEND;TZID=${tzId}:${dtEnd}`,
			`SUMMARY:${activityLabel}`, `DESCRIPTION:Booked via ${siteName}`,
			'END:VEVENT', 'END:VCALENDAR'
		].join('\r\n')
		const blob = new Blob([ics], { type: 'text/calendar' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url; a.download = `${activityLabel.toLowerCase().replace(/\s+/g, '-')}.ics`
		a.click(); URL.revokeObjectURL(url)
	}
</script>

<div class="bs">
	<div class="bs__badge">
		<span class="bs__check">✓</span>
		<div class="bs__sparkle bs__sparkle--1"></div>
		<div class="bs__sparkle bs__sparkle--2"></div>
		<div class="bs__sparkle bs__sparkle--3"></div>
		<div class="bs__sparkle bs__sparkle--4"></div>
	</div>
	<h2 class="bs__title">You're booked.</h2>

	<div class="bs__card">
		<p class="bs__activity">{activityIcon} {activityLabel}</p>
		<p class="bs__date">{formatDate(date)} · {ft(start)} – {ft(end)}</p>
		<p class="bs__tz">{tz}{spotsLabel}</p>
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

	<div class="bs__actions">
		<div class="bs__cal-wrap">
			<button type="button" class="bs__add-cal" onclick={toggleCal}>
				<span>Add to Calendar</span>
				<ChevronDown size={14} strokeWidth={2} style="transition:transform 0.2s;{calOpen ? 'transform:rotate(180deg);' : ''}" />
			</button>
			{#if calOpen}
				<div class="bs__cal-menu">
					<a class="bs__cal-option" href={googleCalUrl()} target="_blank" rel="noopener">
						<Calendar size={15} strokeWidth={2} />
						<span>Google Calendar</span>
					</a>
					<button type="button" class="bs__cal-option" onclick={() => { downloadIcs(); calOpen = false }}>
						<Apple size={15} strokeWidth={2} />
						<span>Apple Calendar</span>
					</button>
					<a class="bs__cal-option" href={outlookUrl()} target="_blank" rel="noopener">
						<Mail size={15} strokeWidth={2} />
						<span>Outlook</span>
					</a>
				</div>
			{/if}
		</div>
		{#if onEdit}
			<button type="button" class="bs__secondary" onclick={onEdit}>
				<ChevronLeft size={14} strokeWidth={2} />
				<span>Adjust my time</span>
			</button>
		{/if}
		<button type="button" class="bs__secondary" onclick={onBack}>
			<ChevronLeft size={14} strokeWidth={2} />
			<span>Pick a different day</span>
		</button>
	</div>
</div>

<style>
	.bs { text-align: center; animation: bs-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
	@keyframes bs-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

	.bs__badge { position: relative; width: 3.2rem; height: 3.2rem; margin: 0 auto 0.85rem; }
	.bs__check { width: 3.2rem; height: 3.2rem; border-radius: 999px; background: color-mix(in srgb, var(--book-success) 10%, transparent); border: 1.5px solid color-mix(in srgb, var(--book-success) 28%, transparent); color: var(--book-success); display: inline-flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; animation: bs-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
	@keyframes bs-pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

	.bs__sparkle { position: absolute; width: 4px; height: 4px; border-radius: 999px; background: var(--book-success); opacity: 0; }
	.bs__sparkle--1 { top: -6px; left: 50%; animation: bs-spark 0.6s 0.3s ease-out both; }
	.bs__sparkle--2 { bottom: -6px; left: 50%; animation: bs-spark 0.6s 0.4s ease-out both; }
	.bs__sparkle--3 { left: -6px; top: 50%; animation: bs-spark 0.6s 0.35s ease-out both; }
	.bs__sparkle--4 { right: -6px; top: 50%; animation: bs-spark 0.6s 0.45s ease-out both; }
	@keyframes bs-spark { 0% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1.5); } 100% { opacity: 0; transform: scale(0.5) translateY(-8px); } }

	.bs__title { margin: 0 0 0.75rem; font-family: var(--font-display); font-size: 1.5rem; font-weight: 500; letter-spacing: -0.03em; }

	.bs__card { padding: 0.65rem 0; border-top: 1px solid color-mix(in srgb, var(--text) 8%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--text) 8%, transparent); }
	.bs__activity { margin: 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 60%, transparent); }
	.bs__date { margin: 0.15rem 0 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 60%, transparent); }
	.bs__tz { margin: 0.1rem 0 0; font-size: 0.58rem; color: color-mix(in srgb, var(--text) 35%, transparent); }

	.bs__crew-summary { margin-top: 0.65rem; }
	.bs__crew-dots { display: flex; justify-content: center; gap: 0.25rem; margin-bottom: 0.25rem; }
	.bs__crew-dot { width: 0.5rem; height: 0.5rem; border-radius: 999px; }
	.bs__crew-text { margin: 0; font-size: 0.78rem; color: color-mix(in srgb, var(--text) 55%, transparent); }

	.bs__actions { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.85rem; }
	.bs__cal-wrap { position: relative; }
	.bs__add-cal { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.65rem; border: 1px solid color-mix(in srgb, var(--book-accent) 25%, transparent); border-radius: 0.5rem; background: color-mix(in srgb, var(--book-accent-deep) 12%, transparent); color: #fff; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 180ms; }
	.bs__add-cal:hover { background: color-mix(in srgb, var(--book-accent-deep) 20%, transparent); border-color: color-mix(in srgb, var(--book-accent) 45%, transparent); }
	.bs__cal-menu { display: flex; flex-direction: column; margin-top: 0.3rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); border-radius: 0.5rem; overflow: hidden; animation: bs-menu-in 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
	@keyframes bs-menu-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
	.bs__cal-option { display: flex; align-items: center; gap: 0.5rem; padding: 0.55rem 0.75rem; background: transparent; border: none; color: var(--text); font: inherit; font-size: 0.78rem; font-weight: 500; cursor: pointer; text-decoration: none; transition: background 150ms; text-align: left; }
	.bs__cal-option:hover { background: color-mix(in srgb, var(--text) 6%, transparent); }
	.bs__cal-option + .bs__cal-option { border-top: 1px solid color-mix(in srgb, var(--text) 7%, transparent); }
	.bs__secondary { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.3rem; padding: 0.55rem; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.5rem; background: transparent; color: color-mix(in srgb, var(--text) 55%, transparent); font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 150ms; }
	.bs__secondary:hover { background: color-mix(in srgb, var(--text) 4%, transparent); color: var(--text); }
</style>
