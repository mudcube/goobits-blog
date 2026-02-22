<script lang="ts">
	import AdminChevronRowCard from '@components/Admin/AdminChevronRowCard.svelte'

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

<AdminChevronRowCard {onclick} ariaLabel={`Open ${name}`}>
	{#snippet start()}
		<span class="admin-crew-member__avatar" class:admin-crew-member__avatar--you={isYou}>
			{#if isYou}
				You
			{:else}
				{initials}
			{/if}
		</span>
	{/snippet}
	<div class="admin-crew-member__top">
		<span class="admin-crew-member__name">{name}</span>
		{#if isYou}
			<span class="admin-crew-member__you">you</span>
		{:else if badge}
			<span class="admin-crew-member__badge">{badge}</span>
		{/if}
	</div>
	<div class="admin-crew-member__detail">{detail}</div>
</AdminChevronRowCard>

<style>
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

</style>
