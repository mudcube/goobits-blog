<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { withAdminRoute } from '@calendar/ui/config'
	import { handleUnauthorizedSessionError } from '@calendar/ui/routing/auth'
	import { createAdminDashboardController } from '@calendar/ui/admin/dashboard/admin-dashboard-controller.svelte'
	import { isAdminMockMode, withAdminMock } from '@calendar/ui/admin/mock/mock-mode'
	import AdminPageHero from '@calendar/ui/admin/shared/AdminPageHero.svelte'
	import AdminGroupedCard from '@calendar/ui/admin/shared/AdminGroupedCard.svelte'
	import AdminActionButton from '@calendar/ui/admin/shared/AdminActionButton.svelte'

	const { user } = $props<{ user: unknown | null }>()
	const dashboard = createAdminDashboardController({
		onUnauthorized: handleUnauthorizedSessionError
	})
	const authed = $derived(!!user)
	const mockMode = $derived(isAdminMockMode($page.url))

	const ICON_OPTIONS = ['💪', '🎪', '🧘', '🏔️', '🎬', '🏺', '🎨', '🎲', '☕', '🌈', '✨', '🎯', '🔥', '🎶']

	let label = $state('')
	let slug = $state('')
	let slugTouched = $state(false)
	let icon = $state('✨')
	let subtitle = $state('')
	let description = $state('')
	let enabled = $state(true)
	let saving = $state(false)
	let toast = $state('')
	let toastError = $state(false)
	let toastTimer: ReturnType<typeof setTimeout> | null = null

	function slugify(value: string) {
		return value
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
	}

	const derivedSlug = $derived(slugTouched ? slug : slugify(label))
	const canCreate = $derived(label.trim().length > 0 && derivedSlug.length > 0 && !saving)

	$effect(() => {
		if (!authed || mockMode) return
		void dashboard.loadPrograms()
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

	function nextSortOrder() {
		const list = dashboard.programs
		if (!list || list.length === 0) return 10
		const last = list[list.length - 1]
		return ((last?.sortOrder as number | undefined) ?? 0) + 10
	}

	function hrefWithMock(path: string) {
		return withAdminMock(path, mockMode)
	}

	async function submitCreate() {
		if (!canCreate) return
		const finalSlug = derivedSlug
		const finalLabel = label.trim()
		if (mockMode) {
			flash('Mock mode: program created in preview')
			void goto(hrefWithMock(withAdminRoute(`events/program/${finalSlug}/`)))
			return
		}
		saving = true
		dashboard.programDraft = {
			slug: finalSlug,
			label: finalLabel,
			activityName: finalLabel,
			pageTitle: finalLabel,
			eyebrow: finalLabel,
			heroTitleLine1: '',
			heroTitleLine2: '',
			heroSubtitle: subtitle.trim(),
			description: description.trim(),
			icon,
			eyebrowClass: '',
			glowClass: '',
			formGlowClass: '',
			serviceStatusNote: '',
			enabled,
			sortOrder: nextSortOrder()
		}
		try {
			await dashboard.saveProgram()
			if (dashboard.error) {
				flash(dashboard.error, true)
				return
			}
			void goto(hrefWithMock(withAdminRoute(`events/program/${finalSlug}/`)))
		} finally {
			saving = false
		}
	}

	function cancel() {
		void goto(hrefWithMock(withAdminRoute('events/')))
	}
</script>

{#if authed}
	<div class="admin-new-program admin-content">
		{#if toast}
			<div
				class="admin-new-program__toast admin-ui-toast"
				class:admin-ui-toast--error={toastError}
				role="status"
			>
				{#if !toastError}✓{/if}{toast}
			</div>
		{/if}

		<AdminPageHero
			eyebrow="Programs"
			title="New program"
			subtitle="Add a new activity to your space."
		>
			{#snippet actions()}
				<AdminActionButton variant="subtle" onclick={cancel}>Cancel</AdminActionButton>
				<AdminActionButton
					variant="primary"
					disabled={!canCreate}
					onclick={() => void submitCreate()}
				>
					{saving ? 'Creating…' : 'Create program'}
				</AdminActionButton>
			{/snippet}
		</AdminPageHero>

		<h4>BASICS</h4>
		<AdminGroupedCard>
			<label class="admin-new-program__row">
				<span>Name</span>
				<input
					class="ui-form-control"
					type="text"
					placeholder="e.g. Pottery Studio"
					bind:value={label}
				/>
			</label>
			<label class="admin-new-program__row">
				<span>URL slug</span>
				<input
					class="ui-form-control"
					type="text"
					placeholder="auto from name"
					value={derivedSlug}
					oninput={(event) => {
						slug = (event.currentTarget as HTMLInputElement).value
						slugTouched = true
					}}
				/>
			</label>
			<div class="admin-new-program__row admin-new-program__row--icon">
				<span>Icon</span>
				<div class="admin-new-program__icons">
					{#each ICON_OPTIONS as option}
						<button
							type="button"
							class="admin-new-program__icon"
							class:admin-new-program__icon--on={icon === option}
							aria-label={`Use ${option}`}
							onclick={() => (icon = option)}
						>
							{option}
						</button>
					{/each}
				</div>
			</div>
		</AdminGroupedCard>

		<h4>HERO</h4>
		<AdminGroupedCard>
			<label class="admin-new-program__row">
				<span>Subtitle</span>
				<input
					class="ui-form-control"
					type="text"
					placeholder="One-line tagline"
					bind:value={subtitle}
				/>
			</label>
			<label class="admin-new-program__row">
				<span>Description</span>
				<input
					class="ui-form-control"
					type="text"
					placeholder="Short description shown on the program page"
					bind:value={description}
				/>
			</label>
		</AdminGroupedCard>

		<h4>VISIBILITY</h4>
		<AdminGroupedCard>
			<div class="admin-new-program__row admin-new-program__row--toggle">
				<span>Status</span>
				<div class="admin-new-program__status">
					<button
						type="button"
						class="admin-new-program__status-btn"
						class:admin-new-program__status-btn--on={enabled}
						onclick={() => (enabled = true)}
					>
						Live
					</button>
					<button
						type="button"
						class="admin-new-program__status-btn"
						class:admin-new-program__status-btn--on={!enabled}
						onclick={() => (enabled = false)}
					>
						Draft
					</button>
				</div>
			</div>
		</AdminGroupedCard>

		<p class="admin-new-program__hint">
			You can refine the hero, schedule events, and tweak settings after creating.
		</p>
	</div>
{/if}

<style>
	.admin-new-program {
		display: grid;
		gap: 1rem;
	}

	.admin-new-program__row {
		display: grid;
		grid-template-columns: 8rem 1fr;
		align-items: center;
		gap: 0.875rem;
		padding: 0.65rem 0.875rem;
	}

	.admin-new-program__row > span {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--admin-text-soft);
	}

	.admin-new-program__row--icon {
		align-items: flex-start;
	}

	.admin-new-program__icons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.admin-new-program__icon {
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 0.6rem;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		background: color-mix(in srgb, var(--bg) 90%, var(--text) 10%);
		font-size: 1.2rem;
		cursor: pointer;
		display: grid;
		place-items: center;
		padding: 0;
		transition: all 140ms;
	}

	.admin-new-program__icon:hover {
		border-color: color-mix(in srgb, var(--text) 30%, transparent);
	}

	.admin-new-program__icon--on {
		border-color: var(--admin-selected-border, var(--admin-text-soft));
		background: var(--admin-selected-bg, color-mix(in srgb, var(--text) 8%, transparent));
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-focus-ring, var(--text)) 30%, transparent);
	}

	.admin-new-program__row--toggle {
		align-items: center;
	}

	.admin-new-program__status {
		display: inline-flex;
		gap: 0.4rem;
	}

	.admin-new-program__status-btn {
		min-height: 32px;
		padding: 0 0.85rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		background: color-mix(in srgb, var(--bg) 90%, var(--text) 10%);
		color: color-mix(in srgb, var(--text) 70%, transparent);
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
	}

	.admin-new-program__status-btn--on {
		background: color-mix(in srgb, var(--text) 80%, var(--bg) 20%);
		color: var(--bg);
		border-color: transparent;
	}

	.admin-new-program__hint {
		margin: 0;
		font-size: 0.78rem;
		color: var(--admin-text-muted);
	}

	.admin-new-program__toast {
		bottom: 1rem;
	}

	@media (max-width: 720px) {
		.admin-new-program__row {
			grid-template-columns: 1fr;
			gap: 0.35rem;
		}
	}
</style>
