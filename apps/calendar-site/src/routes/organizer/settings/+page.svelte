<script lang="ts">
	import { Send, Settings, UserRoundCog } from '@lucide/svelte'

	let { data, form } = $props()
</script>

<svelte:head>
	<title>Organizer settings | pdx.fun</title>
</svelte:head>

<div class="organizer-settings">
	<header class="organizer-settings__header">
		<div>
			<p class="organizer-settings__eyebrow">Organizer settings</p>
			<h1>{data.tenant.name}</h1>
		</div>
		<div class="organizer-settings__actions" aria-label="Settings links">
			<a href="/organizer">Dashboard</a>
			{#if data.isAdmin}
				<a href="/admin/settings">Global admin settings</a>
			{/if}
		</div>
	</header>

	<div class="organizer-settings__grid">
		<section class="organizer-settings__panel" aria-labelledby="tenant-settings-heading">
			<div class="organizer-settings__panel-head">
				<Settings size={20} strokeWidth={1.8} />
				<h2 id="tenant-settings-heading">Organizer profile</h2>
			</div>
			<form class="organizer-settings__form" method="POST" action="?/updateTenant">
				<label>
					<span>Name</span>
					<input name="name" value={data.tenant.name} maxlength="80" required />
				</label>
				<label>
					<span>Slug</span>
					<input name="slug" value={data.tenant.slug} maxlength="60" required />
				</label>
				<button type="submit">
					<Settings size={18} strokeWidth={1.8} />
					Save profile
				</button>
				{#if form?.intent === 'tenant' && form?.error}
					<p class="organizer-settings__error">{form.error}</p>
				{:else if form?.intent === 'tenant' && form?.success}
					<p class="organizer-settings__success">Saved.</p>
				{/if}
			</form>
		</section>

		<section class="organizer-settings__panel" aria-labelledby="collaborator-heading">
			<div class="organizer-settings__panel-head">
				<UserRoundCog size={20} strokeWidth={1.8} />
				<h2 id="collaborator-heading">Tenant collaborators</h2>
			</div>
			<form class="organizer-settings__form" method="POST" action="?/inviteCollaborator">
				<label>
					<span>Email</span>
					<input name="email" type="email" maxlength="320" required />
				</label>
				<label>
					<span>Role</span>
					<select name="role">
						<option value="member">Member</option>
						<option value="admin">Admin</option>
						<option value="owner">Owner</option>
					</select>
				</label>
				<button type="submit">
					<Send size={18} strokeWidth={1.8} />
					Invite
				</button>
				{#if form?.intent === 'invite' && form?.error}
					<p class="organizer-settings__error">{form.error}</p>
				{:else if form?.intent === 'invite' && form?.success}
					<p class="organizer-settings__success">Invite saved.</p>
				{/if}
			</form>
		</section>
	</div>

	<section class="organizer-settings__people" aria-labelledby="people-heading">
		<h2 id="people-heading">Tenant people</h2>
		<div class="organizer-settings__list">
			{#each data.members as member}
				<div class="organizer-settings__person">
					<div>
						<strong>{member.name || member.email || member.userId}</strong>
						{#if member.email}
							<span>{member.email}</span>
						{/if}
					</div>
					<span>{member.role}</span>
				</div>
			{/each}
			{#each data.invites as invite}
				<div class="organizer-settings__person organizer-settings__person--pending">
					<div>
						<strong>{invite.email}</strong>
						<span>{invite.acceptedAt ? 'Accepted' : 'Pending'} · {invite.code}</span>
					</div>
					<span>{invite.role}</span>
				</div>
			{/each}
		</div>
	</section>
</div>

<style lang="scss">
	.organizer-settings {
		width: min(68rem, calc(100% - 2rem));
		margin: 0 auto;
		padding: clamp(2rem, 5vw, 4rem) 0;
	}

	.organizer-settings__header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;

		h1 {
			margin: 0;
			color: var(--calendar-shell-text);
			font-size: clamp(2.4rem, 6vw, 4.6rem);
			line-height: 0.95;
			letter-spacing: 0;
		}

	}

	.organizer-settings__actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.65rem;

		a {
			display: inline-flex;
			align-items: center;
			min-height: 2.65rem;
			padding: 0 0.95rem;
			border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 14%, transparent);
			border-radius: 0.5rem;
			color: #76e4b8;
			font-weight: 800;
			text-decoration: none;
		}
	}

	.organizer-settings__eyebrow {
		margin: 0 0 0.45rem;
		color: color-mix(in srgb, var(--calendar-shell-text) 58%, transparent);
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.organizer-settings__grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.organizer-settings__panel,
	.organizer-settings__people {
		border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 12%, transparent);
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--calendar-panel-bg) 84%, transparent);
	}

	.organizer-settings__panel {
		padding: 1rem;
	}

	.organizer-settings__panel-head {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin-bottom: 0.9rem;
		color: var(--calendar-shell-text);

		h2 {
			margin: 0;
			font-size: 1.25rem;
			line-height: 1.1;
			letter-spacing: 0;
		}
	}

	.organizer-settings__form {
		display: grid;
		gap: 0.8rem;

		label {
			display: grid;
			gap: 0.4rem;
		}

		span {
			color: color-mix(in srgb, var(--calendar-shell-text) 70%, transparent);
			font-size: 0.82rem;
			font-weight: 800;
		}

		input,
		select {
			min-height: 2.65rem;
			width: 100%;
			border: 1px solid color-mix(in srgb, var(--calendar-shell-text) 14%, transparent);
			border-radius: 0.45rem;
			background: color-mix(in srgb, black 20%, transparent);
			color: var(--calendar-shell-text);
			font: inherit;
			padding: 0 0.75rem;
		}

		button {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			min-height: 2.8rem;
			border: 1px solid color-mix(in srgb, #76e4b8 55%, transparent);
			border-radius: 0.5rem;
			background: #76e4b8;
			color: #08130f;
			font: inherit;
			font-weight: 800;
			cursor: pointer;
		}
	}

	.organizer-settings__error,
	.organizer-settings__success {
		margin: 0;
		font-weight: 800;
	}

	.organizer-settings__error {
		color: #fca5a5;
	}

	.organizer-settings__success {
		color: #76e4b8;
	}

	.organizer-settings__people {
		padding: 1rem;

		h2 {
			margin: 0 0 0.9rem;
			color: var(--calendar-shell-text);
			font-size: 1.25rem;
			line-height: 1.1;
			letter-spacing: 0;
		}
	}

	.organizer-settings__list {
		display: grid;
		gap: 0.65rem;
	}

	.organizer-settings__person {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.8rem;
		border-radius: 0.45rem;
		background: color-mix(in srgb, var(--calendar-shell-text) 7%, transparent);

		strong,
		span {
			display: block;
		}

		strong {
			color: var(--calendar-shell-text);
		}

		span {
			color: color-mix(in srgb, var(--calendar-shell-text) 62%, transparent);
			font-size: 0.88rem;
			font-weight: 800;
		}
	}

	.organizer-settings__person--pending {
		background: color-mix(in srgb, #76e4b8 10%, transparent);
	}

	@media (max-width: 48em) {
		.organizer-settings__header {
			align-items: stretch;
			flex-direction: column;
		}

		.organizer-settings__grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 40em) {
		.organizer-settings {
			width: min(100% - 1rem, 68rem);
		}

		.organizer-settings__person {
			align-items: start;
			flex-direction: column;
		}
	}
</style>
