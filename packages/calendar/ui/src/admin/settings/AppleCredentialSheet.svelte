<script lang="ts">
	import { AlertTriangle, HelpCircle, Plug } from '@lucide/svelte'
	import AdminSheet from '../shared/AdminSheet.svelte'

	const { busy = false, errorMessage = '', onCancel, onConnect } = $props<{
		busy?: boolean
		errorMessage?: string
		onCancel: () => void
		onConnect: (creds: { username: string; appPassword: string; calendarUrl: string }) => void
	}>()

	let username = $state('')
	let appPassword = $state('')
	let calendarUrl = $state('')

	function dirty() {
		return Boolean(username.trim() || appPassword.trim() || calendarUrl.trim())
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

<AdminSheet
	title="Connect Apple Calendar"
	preventClose={dirty}
	onClose={onCancel}
>
	{#snippet body()}
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
	{/snippet}

	{#snippet foot()}
		<button type="button" class="admin-ui-btn admin-ui-btn--muted" onclick={onCancel}>Cancel</button>
		<button
			type="button"
			class="admin-ui-btn admin-ui-btn--solid"
			disabled={busy || !username.trim() || !appPassword.trim() || !calendarUrl.trim()}
			onclick={submit}
		>
			<Plug size={14} strokeWidth={2.2} /> {busy ? 'Connecting…' : 'Connect'}
		</button>
	{/snippet}
</AdminSheet>

<style>
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
		color: var(--admin-danger);
	}
</style>
