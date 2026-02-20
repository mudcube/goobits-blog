<script lang="ts">
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/features/dashboard/admin/admin-dashboard-controller.svelte'

	const { data } = $props<{ data: { user: unknown | null } }>()
	const dashboard = createAdminDashboardController({ onUnauthorized: handleUnauthorizedSessionError })
	const authed = $derived(!!data.user)
	let editActivities = $state(false)
	let editDefaults = $state(false)
	let editIntegrations = $state(false)
	let newActivityName = $state('')
	let newActivityEmoji = $state('✨')

	const emojiPreset = ['🏋', '🎪', '🏔', '🎬', '🍺', '🧘', '🏊', '🎯', '🎵', '🏃']
	const noticeOptions = [
		{ label: '1 hr', value: 1 },
		{ label: '2 hr', value: 2 },
		{ label: '4 hr', value: 4 },
		{ label: '24 hr', value: 24 }
	]
	const paymentProviders = ['venmo', 'zelle', 'cashapp', 'none']

	$effect(() => {
		if (!authed) return
		dashboard.loadStatus()
		dashboard.loadPaymentDefaults()
		dashboard.loadPrograms()
	})

	function slugify(input: string) {
		return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
	}

	async function addActivity() {
		const label = newActivityName.trim()
		if (!label) return
		const slug = slugify(label)
		if (!slug) return
		dashboard.newProgramDraft()
		dashboard.programDraft = {
			...dashboard.programDraft,
			slug,
			label,
			activityName: label,
			pageTitle: label,
			eyebrow: 'Social OS',
			heroTitleLine1: label,
			heroTitleLine2: '',
			heroSubtitle: `${label} sessions`,
			description: `${label} group events`,
			icon: newActivityEmoji,
			enabled: true
		}
		await dashboard.saveProgram()
		if (!dashboard.error) {
			newActivityName = ''
			newActivityEmoji = '✨'
		}
	}

	async function deleteActivity(slug: string) {
		dashboard.selectProgram(slug)
		await dashboard.deleteProgram()
	}

	async function moveActivity(slug: string, direction: -1 | 1) {
		const list = [...dashboard.programs].sort((a, b) => a.sortOrder - b.sortOrder)
		const idx = list.findIndex((item) => item.slug === slug)
		const nextIdx = idx + direction
		if (idx < 0 || nextIdx < 0 || nextIdx >= list.length) return
		const current = list[idx]
		const next = list[nextIdx]
		if (!current || !next) return
		const currentOrder = current.sortOrder
		const nextOrder = next.sortOrder

		dashboard.selectProgram(current.slug)
		dashboard.programDraft = { ...dashboard.programDraft, sortOrder: nextOrder }
		await dashboard.saveProgram()
		dashboard.selectProgram(next.slug)
		dashboard.programDraft = { ...dashboard.programDraft, sortOrder: currentOrder }
		await dashboard.saveProgram()
	}

	function displayHours() {
		return `${dashboard.hours.from} - ${dashboard.hours.to}`
	}
</script>

{#if authed}
	<div class="social-config">
		<h2>Configuration</h2>

		<div class="social-config__section">
			<div class="social-config__head">
				<h4>ACTIVITIES (YOUR PROGRAMS)</h4>
				<button type="button" onclick={() => (editActivities = !editActivities)}>Edit</button>
			</div>
			<div class="social-config__pills">
				{#each dashboard.programs as program}
					<div class="social-config__pill">
						<span>{program.icon || '✨'}</span> {program.label}
						{#if editActivities}
							<button type="button" class="social-config__x" onclick={() => deleteActivity(program.slug)}>✕</button>
							<div class="social-config__reorder">
								<button type="button" onclick={() => moveActivity(program.slug, -1)}>↑</button>
								<button type="button" onclick={() => moveActivity(program.slug, 1)}>↓</button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
			{#if editActivities}
				<div class="social-config__edit-panel">
					<div class="social-config__add-row">
						<input type="text" placeholder="New activity name..." bind:value={newActivityName} />
						<select bind:value={newActivityEmoji}>
							{#each emojiPreset as emoji}
								<option value={emoji}>{emoji}</option>
							{/each}
						</select>
						<button type="button" onclick={addActivity}>Add</button>
					</div>
				</div>
			{/if}
		</div>

		<div class="social-config__divider"></div>

		<div class="social-config__section">
			<div class="social-config__head">
				<h4>DEFAULTS (HOUSE RULES)</h4>
				<button type="button" onclick={() => (editDefaults = !editDefaults)}>Edit</button>
			</div>
			<div class="social-config__table">
				<div><span>Open hours</span><strong>{displayHours()}</strong></div>
				<div><span>Min notice</span><strong>{dashboard.notice} hours</strong></div>
				<div><span>Default spots</span><strong>{dashboard.capacity}</strong></div>
			</div>
			{#if editDefaults}
				<div class="social-config__edit-panel">
					<div class="social-config__grid-2">
						<div>
							<label for="social-config-open">Open</label>
							<input id="social-config-open" type="time" bind:value={dashboard.hours.from} />
						</div>
						<div>
							<label for="social-config-close">Close</label>
							<input id="social-config-close" type="time" bind:value={dashboard.hours.to} />
						</div>
					</div>
					<div class="social-config__grid-2">
						<div>
							<label for="social-config-notice">Min notice</label>
							<select id="social-config-notice" bind:value={dashboard.notice}>
								{#each noticeOptions as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="social-config-capacity">Default spots</label>
							<input id="social-config-capacity" type="number" min="2" max="20" step="1" bind:value={dashboard.capacity} />
						</div>
					</div>
					<button type="button" onclick={dashboard.save} disabled={dashboard.saving}>
						{dashboard.saving ? 'Saving…' : 'Save'}
					</button>
				</div>
			{/if}
		</div>

		<div class="social-config__divider"></div>

		<div class="social-config__section">
			<div class="social-config__head">
				<h4>INTEGRATIONS</h4>
				<button type="button" onclick={() => (editIntegrations = !editIntegrations)}>Edit</button>
			</div>
			<div class="social-config__table">
				<div>
					<span>Google Calendar</span>
					<strong>{dashboard.connected && !dashboard.connectionExpired ? '● Online' : 'Offline'}</strong>
				</div>
				<div>
					<span>Payments</span>
					<strong>{dashboard.paymentDefaults.provider || 'none'} ({dashboard.paymentDefaults.handle || 'not set'})</strong>
				</div>
			</div>
			{#if editIntegrations}
				<div class="social-config__edit-panel">
					<div class="social-config__button-row">
						<button type="button" onclick={dashboard.reconnect}>
							{dashboard.connected ? 'Reconnect' : 'Connect'}
						</button>
						{#if dashboard.connected}
							<button type="button" onclick={dashboard.disconnect} disabled={dashboard.disconnecting}>Disconnect</button>
						{/if}
					</div>
					<div class="social-config__grid-2">
						<div>
							<label for="social-config-provider">Platform</label>
							<select id="social-config-provider" bind:value={dashboard.paymentDefaults.provider}>
								{#each paymentProviders as provider}
									<option value={provider}>{provider}</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="social-config-handle">Handle</label>
							<input id="social-config-handle" type="text" bind:value={dashboard.paymentDefaults.handle} />
						</div>
					</div>
					<button type="button" onclick={dashboard.savePaymentDefaults}>Save</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.social-config {
		max-width: 48rem;
		display: grid;
		gap: 1rem;
	}

	.social-config h2 {
		margin: 0;
		font-size: 1.375rem;
		color: var(--text);
	}

	.social-config__section {
		display: grid;
		gap: 0.75rem;
	}

	.social-config__head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.social-config__head h4 {
		margin: 0;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		color: color-mix(in srgb, var(--text) 55%, transparent);
	}

	.social-config__head button,
	.social-config__edit-panel button,
	.social-config__pill button {
		min-height: 32px;
		padding: 0 0.75rem;
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--text) 24%, transparent);
		background: color-mix(in srgb, var(--bg) 90%, var(--text) 10%);
		color: var(--text);
		font-weight: 600;
		cursor: pointer;
	}

	.social-config__pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.625rem;
	}

	.social-config__pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 0.875rem;
		border-radius: 12px;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		background: color-mix(in srgb, var(--bg) 94%, var(--text) 6%);
		font-size: 0.875rem;
	}

	.social-config__x {
		padding: 0;
		min-height: 22px;
		width: 22px;
		border-radius: 999px;
	}

	.social-config__reorder {
		display: inline-flex;
		gap: 0.25rem;
	}

	.social-config__reorder button {
		padding: 0;
		width: 24px;
		min-height: 24px;
		border-radius: 8px;
	}

	.social-config__divider {
		height: 1px;
		background: color-mix(in srgb, var(--text) 12%, transparent);
	}

	.social-config__table {
		border-radius: 14px;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		background: color-mix(in srgb, var(--bg) 94%, var(--text) 6%);
		padding: 0.25rem 1rem;
	}

	.social-config__table > div {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.625rem 0;
	}

	.social-config__table > div + div {
		border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
	}

	.social-config__table span {
		font-size: 0.8125rem;
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}

	.social-config__table strong {
		font-size: 0.8125rem;
		color: var(--text);
	}

	.social-config__edit-panel {
		border-radius: 12px;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		background: color-mix(in srgb, var(--bg) 92%, var(--text) 8%);
		padding: 0.875rem;
		display: grid;
		gap: 0.75rem;
	}

	.social-config__add-row,
	.social-config__button-row {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.social-config__grid-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.625rem;
	}

	.social-config label {
		display: block;
		margin-bottom: 0.25rem;
		font-size: 0.75rem;
		color: color-mix(in srgb, var(--text) 62%, transparent);
	}

	.social-config input,
	.social-config select {
		width: 100%;
		min-height: 40px;
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
		background: color-mix(in srgb, var(--bg) 96%, var(--text) 4%);
		color: var(--text);
		padding: 0 0.625rem;
	}

	@media (max-width: 820px) {
		.social-config__grid-2 {
			grid-template-columns: 1fr;
		}
	}
</style>
