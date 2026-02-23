<script>
	import PillButton from '../../../primitives/PillButton.svelte'
	const { dashboard, onClose } = $props()
	let advancedOpen = $state(false)

	const accentOptions = [
		{ id: 'default', label: 'Default', eyebrowClass: '', glowClass: '', formGlowClass: '' },
		{ id: 'circus', label: 'Circus', eyebrowClass: 'eyebrow-circus', glowClass: 'glow-circus', formGlowClass: 'form-glow-circus' },
		{ id: 'adventure', label: 'Adventure', eyebrowClass: 'eyebrow-adventure', glowClass: 'glow-adventure', formGlowClass: 'form-glow-adventure' },
		{ id: 'movie', label: 'Movie', eyebrowClass: 'eyebrow-movie', glowClass: 'glow-movie', formGlowClass: 'form-glow-movie' }
	]

	function updateProgramDraft(patch) {
		dashboard.programDraft = { ...dashboard.programDraft, ...patch }
	}

	function currentAccent() {
		return accentOptions.find((option) =>
			dashboard.programDraft.eyebrowClass === option.eyebrowClass
			&& dashboard.programDraft.glowClass === option.glowClass
			&& dashboard.programDraft.formGlowClass === option.formGlowClass
		)?.id ?? 'custom'
	}
</script>

<div class="admin-page__modal-overlay" role="dialog" aria-modal="true">
	<div class="admin-page__modal-card admin-page__program-modal-card">
		<div class="admin-page__section-head admin-page__program-modal-header">
			<h3 class="admin-page__modal-title">{dashboard.selectedProgramSlug ? 'Edit program' : 'Create program'}</h3>
			{#if dashboard.selectedProgramSlug}
				<PillButton className="admin-page__button-secondary admin-page__button-secondary--danger admin-page__button-secondary--compact" variant="danger" size="sm" onClick={dashboard.deleteProgram} disabled={dashboard.programDeleting}>
					{dashboard.programDeleting ? 'Deleting…' : 'Delete'}
				</PillButton>
			{/if}
		</div>

		<div class="admin-page__program-modal-preview">
			<div class="admin-page__program-modal-icon">{dashboard.programDraft.icon || '✨'}</div>
			<div class="admin-page__program-modal-name">{dashboard.programDraft.label || 'Program name'}</div>
			<div class="admin-page__program-modal-url">/calendar/{dashboard.programDraft.slug || 'program-slug'}</div>
		</div>

		<div class="admin-page__program-modal-body">
			<section class="admin-page__program-modal-section">
				<p class="admin-page__program-modal-section-label">Identity</p>
				<div class="admin-page__program-modal-grid">
					<div class="admin-page__program-modal-row admin-page__program-modal-row--icon">
						<div class="admin-page__field">
							<label class="admin-page__field-label" for="program-icon">Icon</label>
							<input id="program-icon" class="admin-page__input admin-page__program-modal-icon-input" value={dashboard.programDraft.icon} oninput={(event) => updateProgramDraft({ icon: event.currentTarget.value })} />
						</div>
						<div class="admin-page__field">
							<label class="admin-page__field-label" for="program-label">Name</label>
							<input id="program-label" class="admin-page__input" value={dashboard.programDraft.label} oninput={(event) => updateProgramDraft({ label: event.currentTarget.value })} />
						</div>
					</div>
					<div class="admin-page__field">
						<label class="admin-page__field-label" for="program-slug">URL path</label>
						<input id="program-slug" class="admin-page__input" value={dashboard.programDraft.slug} oninput={(event) => updateProgramDraft({ slug: event.currentTarget.value })} />
					</div>
				</div>
			</section>

			<section class="admin-page__program-modal-section">
				<p class="admin-page__program-modal-section-label">Landing page</p>
				<div class="admin-page__program-modal-grid">
					<div class="admin-page__field">
						<label class="admin-page__field-label" for="program-eyebrow">Tagline</label>
						<input id="program-eyebrow" class="admin-page__input" value={dashboard.programDraft.eyebrow} oninput={(event) => updateProgramDraft({ eyebrow: event.currentTarget.value })} />
					</div>
					<div class="admin-page__program-modal-row admin-page__program-modal-row--two">
						<div class="admin-page__field">
							<label class="admin-page__field-label" for="program-title-line-1">Big title line 1</label>
							<input id="program-title-line-1" class="admin-page__input" value={dashboard.programDraft.heroTitleLine1} oninput={(event) => updateProgramDraft({ heroTitleLine1: event.currentTarget.value })} />
						</div>
						<div class="admin-page__field">
							<label class="admin-page__field-label" for="program-title-line-2">Big title line 2</label>
							<input id="program-title-line-2" class="admin-page__input" value={dashboard.programDraft.heroTitleLine2} oninput={(event) => updateProgramDraft({ heroTitleLine2: event.currentTarget.value })} />
						</div>
					</div>
					<div class="admin-page__field">
						<label class="admin-page__field-label" for="program-subtitle">Subtitle</label>
						<input id="program-subtitle" class="admin-page__input" value={dashboard.programDraft.heroSubtitle} oninput={(event) => updateProgramDraft({ heroSubtitle: event.currentTarget.value })} />
					</div>
					<div class="admin-page__field">
						<label class="admin-page__field-label" for="program-description">Description</label>
						<input id="program-description" class="admin-page__input" value={dashboard.programDraft.description} oninput={(event) => updateProgramDraft({ description: event.currentTarget.value })} />
					</div>
					<div class="admin-page__field">
						<span class="admin-page__field-label">Accent</span>
						<div class="admin-page__program-modal-accent-row" role="radiogroup" aria-label="Program accent">
							{#each accentOptions as option}
								<button
									type="button"
									class="admin-page__program-modal-accent-dot {currentAccent() === option.id ? 'admin-page__program-modal-accent-dot--active' : ''}"
									onclick={() => updateProgramDraft({
										eyebrowClass: option.eyebrowClass,
										glowClass: option.glowClass,
										formGlowClass: option.formGlowClass
									})}
									aria-pressed={currentAccent() === option.id}
									title={option.label}
								></button>
							{/each}
							{#if currentAccent() === 'custom'}
								<span class="admin-page__program-modal-custom-note">Custom classes active</span>
							{/if}
						</div>
					</div>
				</div>
			</section>

			<section class="admin-page__program-modal-section">
				<div class="admin-page__program-modal-toggle-row">
					<div>
						<p class="admin-page__program-modal-toggle-label">Accepting bookings</p>
						<p class="admin-page__program-modal-toggle-hint">Friends can see and book this program</p>
					</div>
					<button
						type="button"
						class="admin-page__program-modal-toggle {dashboard.programDraft.enabled ? 'admin-page__program-modal-toggle--on' : ''}"
						aria-pressed={dashboard.programDraft.enabled}
						aria-label={dashboard.programDraft.enabled ? 'Disable bookings' : 'Enable bookings'}
						onclick={() => updateProgramDraft({ enabled: !dashboard.programDraft.enabled })}
					>
						<span class="admin-page__program-modal-toggle-thumb"></span>
					</button>
				</div>
				<div class="admin-page__field">
					<label class="admin-page__field-label" for="program-service-note">Status note</label>
					<input id="program-service-note" class="admin-page__input" value={dashboard.programDraft.serviceStatusNote} oninput={(event) => updateProgramDraft({ serviceStatusNote: event.currentTarget.value })} />
				</div>
			</section>

			<section class="admin-page__program-modal-section">
				<button type="button" class="admin-page__program-modal-advanced-toggle" aria-expanded={advancedOpen} onclick={() => advancedOpen = !advancedOpen}>
					<span class:admin-page__program-modal-chevron--open={advancedOpen} class="admin-page__program-modal-chevron">›</span>
					Advanced settings
				</button>
				<div class="admin-page__program-modal-advanced {advancedOpen ? 'admin-page__program-modal-advanced--open' : ''}">
					<div class="admin-page__program-modal-advanced-card">
						<div class="admin-page__program-modal-row admin-page__program-modal-row--two">
							<div class="admin-page__field">
								<label class="admin-page__field-label" for="program-page-title">Page title override</label>
								<input id="program-page-title" class="admin-page__input" value={dashboard.programDraft.pageTitle} oninput={(event) => updateProgramDraft({ pageTitle: event.currentTarget.value })} />
							</div>
							<div class="admin-page__field">
								<label class="admin-page__field-label" for="program-activity-name">Activity name</label>
								<input id="program-activity-name" class="admin-page__input" value={dashboard.programDraft.activityName} oninput={(event) => updateProgramDraft({ activityName: event.currentTarget.value })} />
							</div>
						</div>
						<div class="admin-page__field admin-page__program-modal-sort-field">
							<label class="admin-page__field-label" for="program-sort-order">Sort order</label>
							<input id="program-sort-order" class="admin-page__input admin-page__input--number" type="number" value={dashboard.programDraft.sortOrder} oninput={(event) => updateProgramDraft({ sortOrder: Number(event.currentTarget.value) || 0 })} />
						</div>
						<div class="admin-page__program-modal-row admin-page__program-modal-row--three">
							<div class="admin-page__field">
								<label class="admin-page__field-label" for="program-eyebrow-class">Eyebrow class</label>
								<input id="program-eyebrow-class" class="admin-page__input" value={dashboard.programDraft.eyebrowClass} oninput={(event) => updateProgramDraft({ eyebrowClass: event.currentTarget.value })} />
							</div>
							<div class="admin-page__field">
								<label class="admin-page__field-label" for="program-glow-class">Glow class</label>
								<input id="program-glow-class" class="admin-page__input" value={dashboard.programDraft.glowClass} oninput={(event) => updateProgramDraft({ glowClass: event.currentTarget.value })} />
							</div>
							<div class="admin-page__field">
								<label class="admin-page__field-label" for="program-form-glow-class">Form glow class</label>
								<input id="program-form-glow-class" class="admin-page__input" value={dashboard.programDraft.formGlowClass} oninput={(event) => updateProgramDraft({ formGlowClass: event.currentTarget.value })} />
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>

		<div class="admin-page__modal-actions admin-page__program-modal-actions">
			<PillButton className="admin-page__button-secondary" variant="secondary" onClick={onClose}>Cancel</PillButton>
			<PillButton className="admin-page__button-secondary" variant="secondary" onClick={async () => { await dashboard.saveProgram(); if (!dashboard.error) onClose(); }} disabled={dashboard.programSaving}>
				{dashboard.programSaving ? 'Saving…' : 'Save Program'}
			</PillButton>
		</div>
	</div>
</div>
