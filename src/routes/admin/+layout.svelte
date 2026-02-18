<script>
	import './Admin.scss'
	import { AdminShellLayout } from '@calendar/ui'

	const { children, data } = $props()
</script>

<AdminShellLayout {data}>
	{@render children()}
</AdminShellLayout>
