<script lang="ts">
	import PillButton from '../buttons/PillButton.svelte'

	export type SegmentedOption = {
		value: string
		label: string
	}

	type SegmentedControlProps = {
		options: SegmentedOption[]
		value?: string
		className?: string
		ariaLabel?: string
	}

	let {
		options,
		value = $bindable(''),
		className = '',
		ariaLabel = 'Segmented control'
	}: SegmentedControlProps = $props()
</script>

<PillButton bind:value {options} grouped className={className} ariaLabel={ariaLabel} />
