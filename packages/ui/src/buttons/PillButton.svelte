<script lang="ts">
	import type { Snippet } from 'svelte'
	import Button from './Button.svelte'
	import type { ButtonProps } from './button.types'

	type PillOption = string | { value: string; label: string }

	let {
		href = '',
		type = 'button',
		variant = 'secondary',
		size = 'md',
		fullWidth = false,
		disabled = false,
		className = '',
		options,
		value = $bindable(''),
		selected = $bindable([]),
		multiple = false,
		grouped = false,
		target,
		rel,
		ariaLabel,
		ariaSelected,
		ariaChecked,
		ariaExpanded,
		ariaHaspopup,
		role,
		title,
		onClick,
		onChange,
		children
	}: ButtonProps & {
		options?: PillOption[]
		value?: string
		selected?: string[]
		multiple?: boolean
		grouped?: boolean
		onChange?: (value: string | string[]) => void
		children?: Snippet
	} = $props()

	function getOptionValue(option: PillOption) {
		return typeof option === 'string' ? option : option.value
	}

	function getOptionLabel(option: PillOption) {
		return typeof option === 'string' ? option : option.label
	}

	function isActive(option: PillOption) {
		const optionValue = getOptionValue(option)
		return multiple ? selected.includes(optionValue) : value === optionValue
	}

	function selectOption(option: PillOption) {
		const optionValue = getOptionValue(option)
		if (multiple) {
			selected = selected.includes(optionValue)
				? selected.filter((entry) => entry !== optionValue)
				: [...selected, optionValue]
			onChange?.(selected)
			return
		}
		value = optionValue
		onChange?.(value)
	}
</script>

{#if options}
	<div
		class={`${grouped ? 'ui-segmented' : 'ui-chip-group'} ${className}`.trim()}
		role={multiple ? 'group' : 'tablist'}
		aria-label={ariaLabel}
	>
		{#each options as option}
			<button
				type="button"
				class={`${grouped ? 'ui-segmented__button' : 'ui-chip-group__button'} ${isActive(option) ? grouped ? 'ui-segmented__button--active' : 'ui-chip-group__button--active' : ''}`}
				role={multiple ? undefined : 'tab'}
				aria-selected={multiple ? undefined : isActive(option)}
				aria-pressed={multiple ? isActive(option) : undefined}
				disabled={disabled}
				onclick={() => selectOption(option)}
			>
				{getOptionLabel(option)}
			</button>
		{/each}
	</div>
{:else}
	<Button
		{href}
		{type}
		{variant}
		{size}
		pill
		{fullWidth}
		{disabled}
		{className}
		{target}
		{rel}
		{ariaLabel}
		{ariaSelected}
		{ariaChecked}
		{ariaExpanded}
		{ariaHaspopup}
		{role}
		{title}
		{onClick}
	>
		{@render children?.()}
	</Button>
{/if}
