<script lang="ts">
	import { untrack } from 'svelte'
	import { saveCalendarProfile } from '../../api/calendar'
	import { getCalendarUiConfig } from '../../config'
	import { CalendarDays } from '@lucide/svelte'
	import PillButton from '../../primitives/CalendarPillButton.svelte'
	import CalendarPageHero from '../../primitives/CalendarPageHero.svelte'

	const { data } = $props<{ data: { profile?: { emergencyContact?: string; dietaryRestrictions?: string; chatHandle?: string } } }>()

	let emergencyContact = $state(untrack(() => data.profile?.emergencyContact ?? ''))
	let dietaryRestrictions = $state(untrack(() => data.profile?.dietaryRestrictions ?? ''))
	let chatHandle = $state(untrack(() => data.profile?.chatHandle ?? ''))

	let safetySaving = $state(false)
	let safetyStatus = $state('')
	let logisticsSaving = $state(false)
	let logisticsStatus = $state('')

	const calendarConfig = getCalendarUiConfig()
	const icsHref = `${calendarConfig.routes.apiCalendarBase}/ics`

	async function persist(setSaving: (v: boolean) => void, setStatus: (v: string) => void) {
		setSaving(true)
		setStatus('')
		try {
			await saveCalendarProfile({ emergencyContact, dietaryRestrictions, chatHandle })
			setStatus('Saved.')
			setTimeout(() => setStatus(''), 2000)
		} catch (error) {
			setStatus(error instanceof Error ? error.message : 'Failed to save.')
		} finally {
			setSaving(false)
		}
	}

	const saveSafety = () =>
		persist(
			(value) => (safetySaving = value),
			(value) => (safetyStatus = value)
		)
	const saveLogistics = () =>
		persist(
			(value) => (logisticsSaving = value),
			(value) => (logisticsStatus = value)
		)
</script>

<svelte:head>
	<title>Profile | {calendarConfig.brand.calendarName} | {calendarConfig.brand.siteName}</title>
</svelte:head>

<div class="calendar-page calendar-profile">
	<div class="calendar-profile__panel">
		<CalendarPageHero
			eyebrow="Profile"
			title="Your details"
			subtitle="Keep your info in one place so sessions run smoother."
		/>

		<section class="calendar-profile__section">
			<header class="calendar-profile__section-head">
				<h4>SAFETY</h4>
				<p class="calendar-profile__section-sub">Only admins can see this.</p>
			</header>
			<div class="calendar-profile__field">
				<label class="ui-form-label" for="profile-emergency-contact">Emergency contact</label>
				<input
					id="profile-emergency-contact"
					class="ui-form-control"
					type="text"
					placeholder="Name + phone number"
					bind:value={emergencyContact}
				/>
			</div>
			<div class="calendar-profile__actions">
				<PillButton
					variant="primary"
					size="md"
					onClick={saveSafety}
					disabled={safetySaving}
				>
					{safetySaving ? 'Saving…' : 'Save'}
				</PillButton>
				{#if safetyStatus}
					<span class="calendar-profile__status">{safetyStatus}</span>
				{/if}
			</div>
		</section>

		<section class="calendar-profile__section">
			<header class="calendar-profile__section-head">
				<h4>LOGISTICS</h4>
				<p class="calendar-profile__section-sub">Helps us plan around dietary needs and reach you in chat.</p>
			</header>
			<div class="calendar-profile__field">
				<label class="ui-form-label" for="profile-dietary-restrictions">Dietary restrictions</label>
				<input
					id="profile-dietary-restrictions"
					class="ui-form-control"
					type="text"
					placeholder="e.g. vegetarian, gluten-free"
					bind:value={dietaryRestrictions}
				/>
			</div>
			<div class="calendar-profile__field">
				<label class="ui-form-label" for="profile-chat-handle">Discord / chat handle</label>
				<input
					id="profile-chat-handle"
					class="ui-form-control"
					type="text"
					placeholder="@yourname"
					bind:value={chatHandle}
				/>
			</div>
			<div class="calendar-profile__actions">
				<PillButton
					variant="primary"
					size="md"
					onClick={saveLogistics}
					disabled={logisticsSaving}
				>
					{logisticsSaving ? 'Saving…' : 'Save'}
				</PillButton>
				{#if logisticsStatus}
					<span class="calendar-profile__status">{logisticsStatus}</span>
				{/if}
			</div>
		</section>

		<section class="calendar-profile__section">
			<header class="calendar-profile__section-head">
				<h4>CALENDAR FEED</h4>
				<p class="calendar-profile__section-sub">Subscribe to keep your bookings synced with your own calendar app.</p>
			</header>
			<a class="calendar-profile__feed-link" href={icsHref} target="_blank" rel="noopener noreferrer">
				<span class="calendar-profile__feed-icon" aria-hidden="true">
					<CalendarDays size={16} strokeWidth={1.8} />
				</span>
				<span class="calendar-profile__feed-text">
					<span class="calendar-profile__feed-title">Subscribe (.ics)</span>
					<span class="calendar-profile__feed-detail">One-tap to add to Apple Calendar, Google Calendar, etc.</span>
				</span>
			</a>
		</section>
	</div>
</div>

<style>
	.calendar-profile__panel {
		width: 100%;
		max-width: 640px;
		margin: 0 auto;
		padding: 1.1rem 1rem 2.5rem;
		display: grid;
		gap: 1.4rem;
	}

	.calendar-profile__section {
		display: grid;
		gap: 0.85rem;
	}

	.calendar-profile__section-head {
		display: grid;
		gap: 0.2rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
	}

	.calendar-profile__section-head h4 {
		margin: 0;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--text) 70%, transparent);
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	.calendar-profile__section-sub {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 420;
		font-style: italic;
		color: color-mix(in srgb, var(--text) 56%, transparent);
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	.calendar-profile__field {
		display: grid;
		gap: 0.35rem;
	}

	.calendar-profile__field :global(.ui-form-label) {
		font-size: 0.74rem;
		font-weight: 540;
		font-family: var(--font-ui-sans, var(--font-sans));
		color: color-mix(in srgb, var(--text) 60%, transparent);
	}

	.calendar-profile__field :global(.ui-form-control) {
		min-height: 2.5rem;
		padding: 0 0.85rem;
		font-size: 0.86rem;
		border-radius: 0.625rem;
		border: 1px solid color-mix(in srgb, var(--text) 16%, transparent);
		background: color-mix(in srgb, var(--text) 3%, var(--bg) 97%);
		color: var(--text);
		font-family: var(--font-ui-sans, var(--font-sans));
		transition: border-color 140ms ease, background 140ms ease;
	}

	.calendar-profile__field :global(.ui-form-control:focus) {
		outline: none;
		border-color: color-mix(in srgb, var(--link) 60%, transparent);
		background: var(--bg);
	}

	.calendar-profile__actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 0.2rem;
	}

	.calendar-profile__status {
		font-size: 0.78rem;
		font-style: italic;
		font-weight: 460;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	.calendar-profile__feed-link {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 1rem;
		border-radius: 0.7rem;
		border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		background: color-mix(in srgb, var(--text) 3%, var(--bg) 97%);
		color: inherit;
		text-decoration: none;
		transition: border-color 140ms ease, background 140ms ease, transform 140ms ease;
	}

	.calendar-profile__feed-link:hover {
		border-color: color-mix(in srgb, var(--link) 36%, transparent);
		background: color-mix(in srgb, var(--link) 5%, var(--bg) 95%);
		transform: translateY(-1px);
	}

	.calendar-profile__feed-icon {
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 999px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background: color-mix(in srgb, var(--link) 14%, transparent);
		color: color-mix(in srgb, var(--link) 80%, var(--text) 20%);
	}

	.calendar-profile__feed-text {
		display: grid;
		gap: 0.15rem;
	}

	.calendar-profile__feed-title {
		font-size: 0.86rem;
		font-weight: 600;
		font-family: var(--font-ui-sans, var(--font-sans));
	}

	.calendar-profile__feed-detail {
		font-size: 0.74rem;
		font-weight: 420;
		font-style: italic;
		font-family: var(--font-ui-sans, var(--font-sans));
		color: color-mix(in srgb, var(--text) 56%, transparent);
	}
</style>
