#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const ROUTES_DIR = path.join(ROOT, 'src', 'routes')
const STATIC_DIR = path.join(ROOT, 'static')
const SRC_DIR = path.join(ROOT, 'src')

const SOURCE_EXTENSIONS = new Set(['.svelte', '.ts', '.js'])
const PAGE_FILE_RE = /^\+page\.(svelte|ts|js)$/
const SERVER_FILE_RE = /^\+server\.(ts|js)$/

const EXEMPT_PATHS = new Set([
  '/sitemap.xml',
  '/robots.txt'
])

async function walk(dir) {
  const out = []
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...(await walk(full)))
    } else {
      out.push(full)
    }
  }
  return out
}

function isRouteGroupSegment(segment) {
  return segment.startsWith('(') && segment.endsWith(')')
}

function routePathFromDir(dir) {
  const rel = path.relative(ROUTES_DIR, dir)
  if (!rel || rel === '.') return '/'
  const parts = rel.split(path.sep).filter(Boolean).filter((p) => !isRouteGroupSegment(p))
  return '/' + parts.join('/')
}

function normalizeUrlPath(raw) {
  if (!raw) return null
  if (/^(https?:|mailto:|tel:|#|javascript:)/i.test(raw)) return null
  let v = raw.trim()
  if (!v.startsWith('/')) return null
  v = v.split('#')[0].split('?')[0]
  if (!v) return '/'
  if (v.length > 1 && v.endsWith('/')) v = v.slice(0, -1)
  return v
}

function dynamicRouteToRegex(route) {
  const parts = route.split('/').filter(Boolean)
  const pattern = parts
    .map((part) => {
      if (part.startsWith('[...') && part.endsWith(']')) return '(.+)?'
      if (part.startsWith('[') && part.endsWith(']')) return '[^/]+'
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return new RegExp(`^/${pattern}$`)
}

function extractAttrValues(content, attr) {
  const values = []
  const re = new RegExp(`${attr}\\s*=\\s*(["'])(.*?)\\1`, 'g')
  for (const match of content.matchAll(re)) values.push(match[2])
  return values
}

async function collectRoutes() {
  const files = await walk(ROUTES_DIR)
  const staticRoutes = new Set()
  const dynamicRoutes = []

  for (const file of files) {
    const base = path.basename(file)
    if (!PAGE_FILE_RE.test(base) && !SERVER_FILE_RE.test(base)) continue
    const dir = path.dirname(file)
    const route = routePathFromDir(dir)
    if (route.includes('[')) {
      dynamicRoutes.push(dynamicRouteToRegex(route))
    } else {
      staticRoutes.add(route === '' ? '/' : route)
    }
  }

  return { staticRoutes, dynamicRoutes }
}

async function run() {
  const { staticRoutes, dynamicRoutes } = await collectRoutes()
  const sourceFiles = (await walk(SRC_DIR)).filter((f) => SOURCE_EXTENSIONS.has(path.extname(f)))

  const dead = []
  const missingAssets = []

  for (const file of sourceFiles) {
    const content = await fs.readFile(file, 'utf8')

    for (const href of extractAttrValues(content, 'href')) {
      const p = normalizeUrlPath(href)
      if (!p || EXEMPT_PATHS.has(p)) continue

      const existsStatic = staticRoutes.has(p)
      const existsDynamic = dynamicRoutes.some((re) => re.test(p))
      if (!existsStatic && !existsDynamic) {
        dead.push({ file: path.relative(ROOT, file), href: p })
      }
    }

    for (const src of extractAttrValues(content, 'src')) {
      const p = normalizeUrlPath(src)
      if (!p) continue
      if (!p.startsWith('/media/') && !p.startsWith('/fonts/') && !p.startsWith('/labs/')) continue
      const assetPath = path.join(STATIC_DIR, p.slice(1))
      try {
        await fs.access(assetPath)
      } catch {
        missingAssets.push({ file: path.relative(ROOT, file), src: p })
      }
    }
  }

  if (dead.length === 0 && missingAssets.length === 0) {
    console.log('OK: no dead internal href links or missing static assets detected.')
    return
  }

  if (dead.length) {
    console.error('\nDead internal links:')
    for (const d of dead) console.error(`- ${d.href} in ${d.file}`)
  }

  if (missingAssets.length) {
    console.error('\nMissing static assets:')
    for (const d of missingAssets) console.error(`- ${d.src} in ${d.file}`)
  }

  process.exitCode = 1
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
