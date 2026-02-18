<script>
	import '@calendar/theme/admin.scss'
	import { AdminShellLayout } from '@calendar/ui'

	const { children, data } = $props()
</script>

<AdminShellLayout {data}>
	{@render children()}
</AdminShellLayout>
