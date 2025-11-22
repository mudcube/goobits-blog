<script>
	/**
	 * LanguageSwitcher Component
	 *
	 * A flexible language switcher component that supports multiple display variants.
	 * This component is designed to work with any i18n library by accepting the necessary
	 * functions and data as props.
	 *
	 * Features:
	 * - Multiple UI variants: dropdown, buttons, or native select
	 * - Optional display of full language names or just language codes
	 * - Full keyboard navigation and screen reader support
	 * - Automatic highlighting of current language
	 * - Support for custom styling via className prop
	 *
	 * @component
	 */
	import './LanguageSwitcher.scss'
	import { ClassNames, bemClasses } from '@goobits/blog/utils/index.js'

	/**
	 * @typedef {Object} LanguageSwitcherProps
	 * @property {'dropdown'|'buttons'|'select'} [variant] - Visual presentation style
	 * @property {boolean} [showLabels] - Whether to show full language names
	 * @property {string} [className] - Additional CSS class name for styling
	 * @property {string[]} locales - Array of available language codes
	 * @property {string} currentLocale - Currently active language code
	 * @property {Function} onLocaleChange - Callback when language is changed
	 * @property {Object} [languageNames] - Optional map of language codes to display names
	 * @property {Object} [messages] - Optional i18n messages for the component
	 */

	/**
	 * @type {LanguageSwitcherProps}
	 */
	let {
		variant = 'dropdown',
		showLabels = true,
		className = '',
		locales = ['en'],
		currentLocale = 'en',
		onLocaleChange = () => {},
		languageNames = {},
		messages = {}
	} = $props()

	// Default language names if not provided
	const defaultLanguageNames = {
		'en': 'English',
		'es': 'Español',
		'de': 'Deutsch',
		'fr': 'Français',
		'ja': '日本語'
	}

	// Merge provided language names with defaults
	const languages = { ...defaultLanguageNames, ...languageNames }

	// Create language options array
	const languageOptions = locales.map(code => ({
		code,
		name: languages[code] || code
	}))

	// State for dropdown
	let isOpen = $state(false)

	// Current language
	let currentLanguage = $state(currentLocale)

	// Update current language when prop changes
	$effect(() => {
		currentLanguage = currentLocale
	})

	// Function to handle language change
	function handleLanguageChange(langCode) {
		onLocaleChange(langCode)
		currentLanguage = langCode
		isOpen = false
	}

	// Function to toggle dropdown
	function toggleDropdown() {
		isOpen = !isOpen
	}

	// Function to handle blur (close dropdown)
	function handleBlur(event) {
		// Check if the related target is within the dropdown
		if (!event.currentTarget.contains(event.relatedTarget)) {
			isOpen = false
		}
	}

	// Helper to get language name from code
	function getLanguageName(code) {
		return languages[code] || code
	}

	// Close dropdown on Escape key
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			isOpen = false
		}
	}

	// Create modifier classes
	const switcherModifiers = []
	if (variant) switcherModifiers.push(variant)
	if (showLabels) switcherModifiers.push('display-labels')

	// Get component text from messages or use defaults
	const switchLanguageLabel = messages.switchLanguage || 'Switch Language'
	const selectLanguageLabel = messages.selectLanguage || 'Select language'
</script>

<div
	class={bemClasses(ClassNames.langSwitcher, { modifiers: switcherModifiers, className })}
	role="combobox"
	tabindex="0"
	onblur={handleBlur}
	onkeydown={handleKeydown}
	aria-label={switchLanguageLabel}
	aria-expanded={isOpen}
	aria-controls="language-listbox"
>
	{#if variant === 'dropdown'}
		<button
			class="goo__lang-selected"
			aria-haspopup="listbox"
			aria-expanded={isOpen}
			onclick={toggleDropdown}
		>
			<span class="goo__lang-code">{currentLanguage}</span>
			{#if showLabels}
				<span class="goo__lang-name">{getLanguageName(currentLanguage)}</span>
			{/if}
			<svg
				aria-hidden="true"
				class="goo__lang-dropdown-icon"
				class:goo__lang-dropdown-icon--state-open={isOpen}
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>

		{#if isOpen}
			<div
				id="language-listbox"
				class="goo__lang-dropdown"
				role="listbox"
				aria-label={selectLanguageLabel}
			>
				{#each languageOptions as { code, name } (code)}
					<button
						class="goo__lang-option"
						class:goo__lang-option--state-active={code === currentLanguage}
						role="option"
						aria-selected={code === currentLanguage}
						onclick={() => handleLanguageChange(code)}
					>
						<span class="goo__lang-code">{code}</span>
						{#if showLabels}
							<span class="goo__lang-name">{name}</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	{:else if variant === 'buttons'}
		<div class="goo__lang-buttons">
			{#each languageOptions as { code, name } (code)}
				<button
					class="goo__lang-button"
					class:goo__lang-button--state-active={code === currentLanguage}
					onclick={() => handleLanguageChange(code)}
					aria-pressed={code === currentLanguage}
				>
					<span class="goo__lang-code">{code}</span>
					{#if showLabels}
						<span class="goo__lang-name">{name}</span>
					{/if}
				</button>
			{/each}
		</div>
	{:else if variant === 'select'}
		<div class="goo__lang-select-container">
			<select
				class="goo__lang-select"
				value={currentLanguage}
				onchange={(e) => handleLanguageChange(e.target.value)}
				aria-label={selectLanguageLabel}
			>
				{#each languageOptions as { code, name } (code)}
					<option value={code}>
						{showLabels ? name : code}
					</option>
				{/each}
			</select>
			<svg
				aria-hidden="true"
				class="goo__lang-select-icon"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
	{/if}
</div>