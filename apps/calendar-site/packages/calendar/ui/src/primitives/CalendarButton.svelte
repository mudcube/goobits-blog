<script lang="ts">
	import type { Snippet } from 'svelte'
	import PillButton from './CalendarPillButton.svelte'

	let {
		href,
		target,
		rel,
		type = 'button',
		variant = 'secondary',
		size = 'md',
		fullWidth = false,
		className = '',
		ariaLabel,
		disabled = false,
		onClick,
		children
	}: {
		href?: string | undefined
		target?: string | undefined
		rel?: string | undefined
		type?: 'button' | 'submit' | 'reset'
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
		size?: 'sm' | 'md' | 'lg'
		fullWidth?: boolean
		className?: string
		ariaLabel?: string | undefined
		disabled?: boolean
		onClick?: ((event: MouseEvent) => void) | undefined
		children?: Snippet | undefined
	} = $props()
</script>

<PillButton
	{href}
	{target}
	{rel}
	{type}
	{variant}
	{size}
	{fullWidth}
	{className}
	{ariaLabel}
	{disabled}
	{onClick}
>
	{@render children?.()}
</PillButton>
