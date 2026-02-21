#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const STATIC_DIR = path.join(ROOT, 'static')
const SEARCH_DIRS = [
  path.join(ROOT, 'src'),
  path.join(ROOT, 'packages'),
  path.join(ROOT, 'repos'),
  path.join(ROOT, 'static')
]
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.ico'])
const REPORT_PATH = path.join(ROOT, '.llm', 'scratch', 'unused-image-candidates.txt')
const EXCLUDED_IMAGE_PREFIXES = ['labs/']
const RESERVED_IMAGE_PATHS = new Set(['favicon.png', 'favicon.ico', 'favicon.svg'])
const IMAGE_PATTERN = '(?:png|jpe?g|gif|webp|svg|avif|ico)'
const QUOTED_IMAGE_RE = new RegExp(`["'\`]([^"'\\\`\\s]+\\.(${IMAGE_PATTERN})(?:\\?[^"'\\\`\\s]*)?)["'\`]`, 'gi')
const MARKDOWN_IMAGE_RE = new RegExp(`\\(([^)\\s]+\\.(${IMAGE_PATTERN})(?:\\?[^)\\s]*)?)(?:\\s+["'][^"']*["'])?\\)`, 'gi')
const CSS_URL_IMAGE_RE = new RegExp(`url\\(\\s*(['"]?)([^)'"\\s]+\\.(${IMAGE_PATTERN})(?:\\?[^)'"\\s]*)?)\\1\\s*\\)`, 'gi')
const ATTR_IMAGE_RE = new RegExp(`\\b(?:src|href)=([^"'\\s>]+\\.(${IMAGE_PATTERN})(?:\\?[^"'\\s>]*)?)`, 'gi')
const TEXT_EXTS = new Set([
  '.ts',
  '.js',
  '.mjs',
  '.cjs',
  '.tsx',
  '.jsx',
  '.svelte',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.styl',
  '.html',
  '.md',
  '.mdx',
  '.svx',
  '.json',
  '.yml',
  '.yaml',
  '.txt',
  '.xml',
  '.webmanifest'
])

async function walk(dir) {
  const files = []
  let entries = []
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return files
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full)))
    } else {
      files.push(full)
    }
  }
  return files
}

function toPosix(filePath) {
  return filePath.replaceAll('\\\\', '/')
}

function normalizeRef(match) {
  const clean = match.replace(/[?#].*$/, '')
  if (clean.startsWith('/static/')) return clean.slice('/static/'.length)
  if (clean.startsWith('/')) return clean
  return clean
}

function shouldSkipImage(rel) {
  return EXCLUDED_IMAGE_PREFIXES.some((prefix) => rel.startsWith(prefix))
}

function isTextLikeFile(filePath) {
  return TEXT_EXTS.has(path.extname(filePath).toLowerCase())
}

function addReference(rawRef, sourceFile, referenced) {
  if (!rawRef) return
  const normalizedRef = normalizeRef(rawRef.trim())
  if (!normalizedRef) return

  if (normalizedRef.startsWith('http://') || normalizedRef.startsWith('https://') || normalizedRef.startsWith('data:')) return

  if (normalizedRef.startsWith('/')) {
    referenced.add(normalizedRef.replace(/^\//, ''))
    return
  }

  const resolved = path.resolve(path.dirname(sourceFile), normalizedRef)
  if (!resolved.startsWith(STATIC_DIR)) return

  const staticRelative = toPosix(path.relative(STATIC_DIR, resolved))
  referenced.add(staticRelative)
}

function buildTemplatePattern(patternRef) {
  const escaped = patternRef.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
  const wildcarded = escaped.replace(/\\\{[^}]+\\\}/g, '[^/]+')
  return new RegExp(`^${wildcarded}$`)
}

function extractImageRefs(content) {
  const refs = []
  for (const match of content.matchAll(QUOTED_IMAGE_RE)) refs.push(match[1])
  for (const match of content.matchAll(MARKDOWN_IMAGE_RE)) refs.push(match[1])
  for (const match of content.matchAll(CSS_URL_IMAGE_RE)) refs.push(match[2])
  for (const match of content.matchAll(ATTR_IMAGE_RE)) refs.push(match[1])
  return refs
}

function extractFrontmatter(md) {
  if (!md.startsWith('---')) return ''
  const endIndex = md.indexOf('\n---', 3)
  if (endIndex === -1) return ''
  return md.slice(3, endIndex)
}

function extractCoverImage(frontmatter) {
  if (!frontmatter) return ''
  const match = frontmatter.match(/^\s*coverImage\s*:\s*["']?([^"'#\n]+?)["']?\s*$/m)
  return match?.[1]?.trim() ?? ''
}

async function run() {
  const staticFiles = await walk(STATIC_DIR)
  const images = staticFiles.filter((file) => {
    if (!IMAGE_EXTS.has(path.extname(file).toLowerCase())) return false
    const rel = toPosix(path.relative(STATIC_DIR, file))
    return !shouldSkipImage(rel)
  })

  const sourceFiles = []
  for (const dir of SEARCH_DIRS) {
    sourceFiles.push(...(await walk(dir)))
  }

  const referenced = new Set()
  const templatePatterns = []
  for (const sourceFile of sourceFiles) {
    const relSource = toPosix(path.relative(ROOT, sourceFile))
    if (relSource === toPosix(path.relative(ROOT, REPORT_PATH))) continue

    if (!isTextLikeFile(sourceFile)) continue

    let content = ''
    try {
      content = await fs.readFile(sourceFile, 'utf8')
    } catch {
      continue
    }

    const imageRefs = extractImageRefs(content)
    for (const imageRef of imageRefs) {
      if (imageRef.includes('{') && imageRef.includes('}')) {
        const normalized = normalizeRef(imageRef.trim()).replace(/^\//, '')
        templatePatterns.push(buildTemplatePattern(normalized))
      }
      addReference(imageRef, sourceFile, referenced)
    }

    // Journal post cover images are often defined in frontmatter as bare filenames.
    // Resolve those to the post-local images/ directory.
    if (sourceFile.endsWith('/index.md') && toPosix(sourceFile).includes('/static/journal/')) {
      const frontmatter = extractFrontmatter(content)
      const coverImage = extractCoverImage(frontmatter)
      if (coverImage) {
        if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
          // External cover image; no local static asset to mark.
        } else if (coverImage.startsWith('/')) {
          addReference(coverImage, sourceFile, referenced)
        } else {
          addReference(`images/${coverImage}`, sourceFile, referenced)
        }
      }
    }
  }

  for (const imagePath of images) {
    const rel = toPosix(path.relative(STATIC_DIR, imagePath))
    if (templatePatterns.some((pattern) => pattern.test(rel))) {
      referenced.add(rel)
    }
  }

  const unused = []
  for (const imagePath of images) {
    const rel = toPosix(path.relative(STATIC_DIR, imagePath))
    if (shouldSkipImage(rel)) continue
    if (RESERVED_IMAGE_PATHS.has(rel)) continue
    if (!referenced.has(rel)) unused.push(rel)
  }

  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true })
  const lines = [
    `Total images in static/: ${images.length}`,
    `Unused image candidates: ${unused.length}`,
    '',
    ...unused.sort()
  ]
  await fs.writeFile(REPORT_PATH, `${lines.join('\n')}\n`, 'utf8')

  console.log(`Report written: ${toPosix(path.relative(ROOT, REPORT_PATH))}`)
  console.log(`Total images: ${images.length}`)
  console.log(`Unused candidates: ${unused.length}`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
