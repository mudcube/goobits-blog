<script lang="ts">
	export let value = ''
	export let id: string | undefined = undefined
	export let name: string | undefined = undefined
	export let disabled = false
	export let ariaLabel: string | undefined = undefined
	export let onchange: ((event: Event) => void) | undefined = undefined
</script>

<div class="admin-select">
	<select
		class="admin-select__control admin-ui-input"
		{id}
		{name}
		aria-label={ariaLabel}
		{disabled}
		bind:value
		{onchange}
	>
		<slot />
	</select>
	<span class="admin-select__chevron" aria-hidden="true">▾</span>
</div>

<style lang="scss">
	.admin-select {
		position: relative;
		width: 100%;

		.admin-select__control {
			appearance: none;
			padding-right: 2rem;
			background-color: var(--bg);
		}

		.admin-select__chevron {
			position: absolute;
			right: 0.68rem;
			top: 50%;
			transform: translateY(-50%);
			font-size: 0.72rem;
			color: color-mix(in srgb, var(--text) 58%, transparent);
			pointer-events: none;
		}
	}
</style>
