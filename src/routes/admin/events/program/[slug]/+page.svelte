<script lang="ts">
	import { goto } from '$app/navigation'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'
	import AdminWysiwygWorkspace from '$lib/admin/AdminWysiwygWorkspace.svelte'

	const { data } = $props<{ data: { user: unknown | null; slug: string } }>()
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)
	const slug = $derived(data.slug)

	let preview = $state(false)
	let drawerOpen = $state(false)
	let initialized = $state(false)
	let toast = $state('')
	let toastError = $state(false)
	let toastTimer: ReturnType<typeof setTimeout> | null = null

	$effect(() => {
		if (!authed) return
		void dashboard.loadPrograms()
		void dashboard.loadEvents()
	})

	$effect(() => {
		if (!authed || initialized || dashboard.programs.length === 0) return
		const found = dashboard.programs.find((program) => program.slug === slug)
		if (!found) {
			void goto('/admin/events/')
			return
		}
		dashboard.selectProgram(found.slug)
		initialized = true
	})

	function flash(message: string, isError = false) {
		toast = message
		toastError = isError
		if (toastTimer) clearTimeout(toastTimer)
		toastTimer = setTimeout(() => {
			toast = ''
			toastError = false
		}, 2200)
	}

	function updateProgramField(field: keyof typeof dashboard.programDraft, value: string) {
		dashboard.programDraft = {
			...dashboard.programDraft,
			[field]: value
		}
	}

	function dayLabel(iso: string) {
		const date = new Date(iso)
		return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }).toUpperCase()
	}

	function timeLabel(iso: string) {
		return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase()
	}

	async function saveProgram() {
		await dashboard.saveProgram()
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		flash('Activity saved')
	}

	async function deleteProgram() {
		await dashboard.deleteProgram()
		if (dashboard.error) {
			flash(dashboard.error, true)
			return
		}
		void goto('/admin/events/')
	}
</script>

{#if authed}
	{#if toast}
		<div class="social-events__toast" class:social-events__toast--error={toastError} role="status">
			{#if !toastError}✓ {/if}{toast}
		</div>
	{/if}

	<div class="social-events__editor social-events__editor--shell">
		<AdminWysiwygWorkspace
			backLabel="Programs"
			modeLabel={preview ? 'Preview' : 'Editing'}
			statusLabel={dashboard.programDraft.enabled ? 'Live' : 'Draft'}
			statusOff={!dashboard.programDraft.enabled}
			preview={preview}
			primaryLabel={dashboard.programSaving ? 'Saving…' : 'Save'}
			primaryDisabled={dashboard.programSaving}
			drawerOpen={drawerOpen}
			onBack={() => goto('/admin/events/')}
			onToggleSettings={() => (drawerOpen = !drawerOpen)}
			onTogglePreview={() => (preview = !preview)}
			onPrimary={() => { void saveProgram() }}
			onCloseDrawer={() => (drawerOpen = false)}
		>
			{#snippet canvas()}
				<div class="social-events__canvas">
					<div class="social-events__hero-glow"></div>
					<div class="social-events__hero-icon-wrap">
						<span class="social-events__hero-icon">{dashboard.programDraft.icon || '✨'}</span>
					</div>
					<div class="social-events__editable social-events__hero-eyebrow" contenteditable={!preview} spellcheck={false} onblur={(event) => updateProgramField('eyebrow', event.currentTarget.textContent || '')}>{dashboard.programDraft.eyebrow || 'Weekly sessions'}</div>
					<div class="social-events__editable social-events__hero-title" contenteditable={!preview} spellcheck={false} onblur={(event) => updateProgramField('heroTitleLine1', event.currentTarget.textContent || '')}>{dashboard.programDraft.heroTitleLine1 || 'Train'}</div>
					<div class="social-events__editable social-events__hero-title" contenteditable={!preview} spellcheck={false} onblur={(event) => updateProgramField('heroTitleLine2', event.currentTarget.textContent || '')}>{dashboard.programDraft.heroTitleLine2 || 'Together'}</div>
					<div class="social-events__editable social-events__hero-sub" contenteditable={!preview} spellcheck={false} onblur={(event) => updateProgramField('heroSubtitle', event.currentTarget.textContent || '')}>{dashboard.programDraft.heroSubtitle || 'Book sessions and work out together.'}</div>

					<div class="social-events__preview-list">
						{#each dashboard.events.slice(0, 3) as ev}
							<div class="social-events__preview-slot">
								<div>
									<div class="social-events__preview-date">{dayLabel(ev.startsAt)} · {timeLabel(ev.startsAt)}</div>
									<div class="social-events__preview-title">{ev.title}</div>
								</div>
								<div class="social-events__preview-badge">{ev.seatsTaken}/{ev.capacity}</div>
							</div>
						{/each}
					</div>
				</div>
			{/snippet}
			{#snippet drawer()}
				<div class="social-events__drawer-head">
					<strong>Program settings</strong>
					<button type="button" onclick={() => (drawerOpen = false)}>✕</button>
				</div>
				<div class="social-events__drawer-body">
					<div class="social-events__drawer-toggle">
						<span>Accepting bookings</span>
						<button type="button" class="social-events__switch" class:social-events__switch--on={dashboard.programDraft.enabled} aria-label={dashboard.programDraft.enabled ? 'Disable bookings' : 'Enable bookings'} aria-pressed={dashboard.programDraft.enabled} onclick={() => (dashboard.programDraft = { ...dashboard.programDraft, enabled: !dashboard.programDraft.enabled })}><span></span></button>
					</div>
					<label><span>URL path</span><input type="text" bind:value={dashboard.programDraft.slug} /></label>
					<label><span>Sort position</span><input type="number" bind:value={dashboard.programDraft.sortOrder} /></label>
					<label><span>Status note</span><input type="text" bind:value={dashboard.programDraft.serviceStatusNote} /></label>
					<div class="social-events__drawer-divider"></div>
					<label><span>Page title</span><input type="text" bind:value={dashboard.programDraft.pageTitle} /></label>
					<label><span>Activity name</span><input type="text" bind:value={dashboard.programDraft.activityName} /></label>
					<label><span>Eyebrow class</span><input type="text" bind:value={dashboard.programDraft.eyebrowClass} /></label>
					<label><span>Glow class</span><input type="text" bind:value={dashboard.programDraft.glowClass} /></label>
					<label><span>Form glow class</span><input type="text" bind:value={dashboard.programDraft.formGlowClass} /></label>
					<div class="social-events__editor-actions">
						<button type="button" class="social-events__danger" onclick={() => { void deleteProgram() }} disabled={dashboard.programDeleting}>{dashboard.programDeleting ? 'Deleting…' : 'Delete'}</button>
						<button type="button" onclick={() => { void saveProgram() }} disabled={dashboard.programSaving}>{dashboard.programSaving ? 'Saving…' : 'Save'}</button>
					</div>
				</div>
			{/snippet}
		</AdminWysiwygWorkspace>
	</div>
{/if}

<style>
	.social-events__editor {
		max-width: 760px;
		margin: 0 auto;
	}
	.social-events__editor--shell {
		min-height: calc(100vh - 8rem);
		border-radius: 20px;
		background: var(--bg);
		border: 1px solid color-mix(in srgb, var(--text) 18%, transparent);
		padding: 1.25rem;
		box-shadow: 0 20px 60px color-mix(in srgb, black 14%, transparent);
	}
	.social-events__canvas { max-width: 36rem; margin: 0 auto; padding: 0.4rem 0 1rem; display: grid; gap: 0.8rem; position: relative; }
	.social-events__hero-glow { position: absolute; left: 50%; top: 0.75rem; transform: translateX(-50%); width: 280px; height: 280px; border-radius: 999px; background: radial-gradient(circle, color-mix(in srgb, var(--text) 12%, transparent) 0%, transparent 72%); pointer-events: none; }
	.social-events__hero-icon-wrap { display: flex; justify-content: center; margin-top: 0.4rem; }
	.social-events__hero-icon { font-size: 2.6rem; line-height: 1; }
	.social-events__editable { outline: none; border-radius: 8px; padding: 0.2rem 0.5rem; text-align: center; }
	.social-events__editable:hover { background: color-mix(in srgb, var(--text) 5%, transparent); }
	.social-events__editable:focus { background: color-mix(in srgb, var(--text) 7%, transparent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--text) 16%, transparent); }
	.social-events__hero-eyebrow { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: color-mix(in srgb, #10b981 76%, var(--text) 24%); }
	.social-events__hero-title { font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: var(--text); }
	.social-events__hero-sub { max-width: 24rem; margin: 0 auto; font-size: 0.95rem; line-height: 1.45; color: color-mix(in srgb, var(--text) 64%, transparent); }
	.social-events__preview-list { margin-top: 0.4rem; display: grid; gap: 0.45rem; opacity: 0.48; }
	.social-events__preview-slot { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.8rem; border-radius: 10px; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); background: color-mix(in srgb, var(--bg) 96%, var(--text) 4%); }
	.social-events__preview-date { font-size: 0.74rem; font-weight: 600; color: color-mix(in srgb, var(--text) 62%, transparent); }
	.social-events__preview-title { font-size: 0.72rem; color: color-mix(in srgb, var(--text) 52%, transparent); }
	.social-events__preview-badge { font-size: 0.7rem; padding: 0.2rem 0.45rem; border-radius: 6px; border: 1px solid color-mix(in srgb, var(--text) 10%, transparent); }
	.social-events__drawer-head { padding: 0.8rem 0.95rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent); }
	.social-events__drawer-head strong { font-size: 0.83rem; color: var(--text); }
	.social-events__drawer-head button { width: 28px; height: 28px; border-radius: 8px; border: none; background: transparent; color: color-mix(in srgb, var(--text) 58%, transparent); cursor: pointer; }
	.social-events__drawer-body { padding: 0.9rem; display: grid; gap: 0.65rem; overflow: auto; }
	.social-events__drawer-body label { display: grid; gap: 0.2rem; }
	.social-events__drawer-body label span { font-size: 0.69rem; font-weight: 600; color: color-mix(in srgb, var(--text) 58%, transparent); }
	.social-events__drawer-body input { width: 100%; min-height: 34px; padding: 0.35rem 0.6rem; border-radius: 8px; border: 1px solid color-mix(in srgb, var(--text) 15%, transparent); background: var(--bg); color: var(--text); font: inherit; }
	.social-events__drawer-toggle { display: flex; align-items: center; justify-content: space-between; }
	.social-events__drawer-toggle span { font-size: 0.78rem; font-weight: 600; color: var(--text); }
	.social-events__drawer-divider { height: 1px; background: color-mix(in srgb, var(--text) 10%, transparent); }
	.social-events__switch { width: 46px; height: 26px; border: 1px solid color-mix(in srgb, var(--text) 20%, transparent); border-radius: 999px; background: color-mix(in srgb, var(--text) 20%, transparent); cursor: pointer; position: relative; }
	.social-events__switch span { position: absolute; width: 18px; height: 18px; border-radius: 999px; top: 3px; left: 4px; background: var(--bg); transition: left 120ms ease; }
	.social-events__switch--on { background: color-mix(in srgb, var(--text) 70%, var(--bg) 30%); }
	.social-events__switch--on span { left: 23px; }
	.social-events__editor-actions { display: flex; justify-content: flex-end; gap: 0.55rem; margin-top: 0.9rem; }
	.social-events__editor-actions button { min-height: 36px; padding: 0 1rem; border-radius: 10px; border: 1px solid color-mix(in srgb, var(--text) 20%, transparent); background: color-mix(in srgb, var(--text) 78%, var(--bg) 22%); color: var(--bg); font-weight: 700; cursor: pointer; }
	.social-events__danger { border-color: color-mix(in srgb, #ef4444 32%, transparent) !important; color: color-mix(in srgb, #ef4444 80%, var(--text) 20%) !important; background: color-mix(in srgb, #ef4444 10%, var(--bg) 90%) !important; }
	.social-events__toast { position: fixed; left: 50%; bottom: 1rem; transform: translateX(-50%); padding: 0.5rem 1rem; border-radius: 999px; background: color-mix(in srgb, #10b981 88%, var(--bg) 12%); color: var(--bg); font-size: 0.8rem; font-weight: 700; z-index: 140; }
	.social-events__toast--error { background: color-mix(in srgb, #ef4444 85%, var(--bg) 15%); }
</style>
