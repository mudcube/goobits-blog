<script>
	/**
	 * Newsletter Component
	 *
	 * A newsletter subscription form for blog sidebar with customizable text
	 * and internationalization support through Paraglide. Provides a simple
	 * email input and subscribe button with default translations that can be
	 * overridden with custom values.
	 *
	 * Features:
	 * - Fully internationalized through Paraglide
	 * - Customizable text properties with fallbacks
	 * - Responsive design for sidebar placement
	 * - Clean input field with proper validation attributes
	 *
	 * @component
	 */
	import './Newsletter.scss'
	import { createMessageGetter } from '@goobits/blog/utils/index.js'
	import { defaultMessages } from '@goobits/blog/config/index.js'

	/**
	 * @typedef {Object} Props
	 * @property {string} [title] - Title for the newsletter section (defaults to internationalized message)
	 * @property {string} [description] - Description text (defaults to internationalized message)
	 * @property {string} [buttonText] - Text for the submit button (defaults to internationalized message)
	 * @property {string} [placeholderText] - Placeholder for the email input (defaults to internationalized message)
	 */

	/** @type {Props} */
	let {
		title,
		description,
		buttonText,
		placeholderText,
		messages = {}
	} = $props()

	// Create message getter
	const getMessage = createMessageGetter({ ...defaultMessages, ...messages })

	// Use provided values or fall back to internationalized messages
	const finalTitle = $derived(title || getMessage('newsletterTitle', 'Stay Updated'))
	const finalDescription = $derived(description || getMessage('newsletterDescription', 'Subscribe to get the latest posts directly to your inbox'))
	const finalButtonText = $derived(buttonText || getMessage('subscribe', 'Subscribe'))
	const finalPlaceholder = $derived(placeholderText || getMessage('emailPlaceholder', 'Enter your email'))
</script>

<div class="goo__newsletter" aria-labelledby="newsletter-heading">
	<h2 id="newsletter-heading" class="goo__newsletter-heading">{finalTitle}</h2>
	<p class="goo__newsletter-description">{finalDescription}</p>
	<form class="goo__newsletter-form" aria-describedby="newsletter-heading">
		<label for="newsletter-email" class="visually-hidden">{finalPlaceholder}</label>
		<input
				id="newsletter-email"
				placeholder={finalPlaceholder}
				class="goo__newsletter-input"
				type="email"
				required
				aria-required="true"
		>
		<button
				type="submit"
				class="goo__newsletter-button"
		>
			{finalButtonText}
		</button>
	</form>
</div>