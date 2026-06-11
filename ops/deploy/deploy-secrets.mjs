/**
 * Push encrypted production secrets to Cloudflare.
 * Usage: pnpm deploy:secrets
 *
 * Reads key names from .env.production, takes their decrypted values
 * from process.env (injected by dotenvx run), and pipes them to
 * `wrangler pages secret bulk`.
 */

import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const args = process.argv.slice(2)
const envFilePath = args.includes('--env-file')
	? args[args.indexOf('--env-file') + 1]
	: 'config/env/.env.production'
const explicitProjectName = args.includes('--project-name')
	? args[args.indexOf('--project-name') + 1]
	: ''

const resolvedEnvFilePath = isAbsolute(envFilePath) ? envFilePath : resolve(repoRoot, envFilePath)
const envFile = readFileSync(resolvedEnvFilePath, 'utf8')
const keys = envFile
	.split('\n')
	.map((l) => l.trim())
	.filter((l) => l && !l.startsWith('#') && !l.startsWith('DOTENV_') && l.includes('='))
	.map((l) => l.split('=')[0].trim())

const secrets = {}
for (const key of keys) {
	if (process.env[key]) secrets[key] = process.env[key]
}
const projectName = explicitProjectName || process.env.CF_PAGES_PROJECT || 'miko-art'
const tempSecretsDir = mkdtempSync(join(tmpdir(), 'wrangler-pages-secrets-'))
const tempSecretsFile = join(tempSecretsDir, 'secrets.json')

const count = Object.keys(secrets).length
if (count === 0) {
	console.error(`No secrets found. Fill in ${envFilePath} and encrypt it first.`)
	process.exit(1)
}

console.log(`Pushing ${count} secrets to Cloudflare: ${Object.keys(secrets).join(', ')}`)
writeFileSync(tempSecretsFile, JSON.stringify(secrets, null, 2), {
	mode: 0o600
})

try {
	const result = spawnSync('wrangler', ['pages', 'secret', 'bulk', tempSecretsFile, '--project-name', projectName], {
		stdio: 'inherit'
	})
	if (result.status !== 0) {
		process.exit(result.status ?? 1)
	}
} finally {
	rmSync(tempSecretsDir, { force: true, recursive: true })
}
