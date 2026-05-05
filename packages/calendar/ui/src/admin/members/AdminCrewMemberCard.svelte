<script lang="ts">
	import { ChevronRowCard } from '@calendar/ui/shared'

	const {
		name,
		detail,
		badge = '',
		initials,
		avatarUrl = null,
		isYou = false,
		href = null,
		onclick
	} = $props<{
		name: string
		detail: string
		badge?: string
		initials: string
		avatarUrl?: string | null
		isYou?: boolean
		href?: string | null
		onclick?: () => void
	}>()

	let avatarBroken = $state(false)
	const showImage = $derived(!isYou && !!avatarUrl && !avatarBroken)
</script>

<ChevronRowCard {href} {onclick} ariaLabel={`Open ${name}`}>
	{#snippet start()}
		<span class="admin-crew-member__avatar" class:admin-crew-member__avatar--you={isYou} class:admin-crew-member__avatar--image={showImage}>
			{#if isYou}
				You
			{:else if showImage}
				<img
					src={avatarUrl}
					alt=""
					referrerpolicy="no-referrer"
					loading="lazy"
					decoding="async"
					onerror={() => (avatarBroken = true)}
				/>
			{:else}
				{initials}
			{/if}
		</span>
	{/snippet}
	<div class="admin-crew-member__top">
		<span class="admin-crew-member__name">{name}</span>
		{#if !isYou && badge}
			<span class="admin-crew-member__badge">{badge}</span>
		{/if}
	</div>
	<div class="admin-crew-member__detail">{detail}</div>
</ChevronRowCard>

<style>
	.admin-crew-member__avatar {
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		flex-shrink: 0;
		overflow: hidden;
		background: color-mix(in srgb, var(--admin-accent) 12%, transparent);
		color: color-mix(in srgb, var(--admin-accent) 86%, var(--text) 14%);
	}

	.admin-crew-member__avatar--image {
		background: transparent;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
	}

	.admin-crew-member__avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
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
