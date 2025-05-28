<script>
	/**
	 * SocialShare Component
	 * 
	 * Provides buttons for sharing content to social media platforms and copying
	 * links to clipboard, with accessibility features and internationalized labels.
	 * 
	 * Features:
	 * - Share to Facebook, Twitter, and more platforms as needed
	 * - Copy URL to clipboard with success indicator
	 * - Full internationalization via Paraglide
	 * - Accessible button and link labels
	 * - Visual feedback for copy action
	 * 
	 * @component
	 */
	import './SocialShare.scss'
	import { createMessageGetter } from '@goobits/blog/utils/index.js'
	import { defaultMessages } from '@goobits/blog/config/index.js'
	import { createLogger } from '@goobits/blog/utils/logger.js'

	const logger = createLogger('SocialShare')

	/**
	 * @typedef {Object} Props
	 * @property {string} url - The URL to share
	 * @property {string} title - The title of the content being shared
	 * @property {string} [text] - Optional descriptive text for the share
	 * @property {string} [className] - Optional CSS class name
	 */

	/** @type {Props} */
	let {
		url = typeof window !== 'undefined' ? window.location.href : '',
		title = 'Check out this content',
		text = '',
		className = '',
		messages = {}
	} = $props()

	// Create message getter
	const getMessage = createMessageGetter({ ...defaultMessages, ...messages })

	// State for copy link success
	let copySuccess = $state(false)

	// Function to copy URL to clipboard
	async function copyLink() {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(url)
				copySuccess = true
				setTimeout(() => {
					copySuccess = false
				}, 2000)
			} catch (err) {
				logger.error('Failed to copy URL:', err)
			}
		}
	}
</script>

<div class={`goo__social-share-container ${className}`} role="region" aria-labelledby="social-share-title">
	<div class="goo__social-share-text">
		<p id="social-share-title" class="goo__social-share-title">{getMessage('shareTitle', 'Share this post')}</p>
		<p class="goo__social-share-subtitle">{text || getMessage('shareSubtitle', 'Spread the word on social media')}</p>
	</div>

	<div class="goo__social-buttons" role="toolbar" aria-label="Sharing options">
		<a
			href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
			target="_blank"
			rel="noopener noreferrer"
			class="goo__share-button"
			aria-label={getMessage('shareFacebook', 'Share on Facebook')}
			role="button"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
				<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
			</svg>
			<span>Facebook</span>
		</a>

		<a
			href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
			target="_blank"
			rel="noopener noreferrer"
			class="goo__share-button"
			aria-label={getMessage('shareTwitter', 'Share on Twitter')}
			role="button"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
				<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
			</svg>
			<span>Twitter</span>
		</a>

		<button
			onclick={copyLink}
			class={`goo__share-button ${copySuccess ? 'goo__share-button--state-success' : ''}`}
			aria-label={getMessage('shareCopyLink', 'Copy link')}
			aria-pressed={copySuccess}
			aria-live="polite"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
				{#if copySuccess}
					<path d="M20 6L9 17l-5-5"></path>
				{:else}
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
				{/if}
			</svg>
			<span>{copySuccess ? getMessage('linkCopied', 'Link copied to clipboard') : getMessage('copyLink', 'Copy link')}</span>
		</button>
	</div>
</div>