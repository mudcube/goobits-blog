<script lang="ts">
	import { onMount } from 'svelte'
	import { ChevronRight } from '@lucide/svelte'
	import { Hero, FormField, PageShell, PillButton } from '@miko/ui'
	import { superForm } from 'sveltekit-superforms'
	import { zod4Client as zodClient } from 'sveltekit-superforms/adapters'
	import { initializeAntiAbuseFields } from '$lib/client/antiabuse'
	import { contactSchema, getContactContextLabel, getContactMessagePlaceholder, type ContactFormData } from './schema'
	import type { SuperValidated } from 'sveltekit-superforms'

	const props = $props<{ form: SuperValidated<ContactFormData>; turnstileSiteKey?: string }>()
	const contactForm = superForm(props.form, {
		validators: zodClient(contactSchema),
		validationMethod: 'onblur',
		clearOnSubmit: 'message'
	})

	const { form: formData, errors, enhance, submitting } = contactForm

	function updateField<K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) {
		formData.update((current) => ({ ...current, [key]: value }))
	}

	onMount(() => {
		const fields = initializeAntiAbuseFields('miko_contact_device_id')
		formData.update((current) => ({
			...current,
			started_at: fields.startedAt,
			device_id: fields.deviceId
		}))
	})
</script>

<svelte:head>
	<title>Contact - MIKO.ART</title>
	{#if props.turnstileSiteKey}
		<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
	{/if}
</svelte:head>

<PageShell className="contact-page">
	<Hero
		className="contact-page__hero"
		eyebrow="Contact"
		title="Say Hello"
		titleClass="contact-page__hero-title"
		icon="/media/contact-email-heart.png"
		iconAlt="Email heart icon"
		subtitle="Got a question, a project idea, or just want to chat? Drop me a line."
		compact
	/>

	<section class="contact-page__layout">
		<div class="contact-page__form-section">
			<form method="POST" class="contact-page__form" use:enhance novalidate>
				<input type="hidden" name="from" value={$formData.from} />
				<input type="hidden" name="topic" value={$formData.topic} />
				<input type="hidden" name="started_at" value={$formData.started_at} />
				<input type="hidden" name="device_id" value={$formData.device_id} />
				<label class="contact-page__hp" aria-hidden="true">
					<span>Website</span>
					<input
						type="text"
						name="website"
						value={$formData.website}
						tabindex="-1"
						autocomplete="off"
						oninput={(event) => updateField('website', event.currentTarget.value)}
					/>
				</label>
				{#if getContactContextLabel($formData)}
					<p class="contact-page__context">Context: {getContactContextLabel($formData)}</p>
				{/if}

				<FormField className="contact-page__field" forId="contact-name" error={Array.isArray($errors['name']) ? $errors['name'][0] : undefined} required>
					<div class:contact-page__control--active={$formData.name.trim().length > 0} class="contact-page__control">
						<input
							id="contact-name"
							class="ui-form-control ui-form-control--quiet"
							type="text"
							name="name"
							value={$formData.name}
							autocomplete="name"
							placeholder=" "
							oninput={(event) => updateField('name', event.currentTarget.value)}
						/>
						<label class="contact-page__floating-label" for="contact-name">Name</label>
					</div>
				</FormField>

				<FormField className="contact-page__field" forId="contact-email" error={Array.isArray($errors['email']) ? $errors['email'][0] : undefined} required>
					<div class:contact-page__control--active={$formData.email.trim().length > 0} class="contact-page__control">
						<input
							id="contact-email"
							class="ui-form-control ui-form-control--quiet"
							type="email"
							name="email"
							value={$formData.email}
							autocomplete="email"
							placeholder=" "
							oninput={(event) => updateField('email', event.currentTarget.value)}
						/>
						<label class="contact-page__floating-label" for="contact-email">Email</label>
					</div>
				</FormField>

				<FormField className="contact-page__field" forId="contact-message" error={Array.isArray($errors['message']) ? $errors['message'][0] : undefined} required>
					<div class:contact-page__control--active={$formData.message.trim().length > 0} class="contact-page__control contact-page__control--textarea">
						<textarea
							id="contact-message"
							class="ui-form-control ui-form-control--quiet ui-form-control--textarea"
							name="message"
							placeholder={getContactMessagePlaceholder($formData)}
							oninput={(event) => updateField('message', event.currentTarget.value)}
						>{$formData.message}</textarea>
						<label class="contact-page__floating-label" for="contact-message">Message</label>
					</div>
				</FormField>

				{#if $errors._errors?.length}
					<p class="contact-page__submit-error">{$errors._errors[0]}</p>
				{/if}

				{#if props.turnstileSiteKey}
					<div class="cf-turnstile" data-sitekey={props.turnstileSiteKey}></div>
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
					src="/media/super-racoon.svg"
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
	.contact-page__hp {
		position: absolute;
		left: -100vw;
		top: auto;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}
</style>
