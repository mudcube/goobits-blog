<script lang="ts">
	import type { Component, Snippet } from 'svelte'
	import { Mail, ChevronRight } from '@lucide/svelte'
	import AdminActionButton from '@calendar/ui/admin/shared/AdminActionButton.svelte'

	type MetaAction = {
		variant?: 'primary' | 'subtle' | 'danger'
		icon?: Component | null
		label?: string
		ariaLabel?: string
		onclick: () => void
	}

	type MetaItem = {
		id: string
		label: string
		detail: string
		icon?: Component | null
		dotColor?: string
		dotIcon?: Component | null
		dimmed?: boolean
		onClick?: () => void
		ariaLabel?: string
		actions?: MetaAction[]
	}

	const { items, emptyText = 'No items.', singleLine = false, right }: {
		items: MetaItem[]
		emptyText?: string
		singleLine?: boolean
		right?: Snippet<[MetaItem]>
	} = $props()
</script>

<div class="admin-meta-cards" class:admin-meta-cards--single-line={singleLine}>
	{#if items.length === 0}
		<div class="admin-meta-cards__empty calendar-ui-card">{emptyText}</div>
	{:else}
		<div class="admin-meta-cards__container">
		{#each items as item, i (item.id)}
			{#if i > 0}<div class="admin-meta-cards__divider"></div>{/if}
			{#if item.onClick}
				<button
					type="button"
					class="admin-meta-cards__card admin-meta-cards__card--clickable"
					class:admin-meta-cards__card--dimmed={item.dimmed}
					aria-label={item.ariaLabel || item.label}
					onclick={item.onClick}
				>
					{#if item.dotIcon}
						<div class="admin-meta-cards__activity" style={item.dotColor ? `--activity-color:${item.dotColor};` : ''} aria-hidden="true">
							<item.dotIcon size={14} strokeWidth={2.2} />
						</div>
					{:else if item.dotColor}
						<span class="admin-meta-cards__dot" style="background:{item.dotColor};" aria-hidden="true"></span>
					{:else}
						<div class="admin-meta-cards__icon" aria-hidden="true">
							{#if item.icon}
								<item.icon size={16} strokeWidth={2} />
							{:else}
								<Mail size={16} strokeWidth={2} />
							{/if}
						</div>
					{/if}
					<div class="admin-meta-cards__body">
						<div class="admin-meta-cards__label">{item.label}</div>
						{#if item.detail}
							<div class="admin-meta-cards__detail">{item.detail}</div>
						{/if}
					</div>
					{#if right}
						<div class="admin-meta-cards__right">
							{@render right(item)}
						</div>
					{/if}
					<ChevronRight class="admin-meta-cards__chevron" size={16} strokeWidth={2} />
				</button>
			{:else}
				<div class="admin-meta-cards__card" class:admin-meta-cards__card--dimmed={item.dimmed}>
					{#if item.dotIcon}
						<div class="admin-meta-cards__activity" style={item.dotColor ? `--activity-color:${item.dotColor};` : ''} aria-hidden="true">
							<item.dotIcon size={14} strokeWidth={2.2} />
						</div>
					{:else if item.dotColor}
						<span class="admin-meta-cards__dot" style="background:{item.dotColor};" aria-hidden="true"></span>
					{:else}
						<div class="admin-meta-cards__icon" aria-hidden="true">
							{#if item.icon}
								<item.icon size={16} strokeWidth={2} />
							{:else}
								<Mail size={16} strokeWidth={2} />
							{/if}
						</div>
					{/if}
					<div class="admin-meta-cards__body">
						<div class="admin-meta-cards__label">{item.label}</div>
						{#if item.detail}
							<div class="admin-meta-cards__detail">{item.detail}</div>
						{/if}
					</div>
					{#if right}
						<div class="admin-meta-cards__right">
							{@render right(item)}
						</div>
					{/if}
					{#if item.actions?.length}
						<div class="admin-meta-cards__actions">
							{#each item.actions as action}
								{#if action.label}
									<AdminActionButton
										variant={action.variant || 'subtle'}
										icon={action.icon}
										ariaLabel={action.ariaLabel}
										onclick={action.onclick}
									>{action.label}</AdminActionButton>
								{:else}
									<AdminActionButton
										variant={action.variant || 'subtle'}
										icon={action.icon}
										ariaLabel={action.ariaLabel}
										onclick={action.onclick}
									/>
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/each}
		</div>
	{/if}
</div>

<style>
	.admin-meta-cards {
		display: grid;
	}

	.admin-meta-cards__container {
		border: 1px solid var(--admin-card-border);
		border-radius: 0.875rem;
		background: var(--admin-card-bg);
		overflow: hidden;
	}

	.admin-meta-cards__divider {
		height: 1px;
		background: color-mix(in srgb, var(--admin-card-border) 60%, transparent);
	}

	.admin-meta-cards__empty {
		padding: 0.8rem 0.95rem;
		font-size: 0.8rem;
		color: color-mix(in srgb, var(--text) 52%, transparent);
	}

	.admin-meta-cards__card {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.75rem 0.875rem;
		min-height: 4rem;
		width: 100%;
		text-align: left;
		font: inherit;
		color: inherit;
	}

	.admin-meta-cards__card--clickable {
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background 140ms;
	}

	.admin-meta-cards__card--clickable:hover {
		background: color-mix(in srgb, var(--admin-accent) 6%, transparent);
	}

	.admin-meta-cards__card--dimmed {
		opacity: 0.55;
	}

	.admin-meta-cards__icon {
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 999px;
		display: grid;
		place-items: center;
		flex-shrink: 0;
		background: color-mix(in srgb, var(--admin-accent) 8%, transparent);
		color: color-mix(in srgb, var(--admin-accent) 76%, var(--text) 24%);
	}

	.admin-meta-cards__dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 999px;
		flex-shrink: 0;
		margin-left: 0.5rem;
	}

	.admin-meta-cards__activity {
		--activity-color: var(--admin-accent);
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		display: grid;
		place-items: center;
		flex-shrink: 0;
		background: color-mix(in srgb, var(--activity-color) 14%, transparent);
		color: color-mix(in srgb, var(--activity-color) 88%, var(--text) 12%);
		border: 1px solid color-mix(in srgb, var(--activity-color) 28%, transparent);
	}

	.admin-meta-cards__body {
		flex: 1;
		min-width: 0;
	}

	.admin-meta-cards__label {
		font-size: 0.875rem;
		font-weight: 650;
		line-height: 1.3;
		letter-spacing: -0.005em;
	}

	.admin-meta-cards__detail {
		margin-top: 0.1rem;
		font-size: 0.6875rem;
		line-height: 1.35;
		color: color-mix(in srgb, var(--text) 42%, transparent);
	}

	.admin-meta-cards--single-line .admin-meta-cards__body {
		display: flex;
		align-items: center;
	}

	.admin-meta-cards__right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.3rem;
		flex-shrink: 0;
	}

	:global(.admin-meta-cards__chevron) {
		flex-shrink: 0;
		opacity: 0.3;
		color: var(--text);
		transition: opacity 140ms, transform 140ms;
	}

	.admin-meta-cards__card--clickable:hover :global(.admin-meta-cards__chevron) {
		opacity: 0.65;
		transform: translateX(2px);
	}

	.admin-meta-cards__actions {
		display: inline-flex;
		gap: 0.375rem;
		flex-shrink: 0;
	}

	@media (max-width: 720px) {
		.admin-meta-cards__card {
			align-items: flex-start;
		}

		.admin-meta-cards__actions {
			flex-direction: column;
		}
	}
</style>
