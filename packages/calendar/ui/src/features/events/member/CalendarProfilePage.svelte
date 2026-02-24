<script>
	import { saveCalendarProfile } from '../../../api/calendar'
	import { getCalendarUiConfig } from '../../../config'
	import PillButton from '../../../primitives/PillButton.svelte'
import Hero from '../../../primitives/Hero.svelte'
	let { data } = $props()
	let emergencyContact = $derived(data.profile?.emergencyContact ?? '')
	let dietaryRestrictions = $derived(data.profile?.dietaryRestrictions ?? '')
	let chatHandle = $derived(data.profile?.chatHandle ?? '')
	let saving = $state(false)
	let status = $state('')
	const calendarConfig = getCalendarUiConfig()

	async function save() {
		saving = true
		status = ''
		try {
			await saveCalendarProfile({
				emergencyContact,
				dietaryRestrictions,
				chatHandle
			})
			status = 'Saved.'
		} catch (error) {
			status = error instanceof Error ? error.message : 'Failed to save profile'
		} finally {
			saving = false
		}
	}

</script>

<svelte:head>
	<title>Profile | {calendarConfig.brand.calendarName} | {calendarConfig.brand.siteName}</title>
</svelte:head>

<div class="calendar-page calendar-home">
	<Hero
		className="calendar-page__hero calendar-home__hero"
		glowClass="calendar-page__hero-glow calendar-home__glow"
		eyebrowClass="calendar-page__eyebrow calendar-home__eyebrow"
		subtitleClass="calendar-page__subtitle calendar-home__sub"
		eyebrow="Profile"
		title="Your member profile."
		subtitle="Keep logistics in one place so sessions coordinate faster."
	/>

	<section class="calendar-page__section calendar-home__section">
		<div class="calendar-home__event-card">
			<div class="calendar-home__event-meta calendar-profile__event-meta">
				<h3>Safety + logistics</h3>
				<p>Only admins can see this information.</p>
				<div class="admin-page__fields-grid calendar-profile__fields-grid">
					<div class="admin-page__field">
						<label class="admin-page__field-label" for="profile-emergency-contact">Emergency contact</label>
						<input id="profile-emergency-contact" class="admin-page__input" type="text" bind:value={emergencyContact} />
					</div>
					<div class="admin-page__field">
						<label class="admin-page__field-label" for="profile-dietary-restrictions">Dietary restrictions</label>
						<input id="profile-dietary-restrictions" class="admin-page__input" type="text" bind:value={dietaryRestrictions} />
					</div>
					<div class="admin-page__field">
						<label class="admin-page__field-label" for="profile-chat-handle">Discord/Chat handle</label>
						<input id="profile-chat-handle" class="admin-page__input" type="text" bind:value={chatHandle} />
					</div>
				</div>
				<div class="calendar-profile__actions">
						<PillButton className="calendar-page__primary-button" variant="primary" size="lg" onClick={save} disabled={saving}>
							{saving ? 'Saving...' : 'Save profile'}
						</PillButton>
					<PillButton
						className="calendar-page__ghost-button"
						variant="ghost"
						size="md"
						href={`${calendarConfig.routes.apiCalendarBase}/ics`}
						target="_blank"
						rel="noopener noreferrer"
					>
						Subscribe (.ics)
					</PillButton>
					{#if status}<span class="calendar-page__status-text--muted">{status}</span>{/if}
				</div>
			</div>
		</div>
	</section>

</div>

<style>
	.calendar-profile__event-meta {
		width: 100%;
	}

	.calendar-profile__fields-grid {
		margin-top: 0.9rem;
	}

	.calendar-profile__actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		margin-top: 0.7rem;
	}
</style>
