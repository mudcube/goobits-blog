<script>
	import { Clock, Calendar, CalendarClock, LayoutGrid, Users, Link2, Ticket } from '@lucide/svelte'
	import { ADMIN_NAV, getAdminTabHref } from '../admin/shared/admin'
	import PillButton from '../primitives/CalendarPillButton.svelte'
	const { tab, onSelect } = $props()
</script>

<aside class="admin-page__sidebar">
	<div class="admin-page__sidebar-label">Schedule</div>

	<div class="admin-page__sidebar-items">
		{#each ADMIN_NAV as n}
			{#if n.section === 'settings' && n.id === 'rules'}
				<div class="admin-page__sidebar-label admin-page__sidebar-label--secondary">Settings</div>
			{/if}
			<PillButton
				className={`admin-page__sidebar-item ui-button--start ${tab === n.id ? 'admin-page__sidebar-item--active' : ''}`}
				variant="secondary"
				size="sm"
				fullWidth
				href={getAdminTabHref(n.id)}
				onClick={(event) => {
					event.preventDefault()
					onSelect(n.id)
				}}
			>
				{#if n.id === 'dashboard'}
					<Clock size={16} strokeWidth={1.8} />
				{:else if n.id === 'rules'}
					<Calendar size={16} strokeWidth={1.8} />
				{:else if n.id === 'people'}
					<Users size={16} strokeWidth={1.8} />
				{:else if n.id === 'programs'}
					<LayoutGrid size={16} strokeWidth={1.8} />
				{:else if n.id === 'events'}
					<CalendarClock size={16} strokeWidth={1.8} />
				{:else if n.id === 'invites'}
					<Ticket size={16} strokeWidth={1.8} />
				{:else if n.id === 'connections'}
					<Link2 size={16} strokeWidth={1.8} />
				{/if}
				{n.label}
			</PillButton>
		{/each}
	</div>
</aside>
