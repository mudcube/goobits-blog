<script lang="ts">
</script>

<div class="divider" role="separator" aria-hidden="true">
	<svg
		class="divider__svg"
		viewBox="0 0 240 24"
		width="224"
		height="22"
		xmlns="http://www.w3.org/2000/svg"
		preserveAspectRatio="xMidYMid meet"
		aria-hidden="true"
	>
		<path
			class="divider__stroke"
			d="M 10 12 C 40 4, 70 20, 110 12"
			fill="none"
			stroke="currentColor"
			stroke-width="1.1"
			stroke-linecap="round"
		/>
		<path
			class="divider__stroke"
			d="M 230 12 C 200 4, 170 20, 130 12"
			fill="none"
			stroke="currentColor"
			stroke-width="1.1"
			stroke-linecap="round"
		/>
		<path
			class="divider__diamond"
			d="M 120 6 L 126 12 L 120 18 L 114 12 Z"
			fill="currentColor"
		/>
	</svg>
</div>

<style>
	.divider {
		display: flex;
		justify-content: center;
		margin: 1.25rem 0;
		color: color-mix(in srgb, var(--text) 38%, transparent);
	}

	.divider__svg {
		width: 14rem;
		height: 1.4rem;
		max-width: 60vw;
		display: block;
		overflow: visible;
	}
</style>
