import { readFileSync } from 'node:fs'

const routesPath = '.svelte-kit/cloudflare/_routes.json'
const requiredIncludes = ['/api/*', '/auth/*', '/schedule', '/schedule/*']

let routes
try {
	routes = JSON.parse(readFileSync(routesPath, 'utf8'))
} catch (error) {
	console.error(`[cloudflare-routes] Unable to read ${routesPath}. Run pnpm build first.`)
	console.error(error instanceof Error ? error.message : String(error))
	process.exit(1)
}

const include = Array.isArray(routes.include) ? routes.include : []
const missing = requiredIncludes.filter((route) => !include.includes(route))

if (missing.length > 0) {
	console.error(`[cloudflare-routes] Missing required function route(s): ${missing.join(', ')}`)
	process.exit(1)
}

console.log(`[cloudflare-routes] OK: ${requiredIncludes.length} required function route(s) present.`)
