<script lang="ts">
	import { onMount } from 'svelte'
	import { Seo } from '$lib/app/seo'
	import { FormField, Hero, PillButton } from '@miko/ui'
	import { superForm } from 'sveltekit-superforms'
	import { zod4Client as zodClient } from 'sveltekit-superforms/adapters'
	import { initializeAntiAbuseFields } from '$lib/client/antiabuse'
	import type { SuperValidated } from 'sveltekit-superforms'
	import VerificationField from '@src/domains/shared/VerificationField.svelte'
	import { registerSchema, type RegisterFormData } from './schema'

	const { form, turnstileSiteKey } = $props<{ form: SuperValidated<RegisterFormData>; turnstileSiteKey?: string }>()
	const registerForm = (() =>
		superForm(form, {
			validators: zodClient(registerSchema),
			validationMethod: 'onblur',
			clearOnSubmit: 'message'
		}))()

	const { form: formData, errors, enhance } = registerForm

	function updateField<K extends keyof RegisterFormData>(key: K, value: RegisterFormData[K]) {
		formData.update((current) => ({ ...current, [key]: value }))
	}

	onMount(() => {
		const fields = initializeAntiAbuseFields('miko_register_device_id')
		formData.update((current) => ({
			...current,
			started_at: fields.startedAt,
			device_id: fields.deviceId
		}))
	})
</script>

<Seo title="Register" description="Account registration for MIKO.ART calendar features." path="/register/" noindex />

<svelte:head>
	{#if turnstileSiteKey}
		<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
	{/if}
</svelte:head>

<Hero title="Create account" subtitle="Create your account and confirm your email to continue." icon="/media/decor/emoji-herb.png" compact={true} />

<section class="register-page ui-surface-card">
	<form method="POST" class="register-page__form" use:enhance novalidate data-testid="register-form">
		<input type="hidden" name="started_at" value={$formData.started_at} data-testid="register-started-at" />
		<input type="hidden" name="device_id" value={$formData.device_id} />
		<label class="register-page__hp" aria-hidden="true">
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

		<FormField className="register-page__field" label="Name" forId="register-name" error={Array.isArray($errors['name']) ? $errors['name'][0] : undefined} required>
			<input
				id="register-name"
				class="ui-form-control"
				name="name"
				type="text"
				value={$formData.name}
				autocomplete="name"
				data-testid="register-name"
				oninput={(event) => updateField('name', event.currentTarget.value)}
			/>
		</FormField>

		<FormField className="register-page__field" label="Email" forId="register-email" error={Array.isArray($errors['email']) ? $errors['email'][0] : undefined} required>
			<input
				id="register-email"
				class="ui-form-control"
				name="email"
				type="email"
				value={$formData.email}
				autocomplete="email"
				data-testid="register-email"
				oninput={(event) => updateField('email', event.currentTarget.value)}
			/>
		</FormField>

		<FormField className="register-page__field" label="Password" forId="register-password" error={Array.isArray($errors['password']) ? $errors['password'][0] : undefined} required>
			<input
				id="register-password"
				class="ui-form-control"
				name="password"
				type="password"
				value={$formData.password}
				autocomplete="new-password"
				data-testid="register-password"
				oninput={(event) => updateField('password', event.currentTarget.value)}
			/>
		</FormField>

		{#if turnstileSiteKey}
			<VerificationField className="register-page__verification" siteKey={turnstileSiteKey} />
		{/if}

		{#if $errors._errors?.length}
			<p class="register-page__error" data-testid="register-error">{$errors._errors[0]}</p>
		{/if}

		<div class="register-page__submit-row" data-testid="register-submit-row">
			<PillButton type="submit" className="register-page__submit" variant="primary" size="md">Create account</PillButton>
		</div>
	</form>
</section>

<style>
	.register-page {
		max-width: min(36rem, 100%);
		padding: var(--space-8);
	}

	.register-page__form {
		display: grid;
		gap: var(--space-4);
	}

	:global(.register-page__field) {
		display: grid;
		gap: var(--space-2);
	}

	.register-page__hp {
		position: absolute;
		left: -100vw;
		top: auto;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	.register-page__error {
		margin: 0;
		color: var(--status-error-text);
	}

	.register-page__submit-row {
		justify-self: start;
	}
</style>
