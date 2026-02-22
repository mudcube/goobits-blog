<script lang="ts">
	import { ChevronRight } from '@lucide/svelte'

	const {
		name,
		detail,
		badge = '',
		initials,
		isYou = false,
		onclick
	} = $props<{
		name: string
		detail: string
		badge?: string
		initials: string
		isYou?: boolean
		onclick?: () => void
	}>()
</script>

<button type="button" class="admin-crew-member" onclick={onclick}>
	<div class="admin-crew-member__avatar" class:admin-crew-member__avatar--you={isYou}>
		{#if isYou}
			You
		{:else}
			{initials}
		{/if}
	</div>
	<div class="admin-crew-member__body">
		<div class="admin-crew-member__top">
			<span class="admin-crew-member__name">{name}</span>
			{#if isYou}
				<span class="admin-crew-member__you">you</span>
			{:else if badge}
				<span class="admin-crew-member__badge">{badge}</span>
			{/if}
		</div>
		<div class="admin-crew-member__detail">{detail}</div>
	</div>
	<div class="admin-crew-member__right" aria-hidden="true">
		<ChevronRight size={16} strokeWidth={2} />
	</div>
</button>

<style>
	.admin-crew-member {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.75rem 0.875rem;
		border-radius: 0.875rem;
		border: 1px solid var(--admin-card-border);
		background: var(--admin-card-bg);
		text-align: left;
		cursor: pointer;
		color: inherit;
		font: inherit;
		transition: background 120ms ease, box-shadow 120ms ease, transform 120ms ease;
	}

	.admin-crew-member:hover {
		background: var(--admin-card-bg-hover, var(--admin-card-bg));
		box-shadow: 0 4px 16px color-mix(in srgb, var(--admin-accent) 8%, transparent);
		transform: translateY(-1px);
	}

	.admin-crew-member__avatar {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		flex-shrink: 0;
		background: color-mix(in srgb, var(--admin-accent) 12%, transparent);
		color: color-mix(in srgb, var(--admin-accent) 86%, var(--text) 14%);
	}

	.admin-crew-member__avatar--you {
		background: color-mix(in srgb, var(--admin-accent) 22%, transparent);
		border: 1.5px solid color-mix(in srgb, var(--admin-accent) 30%, transparent);
		font-size: 0.68rem;
	}

	.admin-crew-member__body {
		flex: 1;
		min-width: 0;
	}

	.admin-crew-member__top {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.admin-crew-member__name {
		font-size: 0.875rem;
		font-weight: 650;
		letter-spacing: -0.005em;
	}

	.admin-crew-member__you {
		font-size: 0.56rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--admin-accent) 86%, var(--text) 14%);
		background: color-mix(in srgb, var(--admin-accent) 10%, transparent);
		padding: 0.12rem 0.38rem;
		border-radius: 0.25rem;
	}

	.admin-crew-member__badge {
		font-size: 0.6875rem;
		font-weight: 600;
		color: color-mix(in srgb, var(--text) 58%, transparent);
	}

	.admin-crew-member__detail {
		font-size: 0.6875rem;
		line-height: 1.35;
		color: color-mix(in srgb, var(--text) 42%, transparent);
		margin-top: 0.1rem;
	}

	.admin-crew-member__right {
		color: color-mix(in srgb, var(--text) 36%, transparent);
		flex-shrink: 0;
	}

	.admin-crew-member:hover .admin-crew-member__right {
		color: color-mix(in srgb, var(--text) 52%, transparent);
	}
</style>
