<script lang="ts">
	type Props = {
		startedAt?: string
		deviceId?: string
		website?: string
		onWebsiteInput: (value: string) => void
		honeypotClassName?: string
		startedAtTestId?: string
	}

	const {
		startedAt = '',
		deviceId = '',
		website = '',
		onWebsiteInput,
		honeypotClassName = '',
		startedAtTestId
	}: Props = $props()
</script>

<input type="hidden" name="started_at" value={startedAt} data-testid={startedAtTestId} />
<input type="hidden" name="device_id" value={deviceId} />
<label class={honeypotClassName} aria-hidden="true">
	<span>Website</span>
	<input
		type="text"
		name="website"
		value={website}
		tabindex="-1"
		autocomplete="off"
		oninput={(event) => onWebsiteInput(event.currentTarget.value)}
	/>
</label>
