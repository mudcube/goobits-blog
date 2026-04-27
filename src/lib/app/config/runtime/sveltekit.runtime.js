import fs from 'fs'
import path from 'path'

const staticDir = path.join(process.cwd(), 'static')

export function hasStaticFile(urlPath) {
	const cleanPath = urlPath.split('?')[0]?.split('#')[0] ?? urlPath
	const normalizedPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath
	const candidates = []

	if (normalizedPath.endsWith('/')) {
		candidates.push(`${normalizedPath}index.html`)
	}
	candidates.push(normalizedPath)
	if (!normalizedPath.endsWith('.html')) {
		candidates.push(`${normalizedPath}.html`)
	}

	return candidates.some((candidate) => fs.existsSync(path.join(staticDir, candidate)))
}

export function handlePrerenderHttpError(pathname, message) {
	if (pathname.startsWith('/labs/') && hasStaticFile(pathname)) {
		return
	}
	if (pathname.includes('[') && pathname.includes(']')) {
		return
	}
	if (/\.(webp|png|jpe?g|gif|svg|ico)(\b|\/)/i.test(pathname)) {
		return
	}
	if (pathname.includes('/images/')) {
		return
	}
	throw new Error(message)
}
