<script lang="ts">
	import { onDestroy } from 'svelte'

	type CommitInput = { startsAt: string; endsAt: string }

	const {
		startsAt,
		endsAt,
		onCommit,
		ariaLabel = 'Edit date and time',
		formatDisplay
	} = $props<{
		startsAt: string
		endsAt: string
		onCommit: (next: CommitInput) => void | Promise<void>
		ariaLabel?: string
		formatDisplay?: (startsAt: string, endsAt: string) => string
	}>()

	let open = $state(false)
	let date = $state('')
	let startTime = $state('')
	let endTime = $state('')
	let rootEl: HTMLDivElement | undefined = $state()
	let saving = $state(false)
	let errorMsg = $state('')

	function pad(n: number) {
		return String(n).padStart(2, '0')
	}

	function toLocalDate(iso: string) {
		const d = new Date(iso)
		if (!Number.isFinite(d.getTime())) return ''
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
	}

	function toLocalTime(iso: string) {
		const d = new Date(iso)
		if (!Number.isFinite(d.getTime())) return ''
		return `${pad(d.getHours())}:${pad(d.getMinutes())}`
	}

	function combine(dateStr: string, timeStr: string) {
		const [year, month, day] = dateStr.split('-').map((part) => Number.parseInt(part, 10))
		const [hour, minute] = timeStr.split(':').map((part) => Number.parseInt(part, 10))
		if ([year, month, day, hour, minute].some((value) => !Number.isFinite(value))) return null
		const local = new Date()
		local.setFullYear(year as number, (month as number) - 1, day as number)
		local.setHours(hour as number, minute as number, 0, 0)
		return local
	}

	function defaultDisplay(start: string, end: string) {
		const startD = new Date(start)
		const endD = new Date(end)
		if (!Number.isFinite(startD.getTime())) return '-'
		const dayLabel = startD.toLocaleDateString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		})
		const startTimeLabel = startD.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
		const endTimeLabel = Number.isFinite(endD.getTime())
			? endD.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
			: ''
		return endTimeLabel ? `${dayLabel} at ${startTimeLabel} – ${endTimeLabel}` : `${dayLabel} at ${startTimeLabel}`
	}

	function display() {
		return formatDisplay ? formatDisplay(startsAt, endsAt) : defaultDisplay(startsAt, endsAt)
	}

	function openPanel() {
		date = toLocalDate(startsAt)
		startTime = toLocalTime(startsAt)
		endTime = toLocalTime(endsAt)
		errorMsg = ''
		open = true
	}

	function closePanel() {
		open = false
		errorMsg = ''
	}

	async function commit() {
		if (saving) return
		const start = combine(date, startTime)
		const end = combine(date, endTime)
		if (!start || !end) {
			errorMsg = 'Pick a valid date and time.'
			return
		}
		if (end.getTime() <= start.getTime()) {
			errorMsg = 'End must be after start.'
			return
		}
		saving = true
		try {
			await onCommit({ startsAt: start.toISOString(), endsAt: end.toISOString() })
			open = false
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Failed to save'
		} finally {
			saving = false
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (!open) return
		const target = event.target as Node | null
		if (rootEl && target && !rootEl.contains(target)) closePanel()
	}

	function handleKey(event: KeyboardEvent) {
		if (!open) return
		if (event.key === 'Escape') {
			event.preventDefault()
			closePanel()
		}
	}

	$effect(() => {
		if (!open) return
		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('keydown', handleKey)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('keydown', handleKey)
		}
	})

	onDestroy(() => {
		document.removeEventListener('mousedown', handleClickOutside)
		document.removeEventListener('keydown', handleKey)
	})
</script>

<div class="admin-datetime" bind:this={rootEl}>
	<button
		type="button"
		class="admin-datetime__trigger"
		aria-label={ariaLabel}
		aria-expanded={open}
		onclick={() => (open ? closePanel() : openPanel())}
	>
		{display()}
	</button>
	{#if open}
		<div class="admin-datetime__panel" role="dialog" aria-label={ariaLabel}>
			<label class="admin-datetime__field">
				<span>Date</span>
				<input class="ui-form-control" type="date" bind:value={date} />
			</label>
			<div class="admin-datetime__row">
				<label class="admin-datetime__field">
					<span>Start</span>
					<input class="ui-form-control" type="time" bind:value={startTime} />
				</label>
				<label class="admin-datetime__field">
					<span>End</span>
					<input class="ui-form-control" type="time" bind:value={endTime} />
				</label>
			</div>
			{#if errorMsg}
				<p class="admin-datetime__error">{errorMsg}</p>
			{/if}
			<div class="admin-datetime__actions">
				<button type="button" class="admin-ui-btn admin-ui-btn--muted" onclick={closePanel} disabled={saving}>
					Cancel
				</button>
				<button type="button" class="admin-ui-btn admin-ui-btn--solid" onclick={() => void commit()} disabled={saving}>
					{saving ? 'Saving…' : 'Save'}
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.admin-datetime {
		position: relative;
		display: inline-block;
	}
	.admin-datetime__trigger {
		font: inherit;
		color: inherit;
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		border-bottom: 1px dashed color-mix(in srgb, var(--text) 22%, transparent);
		transition: border-color 150ms ease;
	}
	.admin-datetime__trigger:hover,
	.admin-datetime__trigger[aria-expanded='true'] {
		border-bottom-color: color-mix(in srgb, var(--text) 48%, transparent);
	}
	.admin-datetime__panel {
		position: absolute;
		top: calc(100% + 0.4rem);
		left: 0;
		z-index: 80;
		display: grid;
		gap: 0.55rem;
		min-width: 16rem;
		padding: 0.85rem;
		background: var(--admin-card-bg, var(--bg));
		border: 1px solid var(--admin-card-border, color-mix(in srgb, var(--text) 12%, transparent));
		border-radius: 0.7rem;
		box-shadow: 0 18px 48px -16px color-mix(in srgb, black 36%, transparent);
	}
	.admin-datetime__field {
		display: grid;
		gap: 0.25rem;
	}
	.admin-datetime__field span {
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--admin-text-muted);
	}
	.admin-datetime__row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}
	.admin-datetime__error {
		margin: 0;
		font-size: 0.74rem;
		font-weight: 540;
		color: var(--admin-danger);
	}
	.admin-datetime__actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.4rem;
	}
	.admin-datetime__panel :global(.ui-form-control) {
		min-height: 2rem;
		padding: 0 0.6rem;
		font-size: 0.84rem;
		border-radius: 0.5rem;
	}
</style>
