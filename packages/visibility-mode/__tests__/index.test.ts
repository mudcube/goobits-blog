import { describe, expect, it } from 'vitest'
import {
	getActiveReleaseStage,
	getConfiguredReleaseStage,
	getPreviewReleaseStage,
	getTarget,
	isLocalPreviewHost,
	isNavItemVisibleInStage,
	isRouteReleased,
	isVisibleInStage,
	normalizeReleaseStage,
	normalizeTarget,
	type ReleasedNavItem,
	type ReleasedRoute
} from '../src/index.js'
import type { Cookies } from '@sveltejs/kit'

function makeCookies(map: Record<string, string> = {}): Cookies {
	// Minimal Cookies stub — the package only calls `.get(name)`.
	return {
		get: (name: string) => map[name],
		getAll: () => Object.entries(map).map(([name, value]) => ({ name, value })),
		set: () => {},
		delete: () => {},
		serialize: () => ''
	} as unknown as Cookies
}

describe('normalize*', () => {
	it('coerces unknown strings to live/dev', () => {
		expect(normalizeReleaseStage(undefined)).toBe('live')
		expect(normalizeReleaseStage(null)).toBe('live')
		expect(normalizeReleaseStage('')).toBe('live')
		expect(normalizeReleaseStage('garbage')).toBe('live')
		expect(normalizeReleaseStage('live')).toBe('live')
		expect(normalizeReleaseStage('preview')).toBe('preview')

		expect(normalizeTarget(undefined)).toBe('dev')
		expect(normalizeTarget('')).toBe('dev')
		expect(normalizeTarget('garbage')).toBe('dev')
		expect(normalizeTarget('production')).toBe('production')
	})
})

describe('getActiveReleaseStage precedence (security-critical)', () => {
	it('returns live by default when no env, no cookie', () => {
		expect(getActiveReleaseStage({ env: {} })).toBe('live')
	})

	it('reads the env var when no cookie override is enabled', () => {
		expect(
			getActiveReleaseStage({
				env: { PUBLIC_RELEASE_STAGE: 'preview' }
			})
		).toBe('preview')
	})

	it('ignores the cookie when enablePreview is false', () => {
		const cookies = makeCookies({ 'site-release-preview': 'preview' })
		expect(getActiveReleaseStage({ cookies, env: {}, enablePreview: false })).toBe('live')
	})

	it('honors the cookie ONLY when enablePreview is true', () => {
		const cookies = makeCookies({ 'site-release-preview': 'preview' })
		expect(getActiveReleaseStage({ cookies, env: {}, enablePreview: true })).toBe('preview')
	})

	it('cookie overrides env when enablePreview is true', () => {
		const cookies = makeCookies({ 'site-release-preview': 'live' })
		expect(
			getActiveReleaseStage({
				cookies,
				env: { PUBLIC_RELEASE_STAGE: 'preview' },
				enablePreview: true
			})
		).toBe('live')
	})

	it('falls through to env when enablePreview is true but cookie is unset', () => {
		const cookies = makeCookies({})
		expect(
			getActiveReleaseStage({
				cookies,
				env: { PUBLIC_RELEASE_STAGE: 'preview' },
				enablePreview: true
			})
		).toBe('preview')
	})

	it('honors a custom cookieName + envVarName', () => {
		const cookies = makeCookies({ 'my-custom-cookie': 'preview' })
		expect(
			getActiveReleaseStage({
				cookies,
				env: { MY_STAGE_VAR: 'live' },
				enablePreview: true,
				cookieName: 'my-custom-cookie',
				envVarName: 'MY_STAGE_VAR'
			})
		).toBe('preview')
	})
})

describe('getConfiguredReleaseStage / getPreviewReleaseStage / getTarget', () => {
	it('getConfiguredReleaseStage reads the env directly', () => {
		expect(getConfiguredReleaseStage({ PUBLIC_RELEASE_STAGE: 'preview' })).toBe('preview')
		expect(getConfiguredReleaseStage({})).toBe('live')
	})

	it('getPreviewReleaseStage returns null when cookie is unset', () => {
		expect(getPreviewReleaseStage(makeCookies({}))).toBe(null)
	})

	it('getPreviewReleaseStage returns the cookie value when set', () => {
		expect(getPreviewReleaseStage(makeCookies({ 'site-release-preview': 'preview' }))).toBe(
			'preview'
		)
	})

	it('getTarget reads the cookie or falls back to dev', () => {
		expect(getTarget()).toBe('dev')
		expect(getTarget(makeCookies({}))).toBe('dev')
		expect(getTarget(makeCookies({ 'site-target': 'production' }))).toBe('production')
	})
})

describe('isVisibleInStage / isNavItemVisibleInStage', () => {
	it('live items always render', () => {
		expect(isVisibleInStage('live', 'live')).toBe(true)
		expect(isVisibleInStage('live', 'preview')).toBe(true)
	})

	it('preview items only render in preview', () => {
		expect(isVisibleInStage('preview', 'live')).toBe(false)
		expect(isVisibleInStage('preview', 'preview')).toBe(true)
	})

	it('nav item filtering matches by stages array', () => {
		const liveOnly: ReleasedNavItem = { href: '/x', label: 'x', stages: ['live'] }
		const previewOnly: ReleasedNavItem = { href: '/y', label: 'y', stages: ['preview'] }
		const both: ReleasedNavItem = { href: '/z', label: 'z', stages: ['live', 'preview'] }

		expect(isNavItemVisibleInStage(liveOnly, 'live')).toBe(true)
		expect(isNavItemVisibleInStage(liveOnly, 'preview')).toBe(false)
		expect(isNavItemVisibleInStage(previewOnly, 'live')).toBe(false)
		expect(isNavItemVisibleInStage(previewOnly, 'preview')).toBe(true)
		expect(isNavItemVisibleInStage(both, 'live')).toBe(true)
		expect(isNavItemVisibleInStage(both, 'preview')).toBe(true)
	})
})

describe('isRouteReleased', () => {
	const routes: ReleasedRoute[] = [
		{ path: '/art', stage: 'preview' },
		{ path: '/music', stage: 'preview' }
	]

	it('returns true for paths not in the registry', () => {
		expect(isRouteReleased('/journal', routes, 'live')).toBe(true)
		expect(isRouteReleased('/about', routes, 'live')).toBe(true)
	})

	it('gates exact path matches', () => {
		expect(isRouteReleased('/art', routes, 'live')).toBe(false)
		expect(isRouteReleased('/art', routes, 'preview')).toBe(true)
	})

	it('gates child paths under a registered prefix', () => {
		expect(isRouteReleased('/art/gallery', routes, 'live')).toBe(false)
		expect(isRouteReleased('/art/gallery', routes, 'preview')).toBe(true)
	})

	it('does NOT match unrelated paths that happen to start with the same letters', () => {
		expect(isRouteReleased('/artist', routes, 'live')).toBe(true)
	})
})

describe('isLocalPreviewHost', () => {
	it('accepts loopback hostnames', () => {
		expect(isLocalPreviewHost('localhost')).toBe(true)
		expect(isLocalPreviewHost('127.0.0.1')).toBe(true)
		expect(isLocalPreviewHost('0.0.0.0')).toBe(true)
		expect(isLocalPreviewHost('::1')).toBe(true)
	})

	it('accepts .local and .localhost suffixes', () => {
		expect(isLocalPreviewHost('my-mac.local')).toBe(true)
		expect(isLocalPreviewHost('app.localhost')).toBe(true)
	})

	it('accepts RFC 1918 private LAN ranges', () => {
		expect(isLocalPreviewHost('10.0.0.5')).toBe(true)
		expect(isLocalPreviewHost('192.168.1.42')).toBe(true)
		expect(isLocalPreviewHost('172.16.0.1')).toBe(true)
		expect(isLocalPreviewHost('172.31.255.255')).toBe(true)
	})

	it('rejects public hostnames and out-of-range IPs', () => {
		expect(isLocalPreviewHost('example.com')).toBe(false)
		expect(isLocalPreviewHost('miko.art')).toBe(false)
		expect(isLocalPreviewHost('8.8.8.8')).toBe(false)
		expect(isLocalPreviewHost('172.15.0.1')).toBe(false) // just outside 172.16/12
		expect(isLocalPreviewHost('172.32.0.1')).toBe(false)
		expect(isLocalPreviewHost('11.0.0.1')).toBe(false)
		expect(isLocalPreviewHost('')).toBe(false)
	})
})
