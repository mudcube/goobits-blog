<script lang="ts">
	import { tick } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import { AlertTriangle, HelpCircle, Plug } from '@lucide/svelte'

	const { busy = false, errorMessage = '', onCancel, onConnect } = $props<{
		busy?: boolean
		errorMessage?: string
		onCancel: () => void
		onConnect: (creds: { username: string; appPassword: string; calendarUrl: string }) => void
	}>()

	let username = $state('')
	let appPassword = $state('')
	let calendarUrl = $state('')
	let panelEl: HTMLDivElement | undefined = $state()

	$effect(() => {
		void tick().then(() => {
			panelEl?.querySelector<HTMLInputElement>('input')?.focus()
		})
	})

	function dirty() {
		return Boolean(username.trim() || appPassword.trim() || calendarUrl.trim())
	}

	function attemptClose() {
		if (dirty()) return
		onCancel()
	}

	function handleKey(e: KeyboardEvent) {
		e.stopPropagation()
		if (e.key === 'Escape') attemptClose()
	}

	function submit() {
		if (busy) return
		const trimmed = {
			username: username.trim(),
			appPassword: appPassword.trim(),
			calendarUrl: calendarUrl.trim()
		}
		if (!trimmed.username || !trimmed.appPassword || !trimmed.calendarUrl) return
		onConnect(trimmed)
	}
</script>

<div
	class="apple-sheet"
	role="presentation"
	onclick={attemptClose}
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

			{#if errorMessage}
				<div class="apple-sheet__hint apple-sheet__hint--fail">
					<AlertTriangle size={14} /> {errorMessage}
				</div>
			{/if}
		</div>

		<footer class="apple-sheet__foot">
			<button type="button" class="admin-ui-btn admin-ui-btn--muted" onclick={onCancel}>Cancel</button>
			<button
				type="button"
				class="admin-ui-btn admin-ui-btn--solid"
				disabled={busy || !username.trim() || !appPassword.trim() || !calendarUrl.trim()}
				onclick={submit}
			>
				<Plug size={14} strokeWidth={2.2} /> {busy ? 'Connecting…' : 'Connect'}
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
