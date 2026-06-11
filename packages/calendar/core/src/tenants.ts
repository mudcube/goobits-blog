import type { D1DatabaseLike } from './storage/d1.ts'
import { isCalendarAdmin } from './access/admin-permissions.ts'

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

export type CalendarTenantEventManageAccess =
	| { ok: true; tenantId: number; role: CalendarTenantRole | 'global-admin' }
	| { ok: false; reason: 'not_found' | 'forbidden' }

export type CalendarTenantMember = {
	userId: string
	role: CalendarTenantRole
	name: string | null
	email: string | null
}

export type CalendarTenantInvite = {
	id: number
	email: string
	role: CalendarTenantRole
	code: string
	invitedByUserId: string | null
	acceptedUserId: string | null
	acceptedAt: number | null
	expiresAt: number | null
	createdAt: number
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

type TenantMemberRow = {
	user_id: string
	role: string
	name: string | null
	email: string | null
}

type TenantInviteRow = {
	id: number
	email: string
	role: string
	code: string
	invited_by_user_id: string | null
	accepted_user_id: string | null
	accepted_at: number | null
	expires_at: number | null
	created_at: number
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

function toPublicTenantEvent(row: TenantPublicEventRow): CalendarTenantPublicEvent {
	return {
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
	}
}

function toTenantInvite(row: TenantInviteRow): CalendarTenantInvite {
	return {
		id: row.id,
		email: row.email,
		role: normalizeTenantRole(row.role),
		code: row.code,
		invitedByUserId: row.invited_by_user_id,
		acceptedUserId: row.accepted_user_id,
		acceptedAt: row.accepted_at,
		expiresAt: row.expires_at,
		createdAt: row.created_at
	}
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

export async function updateCalendarTenantSettings(
	db: D1DatabaseLike,
	input: { tenantId: number; name: string; slug: string }
) {
	const name = input.name.trim()
	const slug = slugifyTenantName(input.slug)
	if (!name) return { ok: false as const, reason: 'invalid_name' as const }
	if (!slug) return { ok: false as const, reason: 'invalid_slug' as const }

	const existing = await db
		.prepare(`SELECT id FROM calendar_tenants WHERE slug = ? AND id <> ? LIMIT 1`)
		.bind(slug, input.tenantId)
		.first<{ id: number }>()
	if (existing) return { ok: false as const, reason: 'slug_taken' as const }

	await db
		.prepare(`UPDATE calendar_tenants SET name = ?, slug = ?, updated_at = unixepoch() WHERE id = ?`)
		.bind(name, slug, input.tenantId)
		.run()
	return { ok: true as const, tenant: await getCalendarTenantBySlug(db, slug) }
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

export async function getCalendarEventTenantId(db: D1DatabaseLike, eventId: number) {
	const row = await db
		.prepare(`SELECT tenant_id FROM calendar_events WHERE id = ? LIMIT 1`)
		.bind(eventId)
		.first<{ tenant_id: number }>()
	return row?.tenant_id ?? null
}

export async function canManageCalendarEvent(
	db: D1DatabaseLike,
	input: { eventId: number; userId: string; allowGlobalAdmin?: boolean }
): Promise<CalendarTenantEventManageAccess> {
	const tenantId = await getCalendarEventTenantId(db, input.eventId)
	if (!tenantId) return { ok: false, reason: 'not_found' }

	if (input.allowGlobalAdmin !== false && await isCalendarAdmin({ db, userId: input.userId })) {
		return { ok: true, tenantId, role: 'global-admin' }
	}

	const role = await getCalendarTenantRole(db, { tenantId, userId: input.userId })
	if (role === 'owner' || role === 'admin') return { ok: true, tenantId, role }
	return { ok: false, reason: 'forbidden' }
}

export async function listCalendarTenantMembers(db: D1DatabaseLike, input: { tenantId: number }) {
	const result = await db
		.prepare(
			`SELECT m.user_id, m.role, u.name, u.email
			 FROM calendar_tenant_members m
			 LEFT JOIN calendar_users u ON CAST(u.id AS TEXT) = CAST(m.user_id AS TEXT)
			 WHERE m.tenant_id = ?
			 ORDER BY CASE m.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, lower(COALESCE(u.name, u.email, m.user_id)) ASC`
		)
		.bind(input.tenantId)
		.all<TenantMemberRow>()
	return (result.results ?? []).map((row): CalendarTenantMember => ({
		userId: row.user_id,
		role: normalizeTenantRole(row.role),
		name: row.name,
		email: row.email
	}))
}

export async function listCalendarTenantInvites(db: D1DatabaseLike, input: { tenantId: number }) {
	const result = await db
		.prepare(
			`SELECT id, email, role, code, invited_by_user_id, accepted_user_id, accepted_at, expires_at, created_at
			 FROM calendar_tenant_invites
			 WHERE tenant_id = ?
			 ORDER BY created_at DESC, id DESC`
		)
		.bind(input.tenantId)
		.all<TenantInviteRow>()
	return (result.results ?? []).map(toTenantInvite)
}

export async function createCalendarTenantInvite(
	db: D1DatabaseLike,
	input: { tenantId: number; email: string; role: CalendarTenantRole; invitedByUserId: string }
) {
	const email = input.email.trim().toLowerCase()
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false as const, reason: 'invalid_email' as const }
	const role = normalizeTenantRole(input.role)
	const code = crypto.randomUUID().replace(/-/g, '').slice(0, 24)
	const existingUser = await db
		.prepare(`SELECT id FROM calendar_users WHERE lower(email) = lower(?) LIMIT 1`)
		.bind(email)
		.first<{ id: string | number }>()
	const acceptedUserId = existingUser?.id != null ? String(existingUser.id) : null
	const acceptedAt = acceptedUserId ? Math.floor(Date.now() / 1000) : null

	if (acceptedUserId) {
		await db
			.prepare(
				`INSERT INTO calendar_tenant_members (tenant_id, user_id, role, created_at, updated_at)
				 VALUES (?, ?, ?, unixepoch(), unixepoch())
				 ON CONFLICT(tenant_id, user_id) DO UPDATE SET role = excluded.role, updated_at = unixepoch()`
			)
			.bind(input.tenantId, acceptedUserId, role)
			.run()
	}

	const result = await db
		.prepare(
			`INSERT INTO calendar_tenant_invites (
				tenant_id, email, role, code, invited_by_user_id, accepted_user_id, accepted_at, expires_at, created_at, updated_at
			 )
			 VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch() + 1209600, unixepoch(), unixepoch())`
		)
		.bind(input.tenantId, email, role, code, input.invitedByUserId, acceptedUserId, acceptedAt)
		.run()
	return {
		ok: true as const,
		invite: {
			id: result.meta.last_row_id,
			email,
			role,
			code,
			invitedByUserId: input.invitedByUserId,
			acceptedUserId,
			acceptedAt,
			expiresAt: null,
			createdAt: Math.floor(Date.now() / 1000)
		} satisfies CalendarTenantInvite
	}
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
	return (result.results ?? []).map(toPublicTenantEvent)
}

export async function getPublicCalendarTenantEvent(
	db: D1DatabaseLike,
	input: { tenantId: number; eventId: number }
): Promise<CalendarTenantPublicEvent | null> {
	const row = await db
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
			   AND e.id = ?
			   AND e.status = 'scheduled'
			 LIMIT 1`
		)
		.bind(input.tenantId, input.eventId)
		.first<TenantPublicEventRow>()
	return row ? toPublicTenantEvent(row) : null
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
		...toPublicTenantEvent(row),
		status: row.status
	}))
}
