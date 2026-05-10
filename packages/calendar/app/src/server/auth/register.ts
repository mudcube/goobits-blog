import { CredentialsProvider } from '@goobits/auth/providers'
import { createCalendarUserAdapter, type D1DatabaseLike } from '@calendar/kit'
import { setUserProgramAccess } from '@calendar/core/invites'
import { issueEmailVerification } from '../email/verification'

export type RegisterUserInput = {
	name: string
	email: string
	password: string
	baseUrl: string
	env: Record<string, string | undefined>
}

export type RegisterUserResult = {
	ok: boolean
	error?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(email: string) {
	return email.trim().toLowerCase()
}

function validatePassword(password: string) {
	const trimmed = password.trim()
	if (trimmed.length < 10) return 'Password must be at least 10 characters.'
	if (!/[a-z]/.test(trimmed) || !/[A-Z]/.test(trimmed) || !/[0-9]/.test(trimmed)) {
		return 'Password must include upper, lower, and number.'
	}
	return ''
}

function createCredentialsProvider() {
	return new CredentialsProvider({
		validatePassword(password) {
			const message = validatePassword(password)
			if (!message) return { valid: true, errors: [] }
			return { valid: false, errors: [message] }
		}
	})
}

async function rollbackRegistration(db: D1DatabaseLike, userId: string) {
	await db.prepare('DELETE FROM calendar_email_verifications WHERE user_id = ?').bind(userId).run()
	await db.prepare('DELETE FROM calendar_users WHERE id = ?').bind(userId).run()
}

export async function registerUser(db: D1DatabaseLike, input: RegisterUserInput): Promise<RegisterUserResult> {
	const email = normalizeEmail(input.email)
	const name = input.name.trim()
	const password = input.password

	if (!name || !email || !password) {
		return { ok: false, error: 'Please fill in all required fields.' }
	}
	if (!EMAIL_RE.test(email)) {
		return { ok: false, error: 'Please use a valid email address.' }
	}
	const passwordError = validatePassword(password)
	if (passwordError) {
		return { ok: false, error: passwordError }
	}

	const userAdapter = createCalendarUserAdapter(db)
	const existingUser = await userAdapter.getUserByEmail(email)
	if (existingUser) {
		return { ok: false, error: 'We could not complete that request. Please try again later.' }
	}

	const provider = createCredentialsProvider()
	const user = await provider.signUp({
		email,
		name,
		password,
		userAdapter
	})

	const userId = typeof user['id'] === 'string' ? user['id'] : ''
	if (!userId) {
		return { ok: false, error: 'We could not complete that request. Please try again later.' }
	}

	const enabledPrograms = await db.prepare(
		`SELECT slug FROM calendar_programs WHERE enabled = 1`
	).all<{ slug: string }>()
	await setUserProgramAccess(
		db,
		userId,
		(enabledPrograms.results ?? []).map((program) => ({
			programSlug: program.slug,
			allowed: true
		}))
	)

	const verification = await issueEmailVerification({
		db,
		userId,
		email,
		baseUrl: input.baseUrl,
		env: input.env
	})

	if (!verification.sent && input.env['NODE_ENV'] !== 'development') {
		await rollbackRegistration(db, userId)
		return { ok: false, error: 'We could not send the verification email. Please try again later.' }
	}

	return { ok: true }
}
