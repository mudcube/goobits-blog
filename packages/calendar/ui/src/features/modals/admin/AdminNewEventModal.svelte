<script>
	import PillButton from '../../../primitives/PillButton.svelte'
	const { dashboard, onClose } = $props()
</script>

<div class="admin-page__modal-overlay" role="dialog" aria-modal="true">
	<div class="admin-page__modal-card" style="max-width: 52rem;">
		<h3 class="admin-page__modal-title">New Event</h3>
		<p class="admin-page__modal-subtitle">Create one event or a weekly series.</p>

		{#if dashboard.eventTemplates.length > 0}
			<div class="admin-page__field admin-page__field--email">
				<label class="admin-page__field-label" for="event-template-copy">Copy from</label>
				<select
					id="event-template-copy"
					class="admin-page__input"
					onchange={(event) => {
						const value = Number(event.currentTarget.value)
						if (Number.isFinite(value) && value > 0) dashboard.applyTemplate(value)
					}}
				>
					<option value="">Select past event…</option>
					{#each dashboard.eventTemplates as template}
						<option value={template.id}>{template.title}</option>
					{/each}
				</select>
			</div>
		{/if}

		<div class="admin-page__fields-grid">
			<div class="admin-page__fields-row admin-page__fields-row--invite">
				<div class="admin-page__field admin-page__field--email">
					<label class="admin-page__field-label" for="event-draft-activity">Program</label>
					<select
						id="event-draft-activity"
						class="admin-page__input"
						value={dashboard.eventDraft.activitySlug}
						onchange={(event) => dashboard.eventDraft = { ...dashboard.eventDraft, activitySlug: event.currentTarget.value }}
					>
						{#each dashboard.enabledPrograms as activity}
							<option value={activity.slug}>{activity.label}</option>
						{/each}
					</select>
				</div>
				<div class="admin-page__field admin-page__field--email">
					<label class="admin-page__field-label" for="event-draft-title">Title</label>
					<input id="event-draft-title" class="admin-page__input" type="text" value={dashboard.eventDraft.title} oninput={(event) => dashboard.eventDraft = { ...dashboard.eventDraft, title: event.currentTarget.value }} />
				</div>
			</div>

			<div class="admin-page__fields-row admin-page__fields-row--invite">
				<div class="admin-page__field">
					<label class="admin-page__field-label" for="event-draft-starts">Starts</label>
					<input id="event-draft-starts" class="admin-page__input" type="datetime-local" value={dashboard.eventDraft.startsAt} oninput={(event) => dashboard.eventDraft = { ...dashboard.eventDraft, startsAt: event.currentTarget.value }} />
				</div>
				<div class="admin-page__field">
					<label class="admin-page__field-label" for="event-draft-ends">Ends</label>
					<input id="event-draft-ends" class="admin-page__input" type="datetime-local" value={dashboard.eventDraft.endsAt} oninput={(event) => dashboard.eventDraft = { ...dashboard.eventDraft, endsAt: event.currentTarget.value }} />
				</div>
				<div class="admin-page__field admin-page__field--uses">
					<label class="admin-page__field-label" for="event-draft-capacity">Capacity</label>
					<input id="event-draft-capacity" class="admin-page__input admin-page__input--number" type="number" min="1" max="50" value={dashboard.eventDraft.capacity} oninput={(event) => dashboard.eventDraft = { ...dashboard.eventDraft, capacity: Number(event.currentTarget.value) || 1 }} />
				</div>
				<div class="admin-page__field admin-page__field--expires">
					<label class="admin-page__field-label" for="event-draft-repeat">Repeat weeks</label>
					<input id="event-draft-repeat" class="admin-page__input admin-page__input--number" type="number" min="0" max="24" value={dashboard.eventDraft.repeatWeeks} oninput={(event) => dashboard.eventDraft = { ...dashboard.eventDraft, repeatWeeks: Number(event.currentTarget.value) || 0 }} />
				</div>
			</div>

			<div class="admin-page__fields-row admin-page__fields-row--invite">
				<div class="admin-page__field admin-page__field--uses">
					<label class="admin-page__field-label" for="event-draft-cost">Cost (cents)</label>
					<input id="event-draft-cost" class="admin-page__input admin-page__input--number" type="number" min="0" max="200000" value={dashboard.eventDraft.costCents} oninput={(event) => dashboard.eventDraft = { ...dashboard.eventDraft, costCents: Number(event.currentTarget.value) || 0 }} />
				</div>
				<div class="admin-page__field admin-page__field--expires">
					<label class="admin-page__field-label" for="event-draft-provider">Payment provider</label>
					<select id="event-draft-provider" class="admin-page__input" value={dashboard.eventDraft.paymentProvider} onchange={(event) => dashboard.eventDraft = { ...dashboard.eventDraft, paymentProvider: event.currentTarget.value }}>
						<option value="venmo">Venmo</option>
						<option value="cashapp">Cash App</option>
						<option value="paypal">PayPal</option>
						<option value="">None</option>
					</select>
				</div>
				<div class="admin-page__field admin-page__field--email">
					<label class="admin-page__field-label" for="event-draft-handle">Payment handle</label>
					<input id="event-draft-handle" class="admin-page__input" type="text" value={dashboard.eventDraft.paymentHandle} oninput={(event) => dashboard.eventDraft = { ...dashboard.eventDraft, paymentHandle: event.currentTarget.value }} />
				</div>
				<div class="admin-page__field admin-page__field--email">
					<label class="admin-page__field-label" for="event-draft-note-template">Payment note</label>
					<input id="event-draft-note-template" class="admin-page__input" type="text" value={dashboard.eventDraft.paymentNoteTemplate} oninput={(event) => dashboard.eventDraft = { ...dashboard.eventDraft, paymentNoteTemplate: event.currentTarget.value }} />
				</div>
			</div>
		</div>

		<div class="admin-page__modal-actions">
			<PillButton className="admin-page__button-secondary" variant="secondary" onClick={onClose}>Cancel</PillButton>
			<PillButton className="admin-page__button-secondary" variant="secondary" onClick={async () => { await dashboard.createEvents(); if (!dashboard.error) onClose(); }} disabled={dashboard.eventsCreating}>
				{dashboard.eventsCreating ? 'Creating…' : 'Create Event'}
			</PillButton>
		</div>
	</div>
</div>
