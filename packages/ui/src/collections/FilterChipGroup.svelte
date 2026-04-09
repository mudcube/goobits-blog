<script lang="ts">
	import PillButton from '../buttons/PillButton.svelte'

	type FilterChipItem = string | { value: string; label: string }

	type FilterChipGroupProps = {
		items: FilterChipItem[]
		value?: string
		selected?: string[]
		multiple?: boolean
		className?: string
		ariaLabel?: string
	}

	let {
		items,
		value = $bindable(''),
		selected = $bindable([]),
		multiple = false,
		className = '',
		ariaLabel = 'Filter options'
	}: FilterChipGroupProps = $props()

</script>

<PillButton options={items} bind:value bind:selected {multiple} className={className} ariaLabel={ariaLabel} />
