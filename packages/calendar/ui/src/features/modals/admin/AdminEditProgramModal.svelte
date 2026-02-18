<script>
	import PillButton from '../../../primitives/PillButton.svelte'
	const { dashboard, onClose } = $props()
</script>

<div class="admin-page__modal-overlay" role="dialog" aria-modal="true">
	<div class="admin-page__modal-card" style="max-width: 60rem;">
		<div class="admin-page__section-head">
			<h3 class="admin-page__modal-title">{dashboard.selectedProgramSlug ? `Edit ${dashboard.selectedProgramSlug}` : 'Create Program'}</h3>
			{#if dashboard.selectedProgramSlug}
				<PillButton className="admin-page__button-secondary admin-page__button-secondary--danger admin-page__button-secondary--compact" variant="danger" size="sm" onClick={dashboard.deleteProgram} disabled={dashboard.programDeleting}>
					{dashboard.programDeleting ? 'Deleting...' : 'Delete'}
				</PillButton>
			{/if}
		</div>

		<div class="admin-page__fields-grid">
			<div class="admin-page__fields-row admin-page__fields-row--invite">
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-slug">Slug</label><input id="program-slug" class="admin-page__input" value={dashboard.programDraft.slug} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, slug: e.currentTarget.value }} /></div>
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-label">Label</label><input id="program-label" class="admin-page__input" value={dashboard.programDraft.label} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, label: e.currentTarget.value }} /></div>
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-activity-name">Activity name</label><input id="program-activity-name" class="admin-page__input" value={dashboard.programDraft.activityName} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, activityName: e.currentTarget.value }} /></div>
			</div>

			<div class="admin-page__fields-row admin-page__fields-row--invite">
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-page-title">Page title</label><input id="program-page-title" class="admin-page__input" value={dashboard.programDraft.pageTitle} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, pageTitle: e.currentTarget.value }} /></div>
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-icon">Icon</label><input id="program-icon" class="admin-page__input" value={dashboard.programDraft.icon} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, icon: e.currentTarget.value }} /></div>
				<div class="admin-page__field admin-page__field--uses"><label class="admin-page__field-label" for="program-sort-order">Sort</label><input id="program-sort-order" class="admin-page__input admin-page__input--number" type="number" value={dashboard.programDraft.sortOrder} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, sortOrder: Number(e.currentTarget.value) || 0 }} /></div>
			</div>

			<div class="admin-page__fields-row admin-page__fields-row--invite">
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-eyebrow">Eyebrow</label><input id="program-eyebrow" class="admin-page__input" value={dashboard.programDraft.eyebrow} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, eyebrow: e.currentTarget.value }} /></div>
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-title-line-1">Hero title line 1</label><input id="program-title-line-1" class="admin-page__input" value={dashboard.programDraft.heroTitleLine1} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, heroTitleLine1: e.currentTarget.value }} /></div>
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-title-line-2">Hero title line 2</label><input id="program-title-line-2" class="admin-page__input" value={dashboard.programDraft.heroTitleLine2} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, heroTitleLine2: e.currentTarget.value }} /></div>
			</div>

			<div class="admin-page__fields-row admin-page__fields-row--invite">
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-subtitle">Hero subtitle</label><input id="program-subtitle" class="admin-page__input" value={dashboard.programDraft.heroSubtitle} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, heroSubtitle: e.currentTarget.value }} /></div>
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-description">Description</label><input id="program-description" class="admin-page__input" value={dashboard.programDraft.description} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, description: e.currentTarget.value }} /></div>
			</div>

			<div class="admin-page__fields-row admin-page__fields-row--invite">
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-eyebrow-class">Eyebrow class</label><input id="program-eyebrow-class" class="admin-page__input" value={dashboard.programDraft.eyebrowClass} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, eyebrowClass: e.currentTarget.value }} /></div>
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-glow-class">Glow class</label><input id="program-glow-class" class="admin-page__input" value={dashboard.programDraft.glowClass} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, glowClass: e.currentTarget.value }} /></div>
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-form-glow-class">Form glow class</label><input id="program-form-glow-class" class="admin-page__input" value={dashboard.programDraft.formGlowClass} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, formGlowClass: e.currentTarget.value }} /></div>
			</div>

			<div class="admin-page__fields-row admin-page__fields-row--invite">
				<div class="admin-page__field"><label class="admin-page__field-label" for="program-service-note">Service status note</label><input id="program-service-note" class="admin-page__input" value={dashboard.programDraft.serviceStatusNote} oninput={(e) => dashboard.programDraft = { ...dashboard.programDraft, serviceStatusNote: e.currentTarget.value }} /></div>
				<div class="admin-page__field admin-page__field--uses"><label class="admin-page__field-label" for="program-enabled">Enabled</label><select id="program-enabled" class="admin-page__input" value={dashboard.programDraft.enabled ? '1' : '0'} onchange={(e) => dashboard.programDraft = { ...dashboard.programDraft, enabled: e.currentTarget.value === '1' }}><option value="1">Enabled</option><option value="0">Disabled</option></select></div>
			</div>
		</div>

		<div class="admin-page__modal-actions">
			<PillButton className="admin-page__button-secondary" variant="secondary" onClick={onClose}>Cancel</PillButton>
			<PillButton className="admin-page__button-secondary" variant="secondary" onClick={async () => { await dashboard.saveProgram(); if (!dashboard.error) onClose(); }} disabled={dashboard.programSaving}>
				{dashboard.programSaving ? 'Saving...' : 'Save Program'}
			</PillButton>
		</div>
	</div>
</div>
