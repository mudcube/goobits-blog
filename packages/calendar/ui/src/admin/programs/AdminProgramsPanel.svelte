<script>
	import PillButton from '../../primitives/PillButton.svelte'
	import AdminEditProgramModal from './AdminEditProgramModal.svelte'
	import { getCalendarUiConfig } from '../../config'
	const { dashboard } = $props()
	const calendarConfig = getCalendarUiConfig()
	let showProgramModal = $state(false)
</script>

<h1 class="admin-page__title">Programs</h1>
<p class="admin-page__subtitle">Create and edit dynamic calendar routes, hero content, and visual treatment.</p>

{#if dashboard.error}
	<div class="admin-page__section admin-page__section--error">
		<p class="admin-page__calendar-error">{dashboard.error}</p>
	</div>
{/if}

<div class="admin-page__section">
	<div class="admin-page__section-head">
		<h3 class="admin-page__section-title">Program list</h3>
		<div class="admin-page__button-row admin-page__button-row--compact">
			<PillButton
				className="admin-page__button-secondary admin-page__button-secondary--compact"
				variant="secondary"
				size="sm"
				onClick={() => {
					dashboard.newProgramDraft()
					showProgramModal = true
				}}
			>
				New Program
			</PillButton>
		</div>
	</div>
	{#if dashboard.programsLoading}
		<p class="admin-page__section-description">Loading programs...</p>
	{:else}
		<div class="admin-page__members-list">
			{#each dashboard.programs as program, i}
				<div class="admin-page__members-row">
					<div class="admin-page__members-main">
						<div class="admin-page__members-code-row">
							<strong>{program.label}</strong>
							<span class="admin-page__members-meta"> · {calendarConfig.routes.calendarBase}/{program.slug}</span>
						</div>
						<div class="admin-page__members-meta">
							{program.description}
							{#if program.serviceStatusNote} · {program.serviceStatusNote}{/if}
						</div>
					</div>
					<div class="admin-page__members-actions">
						<PillButton className="admin-page__button-secondary admin-page__button-secondary--compact" variant="secondary" size="sm" href={program.href} target="_blank" rel="noopener noreferrer">Open</PillButton>
						<PillButton
							className="admin-page__button-secondary admin-page__button-secondary--compact"
							variant="secondary"
							size="sm"
							onClick={() => {
								dashboard.selectProgram(program.slug)
								showProgramModal = true
							}}
						>
							Edit
						</PillButton>
						<PillButton
							className={`admin-page__button-secondary admin-page__button-secondary--compact ${program.enabled ? 'admin-page__button-secondary--danger' : ''}`}
							variant={program.enabled ? 'danger' : 'secondary'}
							size="sm"
							onClick={() => dashboard.toggleProgram(program.slug, !program.enabled)}
							disabled={dashboard.programUpdatingSlug === program.slug}
						>
							{dashboard.programUpdatingSlug === program.slug ? 'Saving...' : (program.enabled ? 'Disable' : 'Enable')}
						</PillButton>
					</div>
				</div>
				{#if i < dashboard.programs.length - 1}<div class="admin-page__booking-divider"></div>{/if}
			{/each}
		</div>
	{/if}
</div>

{#if showProgramModal}
	<AdminEditProgramModal {dashboard} onClose={() => showProgramModal = false} />
{/if}
