/**
 * One-step production deploy:
 * 1) Push secrets (when --full)
 * 2) Build
 * 3) Deploy Cloudflare Pages artifact
 *
 * Usage:
 *   pnpm deploy:prod
 *   pnpm deploy:prod -- --full
 *   pnpm deploy:prod -- --skip-migrations
 */

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const args = process.argv.slice(2)
const fullDeploy = args.includes('--full')
const skipMigrations = args.includes('--skip-migrations')
const projectName = process.env.CF_PAGES_PROJECT || 'miko-art'

function run(cmd, cmdArgs) {
	const result = spawnSync(cmd, cmdArgs, { stdio: 'inherit' })
	if (result.status !== 0) {
		process.exit(result.status ?? 1)
	}
}

function assertD1IsConfigured() {
	const wranglerToml = readFileSync('wrangler.toml', 'utf8')
	if (wranglerToml.includes('database_id = "your-database-id-here"')) {
		console.error('wrangler.toml has a placeholder D1 database_id. Set the real value before deploying.')
		process.exit(1)
	}
}

if (fullDeploy) {
	run('pnpm', ['deploy:secrets'])
}

if (!skipMigrations) {
	assertD1IsConfigured()
	run('wrangler', ['d1', 'migrations', 'apply', 'DB', '--remote'])
}

run('pnpm', ['build'])
run('wrangler', ['pages', 'deploy', '.svelte-kit/cloudflare', '--project-name', projectName])
