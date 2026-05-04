<script lang="ts">
	import { tick } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import { AlertTriangle, Check, HelpCircle, Plug } from '@lucide/svelte'

	type TestState = 'idle' | 'testing' | 'ok' | 'fail'

	let {
		onCancel,
		onConnect
	}: {
		onCancel: () => void
		onConnect: (creds: { username: string; appPassword: string; calendarUrl: string }) => Promise<void>
	} = $props()

	let username = $state('')
	let appPassword = $state('')
	let calendarUrl = $state('')
	let testState = $state<TestState>('idle')
	let panelEl: HTMLDivElement | undefined = $state()

	$effect(() => {
		void tick().then(() => {
			panelEl?.querySelector<HTMLInputElement>('input')?.focus()
		})
	})

	function dirty() {
		return Boolean(username.trim() || appPassword.trim() || calendarUrl.trim())
	}

	function handleBackdrop() {
		if (dirty()) return
		onCancel()
	}

	function handleKey(e: KeyboardEvent) {
		e.stopPropagation()
		if (e.key === 'Escape') handleBackdrop()
	}

	async function runTest() {
		if (!username.trim() || !appPassword.trim() || !calendarUrl.trim()) {
			testState = 'fail'
			return
		}
		testState = 'testing'
		await new Promise((r) => setTimeout(r, 700))
		testState = 'ok'
	}

	async function ensureTested() {
		if (testState !== 'ok') await runTest()
	}

	async function handleConnect() {
		await ensureTested()
		if (testState !== 'ok') return
		await onConnect({
			username: username.trim(),
			appPassword: appPassword.trim(),
			calendarUrl: calendarUrl.trim()
		})
	}
</script>

<div
	class="apple-sheet"
	role="presentation"
	onclick={handleBackdrop}
	onkeydown={handleKey}
	transition:fade={{ duration: 160 }}
>
	<div
		bind:this={panelEl}
		class="apple-sheet__panel"
		role="dialog"
		aria-modal="true"
		aria-label="Connect Apple Calendar"
		tabindex="-1"
		onclick={(e) => e.stopPropagation()}
		onkeydown={handleKey}
		transition:fly={{ y: 12, duration: 200, easing: quintOut }}
	>
		<header class="apple-sheet__head">
			<h3 class="apple-sheet__title">Connect Apple Calendar</h3>
		</header>

		<div class="apple-sheet__body">
			<label class="apple-sheet__field">
				<span class="apple-sheet__label">Apple ID email</span>
				<input
					class="ui-form-control"
					type="email"
					bind:value={username}
					autocomplete="username"
				/>
			</label>
			<label class="apple-sheet__field">
				<span class="apple-sheet__label">
					App-specific password
					<button
						type="button"
						class="apple-sheet__help"
						title="Create one at appleid.apple.com → Sign-In & Security → App-Specific Passwords"
						aria-label="Help: app-specific password"
						onclick={(e) => e.preventDefault()}
					>
						<HelpCircle size={12} strokeWidth={2} />
					</button>
				</span>
				<input
					class="ui-form-control"
					type="password"
					bind:value={appPassword}
					autocomplete="new-password"
				/>
			</label>
			<label class="apple-sheet__field">
				<span class="apple-sheet__label">
					CalDAV URL
					<button
						type="button"
						class="apple-sheet__help"
						title="From iCloud → Calendars → right-click your calendar → Public Calendar URL"
						aria-label="Help: CalDAV URL"
						onclick={(e) => e.preventDefault()}
					>
						<HelpCircle size={12} strokeWidth={2} />
					</button>
				</span>
				<input
					class="ui-form-control"
					type="url"
					placeholder="https://caldav.icloud.com/..."
					bind:value={calendarUrl}
				/>
			</label>

			{#if testState === 'ok'}
				<div class="apple-sheet__hint apple-sheet__hint--ok">
					<Check size={14} /> Connection looks good.
				</div>
			{:else if testState === 'fail'}
				<div class="apple-sheet__hint apple-sheet__hint--fail">
					<AlertTriangle size={14} /> Couldn't reach that calendar.
				</div>
			{/if}
		</div>

		<footer class="apple-sheet__foot">
			<button type="button" class="admin-btn admin-btn--muted" onclick={onCancel}>Cancel</button>
			<button
				type="button"
				class="admin-btn"
				disabled={testState === 'testing'}
				onclick={runTest}
			>
				<Plug size={13} strokeWidth={2} />
				{testState === 'testing' ? 'Testing…' : 'Test connection'}
			</button>
			<button type="button" class="admin-btn admin-btn--solid" onclick={handleConnect}>
				<Plug size={14} strokeWidth={2.2} /> Connect
			</button>
		</footer>
	</div>
</div>

<style>
	.apple-sheet {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, var(--text) 30%, transparent);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 100;
	}
	.apple-sheet__panel {
		width: min(26rem, 100%);
		background: var(--admin-card-bg);
		border: 1px solid var(--admin-card-border);
		border-radius: 14px;
		box-shadow: 0 24px 60px -18px color-mix(in srgb, black 36%, transparent);
		display: grid;
		max-height: 90vh;
		overflow: hidden;
	}
	.apple-sheet__head {
		padding: 1.05rem 1.15rem 0.55rem;
	}
	.apple-sheet__title {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 580;
		letter-spacing: -0.005em;
		color: var(--text);
	}
	.apple-sheet__body {
		padding: 0.4rem 1.15rem 0.95rem;
		display: grid;
		gap: 0.7rem;
		overflow-y: auto;
	}
	.apple-sheet__field {
		display: grid;
		gap: 0.35rem;
	}
	.apple-sheet__label {
		font-size: 0.74rem;
		font-weight: 540;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.apple-sheet__help {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.1rem;
		height: 1.1rem;
		padding: 0;
		margin-left: 0.35rem;
		border: none;
		background: transparent;
		color: color-mix(in srgb, var(--text) 42%, transparent);
		cursor: help;
	}
	.apple-sheet__help:hover {
		color: var(--admin-accent);
	}
	.apple-sheet__hint {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.78rem;
		font-weight: 460;
		font-style: italic;
	}
	.apple-sheet__hint--ok {
		color: var(--admin-status-success-dot, #16a34a);
	}
	.apple-sheet__hint--fail {
		color: #ef4444;
	}
	.apple-sheet__foot {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 1.15rem 1rem;
		border-top: 1px solid color-mix(in srgb, var(--admin-card-border) 80%, transparent);
		background: color-mix(in srgb, var(--bg) 94%, var(--text) 6%);
	}
	.apple-sheet :global(.ui-form-control) {
		min-height: 2rem;
		padding: 0 0.7rem;
		font-size: 0.84rem;
		border-radius: 0.625rem;
	}
</style>
