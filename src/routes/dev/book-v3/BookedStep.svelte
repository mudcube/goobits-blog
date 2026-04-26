<script lang="ts">
	import { ChevronLeft, ChevronDown } from '@lucide/svelte'
	import type { Person } from './types'
	import { ft, formatDate } from './time'

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
		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(activityLabel)}&dates=${dates}&details=${encodeURIComponent('Booked via miko.art')}`
	}

	function outlookUrl() {
		const pad = (n: number) => String(n).padStart(2, '0')
		const y = date.getFullYear(); const m = pad(date.getMonth() + 1); const d = pad(date.getDate())
		const sh = pad(Math.floor(start)); const sm = pad(Math.round((start % 1) * 60))
		const eh = pad(Math.floor(end)); const em = pad(Math.round((end % 1) * 60))
		return `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(activityLabel)}&startdt=${y}-${m}-${d}T${sh}:${sm}:00&enddt=${y}-${m}-${d}T${eh}:${em}:00&body=${encodeURIComponent('Booked via miko.art')}`
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
			`SUMMARY:${activityLabel}`, `DESCRIPTION:Booked via miko.art`,
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
						<svg class="bs__cal-icon" viewBox="0 0 24 24" width="16" height="16"><path fill="#4285F4" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10c1.73 0 3.36-.44 4.78-1.21l-2.12-3.67A5.96 5.96 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L18.36 5.64A9.953 9.953 0 0 0 12 2"/><path fill="#34A853" d="M6 12c0 3.31 2.69 6 6 6 1.08 0 2.09-.29 2.96-.78l2.12 3.67C15.36 22.56 13.73 23 12 23 6.48 23 2 18.52 2 13"/><path fill="#FBBC05" d="M12 6c-1.66 0-3.14.69-4.22 1.78L5.64 5.64A9.953 9.953 0 0 1 12 2v4"/><path fill="#EA4335" d="M18.36 5.64 16.22 7.78A5.96 5.96 0 0 1 18 12h4c0-2.76-1.12-5.26-2.93-7.07"/></svg>
						<span>Google Calendar</span>
					</a>
					<button type="button" class="bs__cal-option" onclick={() => { downloadIcs(); calOpen = false }}>
						<svg class="bs__cal-icon" viewBox="0 0 24 24" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><text x="12" y="18" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor">29</text></svg>
						<span>Apple Calendar</span>
					</button>
					<a class="bs__cal-option" href={outlookUrl()} target="_blank" rel="noopener">
						<svg class="bs__cal-icon" viewBox="0 0 24 24" width="16" height="16"><path fill="#0078D4" d="M21.17 2H8.83A1.83 1.83 0 0 0 7 3.83v4.34l7.5 3.33L22 7.83V3.83A1.83 1.83 0 0 0 21.17 2z"/><path fill="#0364B8" d="M22 7.83 14.5 12 7 7.83v8.34A1.83 1.83 0 0 0 8.83 18h12.34A1.83 1.83 0 0 0 23 16.17V7.83z" opacity="0.8"/><path fill="#0078D4" d="M7 8v10l-5-3V6z" opacity="0.6"/><rect x="2" y="6" width="10" height="12" rx="1.5" fill="#0078D4"/><text x="7" y="15" text-anchor="middle" font-size="7" font-weight="700" fill="#fff">O</text></svg>
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
	.bs__check { width: 3.2rem; height: 3.2rem; border-radius: 999px; background: color-mix(in srgb, #3cbf8a 10%, transparent); border: 1.5px solid color-mix(in srgb, #3cbf8a 28%, transparent); color: #3cbf8a; display: inline-flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; animation: bs-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
	@keyframes bs-pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

	.bs__sparkle { position: absolute; width: 4px; height: 4px; border-radius: 999px; background: #3cbf8a; opacity: 0; }
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
	.bs__add-cal { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.65rem; border: 1px solid color-mix(in srgb, #a78bfa 25%, transparent); border-radius: 0.5rem; background: color-mix(in srgb, #7a5af8 12%, transparent); color: #fff; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 180ms; }
	.bs__add-cal:hover { background: color-mix(in srgb, #7a5af8 20%, transparent); border-color: color-mix(in srgb, #a78bfa 45%, transparent); }
	.bs__cal-menu { display: flex; flex-direction: column; margin-top: 0.3rem; border: 1px solid color-mix(in srgb, var(--text) 12%, transparent); border-radius: 0.5rem; overflow: hidden; animation: bs-menu-in 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
	@keyframes bs-menu-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
	.bs__cal-option { display: flex; align-items: center; gap: 0.5rem; padding: 0.55rem 0.75rem; background: transparent; border: none; color: var(--text); font: inherit; font-size: 0.78rem; font-weight: 500; cursor: pointer; text-decoration: none; transition: background 150ms; text-align: left; }
	.bs__cal-option:hover { background: color-mix(in srgb, var(--text) 6%, transparent); }
	.bs__cal-option + .bs__cal-option { border-top: 1px solid color-mix(in srgb, var(--text) 7%, transparent); }
	.bs__cal-icon { flex-shrink: 0; }
	.bs__secondary { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.3rem; padding: 0.55rem; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); border-radius: 0.5rem; background: transparent; color: color-mix(in srgb, var(--text) 55%, transparent); font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 150ms; }
	.bs__secondary:hover { background: color-mix(in srgb, var(--text) 4%, transparent); color: var(--text); }
</style>
