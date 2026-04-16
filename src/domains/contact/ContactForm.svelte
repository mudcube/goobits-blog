<script lang="ts">
	import { onMount } from 'svelte'
	import { ChevronRight } from '@lucide/svelte'
	import { Hero, FormField, PageShell, PillButton } from '@miko/ui'
	import { superForm } from 'sveltekit-superforms'
	import { zod4Client as zodClient } from 'sveltekit-superforms/adapters'
	import AntiAbuseFields from '$lib/forms/AntiAbuseFields.svelte'
	import { seedAntiAbuseFields } from '$lib/forms/antiabuse'
	import TurnstileScript from '$lib/forms/TurnstileScript.svelte'
	import VerificationField from '$lib/forms/VerificationField.svelte'
	import { contactSchema, type ContactFormData } from './schema'
	import { getContactMessagePlaceholder } from './viewmodel'
	import type { SuperValidated } from 'sveltekit-superforms'

	const { form, turnstileSiteKey } = $props<{ form: SuperValidated<ContactFormData>; turnstileSiteKey?: string }>()
	const contactForm = (() =>
		superForm(form, {
			validators: zodClient(contactSchema),
			validationMethod: 'onblur',
			clearOnSubmit: 'message'
		}))()

	const { form: formData, errors, enhance, submitting } = contactForm

	function updateField<K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) {
		formData.update((current) => ({ ...current, [key]: value }))
	}

	onMount(() => {
		seedAntiAbuseFields('miko_contact_device_id', formData.update)
	})
</script>

<TurnstileScript siteKey={turnstileSiteKey} />

<PageShell className="contact-page">
	<Hero
		className="contact-page__hero"
		eyebrow="Contact"
		title="Say Hello"
		titleClass="contact-page__hero-title"
		icon="/media/page-icons/contact-email-heart.png"
		iconAlt="Email heart icon"
		subtitle="Got a question, a project idea, or just want to chat? Drop me a line."
		compact
	/>

	<section class="contact-page__layout">
		<div class="contact-page__form-section">
			<form method="POST" class="contact-page__form" use:enhance novalidate>
				<input type="hidden" name="from" value={$formData.from} />
				<input type="hidden" name="topic" value={$formData.topic} />
				<AntiAbuseFields
					startedAt={$formData.started_at}
					deviceId={$formData.device_id}
					website={$formData.website}
					onWebsiteInput={(value) => updateField('website', value)}
					honeypotClassName="contact-page__hp"
				/>
				<FormField className="contact-page__field" label="Name" forId="contact-name" error={Array.isArray($errors['name']) ? $errors['name'][0] : undefined} required>
					<div class="contact-page__control">
						<input
							id="contact-name"
							class="ui-form-control contact-page__input"
							type="text"
							name="name"
							value={$formData.name}
							autocomplete="name"
							placeholder="What should I call you?"
							oninput={(event) => updateField('name', event.currentTarget.value)}
						/>
					</div>
				</FormField>

				<FormField className="contact-page__field" label="Email" forId="contact-email" error={Array.isArray($errors['email']) ? $errors['email'][0] : undefined} required>
					<div class="contact-page__control">
						<input
							id="contact-email"
							class="ui-form-control contact-page__input"
							type="email"
							name="email"
							value={$formData.email}
							autocomplete="email"
							placeholder="you@email.com"
							oninput={(event) => updateField('email', event.currentTarget.value)}
						/>
					</div>
				</FormField>

				<FormField className="contact-page__field" label="Message" forId="contact-message" error={Array.isArray($errors['message']) ? $errors['message'][0] : undefined} required>
					<div class="contact-page__control contact-page__control--textarea">
						<textarea
							id="contact-message"
							class="ui-form-control ui-form-control--textarea contact-page__input contact-page__textarea"
							name="message"
							placeholder={getContactMessagePlaceholder($formData)}
							oninput={(event) => updateField('message', event.currentTarget.value)}
						>{$formData.message}</textarea>
					</div>
				</FormField>

				{#if $errors._errors?.length}
					<p class="contact-page__submit-error">{$errors._errors[0]}</p>
				{/if}

				{#if turnstileSiteKey}
					<VerificationField className="contact-page__verification" siteKey={turnstileSiteKey} />
				{/if}

				<PillButton className="contact-page__submit" type="submit" variant="primary" size="lg" disabled={$submitting}>
					{$submitting ? 'Sending…' : 'Send message'}
					{#if !$submitting}
						<ChevronRight class="contact-page__submit-icon" size={18} strokeWidth={2.4} aria-hidden="true" />
					{/if}
				</PillButton>

				<p class="contact-page__legal-note">
					By sending this form you agree to our <a href="/privacy">Privacy Policy</a>,
					<a href="/terms">Terms</a>, and
					<a href="/cookies">Cookie Policy</a>.
				</p>
			</form>
		</div>
		<aside class="contact-page__aside">
			<section class="contact-page__aside-section">
				<p class="contact-page__aside-label">Response time</p>
				<p>I usually reply within a day or two. A short note about scope and timeline helps me get back faster.</p>
			</section>
			<section class="contact-page__aside-section">
				<p class="contact-page__aside-label">Elsewhere</p>
				<nav class="contact-page__aside-links" aria-label="Social profiles">
					<a href="https://github.com/mudcube" target="_blank" rel="noreferrer noopener nofollow">GitHub ↗</a>
				</nav>
			</section>
			<div class="contact-page__raccoon-wrap">
				<img
					class="contact-page__image"
					src="/media/decor/super-racoon.svg"
					alt="Raccoon illustration"
					width="180"
					height="180"
					loading="lazy"
					decoding="async"
				/>
			</div>
		</aside>
	</section>
</PageShell>

<style lang="scss">
	:global(.contact-page__hp) {
		position: absolute;
		left: -100vw;
		top: auto;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}
</style>
