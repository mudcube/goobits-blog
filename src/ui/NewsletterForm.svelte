<script lang="ts">
	import { GooButton } from '@goobits/goo/button'
	import { GooInput } from '@goobits/goo/input'
	import { GooSpinner } from '@goobits/goo/spinner'
	import {
		createFormSubmission,
		invalidFormData,
		validFormData,
		type FormSubmissionState
	} from '@goobits/forms/core'
	import FormErrors from '@goobits/forms/ui/form-errors'
	import FormStatus from '@goobits/forms/ui/form-status'
	import './blogTheme.css'

	import { createBlogUiMessages, type BlogUiMessagesInput } from '../config/blogMessages.js'
	import type { NewsletterSubscriber } from './newsletter.js'

	interface Props {
		onSubscribe?: (_subscriber: NewsletterSubscriber) => Promise<unknown>
		messages?: BlogUiMessagesInput
		label?: string
		class?: string
	}

	const {
		onSubscribe,
		messages: messageInput = {},
		label,
		class: className = ''
	}: Props = $props()

	const messages = $derived(createBlogUiMessages(messageInput))
	const ariaLabel = $derived(label ?? messages.newsletter)
	let email = $state('')
	let submissionState = $state<FormSubmissionState>({ status: 'idle', errors: {}, message: '' })

	const formErrors = $derived({ _errors: Object.values(submissionState.errors).filter(Boolean) })
	const submitting = $derived(submissionState.status === 'validating' || submissionState.status === 'submitting')

	const submission = $derived(onSubscribe
		? createFormSubmission({
			validate: ({ email: inputEmail }: NewsletterSubscriber) => {
				const normalizedEmail = inputEmail.trim().toLowerCase()
				if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
					return invalidFormData({ email: messages.invalidEmail })
				}
				return validFormData({ email: normalizedEmail })
			},
			submit: onSubscribe,
			onStateChange: (nextState: FormSubmissionState) => { submissionState = nextState },
			successMessage: messages.subscribed,
			errorMessage: messages.subscribeError
		})
		: null)

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault()
		if (!submission) {return}
		const nextState = await submission.submit({ email })
		if (nextState.status === 'success') {email = ''}
	}
</script>

{#if onSubscribe}
	<form
		class={['blog-newsletter', className].filter(Boolean).join(' ')}
		aria-label={ariaLabel}
		onsubmit={(event) => void handleSubmit(event)}
	>
		<GooInput
			type="email"
			name="email"
			inputId="blog-newsletter-email"
			ariaLabel={messages.emailPlaceholder}
			placeholder={messages.emailPlaceholder}
			autocomplete="email"
			required
			block
			disabled={submitting}
			aria-invalid={Boolean(submissionState.errors['email'])}
			bind:value={email}
		/>
		<GooButton type="submit" variant="primary" disabled={submitting} aria-busy={submitting}>
			{#if submitting}<GooSpinner size={18} label={messages.loading} />{/if}
			<span>{submitting ? messages.loading : messages.subscribe}</span>
		</GooButton>
		<FormErrors errors={formErrors} />
		<FormStatus status={submissionState.status} message={submissionState.message} />
	</form>
{/if}
