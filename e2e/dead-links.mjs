#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const ROUTES_DIR = path.join(ROOT, 'src', 'routes')
const STATIC_DIR = path.join(ROOT, 'static')
const SRC_DIR = path.join(ROOT, 'src')

const SOURCE_EXTENSIONS = new Set(['.svelte', '.ts', '.js', '.scss', '.css', '.md', '.svx'])
const PAGE_FILE_RE = /^\+page\.(svelte|ts|js)$/
const SERVER_FILE_RE = /^\+server\.(ts|js)$/

const EXEMPT_PATHS = new Set([
  '/sitemap.xml',
  '/robots.txt'
])

const IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.avif',
  '.ico'
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
  if (/^(https?:|mailto:|tel:|#|javascript:|data:)/i.test(raw)) return null
  let v = raw.trim()
  // Avoid flagging templated paths like `/media/project-{id}.png` in Svelte styles.
  if (/[{}]/.test(v)) return null
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

function extractCssUrlValues(content) {
  const values = []
  const re = /url\(\s*(["']?)([^"')]+)\1\s*\)/g
  for (const match of content.matchAll(re)) values.push(match[2])
  return values
}

function extractSrcsetUrls(raw) {
  const urls = []
  for (const part of String(raw).split(',')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const url = trimmed.split(/\s+/)[0]
    if (url) urls.push(url)
  }
  return urls
}

function extnameFromUrlPath(p) {
  try {
    return path.extname(p)
  } catch {
    return ''
  }
}

function isLikelyImagePath(p) {
  const ext = extnameFromUrlPath(p).toLowerCase()
  return IMAGE_EXTENSIONS.has(ext)
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
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
  const missingImages = []

  for (const file of sourceFiles) {
    const content = await fs.readFile(file, 'utf8')

    for (const href of extractAttrValues(content, 'href')) {
      const p = normalizeUrlPath(href)
      if (!p || EXEMPT_PATHS.has(p)) continue

      if (isLikelyImagePath(p)) {
        const assetPath = path.join(STATIC_DIR, p.slice(1))
        if (!await fileExists(assetPath)) {
          missingImages.push({ file: path.relative(ROOT, file), src: p })
        }
      } else {
        const existsStatic = staticRoutes.has(p)
        const existsDynamic = dynamicRoutes.some((re) => re.test(p))
        if (!existsStatic && !existsDynamic) {
          dead.push({ file: path.relative(ROOT, file), href: p })
        }
      }
    }

    const imageCandidates = [
      ...extractAttrValues(content, 'src'),
      ...extractAttrValues(content, 'poster'),
      ...extractAttrValues(content, 'data-src'),
      ...extractAttrValues(content, 'data-poster'),
      ...extractCssUrlValues(content)
    ]
    for (const src of imageCandidates) {
      const p = normalizeUrlPath(src)
      if (!p) continue
      if (!isLikelyImagePath(p)) continue
      const assetPath = path.join(STATIC_DIR, p.slice(1))
      if (!await fileExists(assetPath)) {
        missingImages.push({ file: path.relative(ROOT, file), src: p })
      }
    }

    for (const srcset of extractAttrValues(content, 'srcset')) {
      for (const candidate of extractSrcsetUrls(srcset)) {
        const p = normalizeUrlPath(candidate)
        if (!p) continue
        if (!isLikelyImagePath(p)) continue
        const assetPath = path.join(STATIC_DIR, p.slice(1))
        if (!await fileExists(assetPath)) {
          missingImages.push({ file: path.relative(ROOT, file), src: p })
        }
      }
    }
  }

  if (dead.length === 0 && missingImages.length === 0) {
    console.log('OK: no dead internal href links or missing static images detected.')
    return
  }

  if (dead.length) {
    console.error('\nDead internal links:')
    for (const d of dead) console.error(`- ${d.href} in ${d.file}`)
  }

  if (missingImages.length) {
    console.error('\nMissing static images:')
    for (const d of missingImages) console.error(`- ${d.src} in ${d.file}`)
  }

  process.exitCode = 1
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
