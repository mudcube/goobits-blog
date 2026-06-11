import type { D1DatabaseLike } from './storage/d1.ts'

export type CalendarTenantRole = 'owner' | 'admin' | 'member'

export type CalendarTenant = {
	id: number
	slug: string
	name: string
	ownerUserId: string | null
	visibility: 'public' | 'private'
	role?: CalendarTenantRole
}

export type CalendarTenantPublicEvent = {
	id: number
	title: string
	activitySlug: string
	activityLabel: string
	startsAt: string
	endsAt: string
	capacity: number
	seatsTaken: number
	waitlistCount: number
	location: string | null
	note: string | null
}

export type CalendarTenantOrganizerEvent = CalendarTenantPublicEvent & {
	status: string
}

type TenantRow = {
	id: number
	slug: string
	name: string
	owner_user_id: string | null
	visibility: string
	role?: string | null
}

type TenantPublicEventRow = {
	id: number
	title: string
	activity_slug: string
	activity_label: string | null
	starts_at: string
	ends_at: string
	capacity: number
	seats_taken: number
	waitlist_count: number
	location: string | null
	note: string | null
}

type TenantOrganizerEventRow = TenantPublicEventRow & {
	status: string
}

const DEFAULT_TENANT_ID = 1
const DEFAULT_TENANT_SLUG = 'pdx-fun'

function normalizeTenantRole(role: string | null | undefined): CalendarTenantRole {
	if (role === 'owner' || role === 'admin' || role === 'member') return role
	return 'member'
}

function toTenant(row: TenantRow): CalendarTenant {
	const tenant: CalendarTenant = {
		id: row.id,
		slug: row.slug,
		name: row.name,
		ownerUserId: row.owner_user_id,
		visibility: row.visibility === 'private' ? 'private' : 'public'
	}
	if (row.role) tenant.role = normalizeTenantRole(row.role)
	return tenant
}

export function slugifyTenantName(input: string) {
	return input
		.trim()
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 48)
}

async function uniqueTenantSlug(db: D1DatabaseLike, base: string) {
	const normalized = slugifyTenantName(base) || 'organizer'
	for (let i = 0; i < 20; i++) {
		const suffix = i === 0 ? '' : `-${i + 1}`
		const slug = `${normalized}${suffix}`.slice(0, 60)
		const existing = await db
			.prepare(`SELECT id FROM calendar_tenants WHERE slug = ? LIMIT 1`)
			.bind(slug)
			.first<{ id: number }>()
		if (!existing) return slug
	}
	return `${normalized}-${Date.now().toString(36)}`.slice(0, 60)
}

export async function ensureDefaultCalendarTenant(db: D1DatabaseLike) {
	await db
		.prepare(
			`INSERT OR IGNORE INTO calendar_tenants (id, slug, name, visibility, created_at, updated_at)
			 VALUES (?, ?, ?, 'public', unixepoch(), unixepoch())`
		)
		.bind(DEFAULT_TENANT_ID, DEFAULT_TENANT_SLUG, 'pdx.fun')
		.run()
	return DEFAULT_TENANT_ID
}

export async function getDefaultCalendarTenant(db: D1DatabaseLike) {
	await ensureDefaultCalendarTenant(db)
	return getCalendarTenantBySlug(db, DEFAULT_TENANT_SLUG)
}

export async function getCalendarTenantBySlug(db: D1DatabaseLike, slug: string) {
	const row = await db
		.prepare(
			`SELECT id, slug, name, owner_user_id, visibility
			 FROM calendar_tenants
			 WHERE slug = ?
			 LIMIT 1`
		)
		.bind(slug)
		.first<TenantRow>()
	return row ? toTenant(row) : null
}

export async function getCalendarTenantForUser(db: D1DatabaseLike, userId: string) {
	const row = await db
		.prepare(
			`SELECT t.id, t.slug, t.name, t.owner_user_id, t.visibility, m.role
			 FROM calendar_tenants t
			 INNER JOIN calendar_tenant_members m ON m.tenant_id = t.id
			 WHERE m.user_id = ?
			 ORDER BY CASE m.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, t.created_at ASC
			 LIMIT 1`
		)
		.bind(userId)
		.first<TenantRow>()
	if (row) return toTenant(row)
	return getDefaultCalendarTenant(db)
}

export async function listCalendarTenantsForUser(db: D1DatabaseLike, userId: string) {
	const result = await db
		.prepare(
			`SELECT t.id, t.slug, t.name, t.owner_user_id, t.visibility, m.role
			 FROM calendar_tenants t
			 INNER JOIN calendar_tenant_members m ON m.tenant_id = t.id
			 WHERE m.user_id = ?
			 ORDER BY t.name ASC`
		)
		.bind(userId)
		.all<TenantRow>()
	return (result.results ?? []).map(toTenant)
}

export async function createCalendarTenantForUser(
	db: D1DatabaseLike,
	input: { userId: string; name: string; slug?: string }
) {
	await ensureDefaultCalendarTenant(db)
	const name = input.name.trim() || 'Organizer'
	const slug = await uniqueTenantSlug(db, input.slug || name)
	const result = await db
		.prepare(
			`INSERT INTO calendar_tenants (slug, name, owner_user_id, visibility, created_at, updated_at)
			 VALUES (?, ?, ?, 'public', unixepoch(), unixepoch())`
		)
		.bind(slug, name, input.userId)
		.run()
	const tenantId = result.meta.last_row_id
	await db
		.prepare(
			`INSERT INTO calendar_tenant_members (tenant_id, user_id, role, created_at, updated_at)
			 VALUES (?, ?, 'owner', unixepoch(), unixepoch())
			 ON CONFLICT(tenant_id, user_id) DO UPDATE SET role = 'owner', updated_at = unixepoch()`
		)
		.bind(tenantId, input.userId)
		.run()
	return {
		id: tenantId,
		slug,
		name,
		ownerUserId: input.userId,
		visibility: 'public' as const,
		role: 'owner' as const
	}
}

export async function ensureCalendarTenantForUser(db: D1DatabaseLike, input: { userId: string; name: string }) {
	const existing = await getCalendarTenantForUser(db, input.userId)
	if (existing && existing.id !== DEFAULT_TENANT_ID) return existing
	return createCalendarTenantForUser(db, input)
}

export function buildCalendarTenantNameForUser(name: string) {
	const trimmed = name.trim() || 'Organizer'
	return trimmed.endsWith('s') ? `${trimmed} events` : `${trimmed}'s events`
}

export async function getCalendarUserDisplayName(db: D1DatabaseLike, userId: string) {
	const row = await db
		.prepare(`SELECT name FROM calendar_users WHERE id = ? LIMIT 1`)
		.bind(userId)
		.first<{ name: string | null }>()
	return row?.name?.trim() || 'Organizer'
}

export async function ensureCalendarCreatorTenant(db: D1DatabaseLike, input: { userId: string }) {
	const name = await getCalendarUserDisplayName(db, input.userId)
	return ensureCalendarTenantForUser(db, {
		userId: input.userId,
		name: buildCalendarTenantNameForUser(name)
	})
}

export async function getCalendarTenantRole(db: D1DatabaseLike, input: { tenantId: number; userId: string }) {
	const row = await db
		.prepare(
			`SELECT role
			 FROM calendar_tenant_members
			 WHERE tenant_id = ? AND user_id = ?
			 LIMIT 1`
		)
		.bind(input.tenantId, input.userId)
		.first<{ role: string }>()
	return row ? normalizeTenantRole(row.role) : null
}

export async function canManageCalendarTenant(db: D1DatabaseLike, input: { tenantId: number; userId: string }) {
	const role = await getCalendarTenantRole(db, input)
	return role === 'owner' || role === 'admin'
}

export async function listPublicCalendarTenantEvents(
	db: D1DatabaseLike,
	input: { tenantId: number; limit?: number }
): Promise<CalendarTenantPublicEvent[]> {
	const result = await db
		.prepare(
			`SELECT e.id, e.title, e.activity_slug, p.label AS activity_label, e.starts_at, e.ends_at,
			        e.capacity, e.location, e.note,
			        COALESCE((
			        	SELECT SUM(1 + participant.guest_count)
			        	FROM calendar_event_participants participant
			        	WHERE participant.event_id = e.id AND participant.status = 'joined'
			        ), 0) AS seats_taken,
			        COALESCE((
			        	SELECT COUNT(*)
			        	FROM calendar_event_participants participant
			        	WHERE participant.event_id = e.id AND participant.status = 'waitlist'
			        ), 0) AS waitlist_count
			 FROM calendar_events e
			 LEFT JOIN calendar_programs p ON p.slug = e.activity_slug
			 WHERE e.tenant_id = ?
			   AND e.status = 'scheduled'
			   AND datetime(e.ends_at) >= datetime('now')
			 ORDER BY datetime(e.starts_at) ASC
			 LIMIT ?`
		)
		.bind(input.tenantId, input.limit ?? 40)
		.all<TenantPublicEventRow>()
	return (result.results ?? []).map((row) => ({
		id: row.id,
		title: row.title,
		activitySlug: row.activity_slug,
		activityLabel: row.activity_label || row.activity_slug,
		startsAt: row.starts_at,
		endsAt: row.ends_at,
		capacity: row.capacity,
		seatsTaken: row.seats_taken ?? 0,
		waitlistCount: row.waitlist_count ?? 0,
		location: row.location,
		note: row.note
	}))
}

export async function listCalendarTenantOrganizerEvents(
	db: D1DatabaseLike,
	input: { tenantId: number; limit?: number }
): Promise<CalendarTenantOrganizerEvent[]> {
	const result = await db
		.prepare(
			`SELECT e.id, e.title, e.activity_slug, p.label AS activity_label, e.starts_at, e.ends_at,
			        e.capacity, e.location, e.note, e.status,
			        COALESCE((
			        	SELECT SUM(1 + participant.guest_count)
			        	FROM calendar_event_participants participant
			        	WHERE participant.event_id = e.id AND participant.status = 'joined'
			        ), 0) AS seats_taken,
			        COALESCE((
			        	SELECT COUNT(*)
			        	FROM calendar_event_participants participant
			        	WHERE participant.event_id = e.id AND participant.status = 'waitlist'
			        ), 0) AS waitlist_count
			 FROM calendar_events e
			 LEFT JOIN calendar_programs p ON p.slug = e.activity_slug
			 WHERE e.tenant_id = ?
			 ORDER BY datetime(e.starts_at) DESC
			 LIMIT ?`
		)
		.bind(input.tenantId, input.limit ?? 80)
		.all<TenantOrganizerEventRow>()
	return (result.results ?? []).map((row) => ({
		id: row.id,
		title: row.title,
		activitySlug: row.activity_slug,
		activityLabel: row.activity_label || row.activity_slug,
		startsAt: row.starts_at,
		endsAt: row.ends_at,
		capacity: row.capacity,
		seatsTaken: row.seats_taken ?? 0,
		waitlistCount: row.waitlist_count ?? 0,
		location: row.location,
		note: row.note,
		status: row.status
	}))
}
