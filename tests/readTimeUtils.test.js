import { describe, it, expect } from 'vitest'
import { calculateReadTime, getPostReadTime, DEFAULT_READ_TIME_CONFIG } from '../utils/readTimeUtils.js'

describe('readTimeUtils', () => {
  describe('calculateReadTime', () => {
    it('returns default time for empty content', () => {
      expect(calculateReadTime('')).toBe(DEFAULT_READ_TIME_CONFIG.defaultTime)
      expect(calculateReadTime(null)).toBe(DEFAULT_READ_TIME_CONFIG.defaultTime)
      expect(calculateReadTime(undefined)).toBe(DEFAULT_READ_TIME_CONFIG.defaultTime)
    })

    it('calculates read time based on word count', () => {
      // At 225 WPM: 225 words = 1 min, 450 = 2 min, 675 = 3 min, 900 = 4 min
      // Minimum is 3 minutes (defaultTime)
      expect(calculateReadTime('word '.repeat(225))).toBe(3) // 1 min rounds to minimum
      expect(calculateReadTime('word '.repeat(675))).toBe(3) // exactly 3 min
      expect(calculateReadTime('word '.repeat(900))).toBe(4) // 4 min
      expect(calculateReadTime('word '.repeat(1125))).toBe(5) // 5 min
    })

    it('adds time for markdown headings', () => {
      // 675 words in body + ~10 words in headings = ~685 words
      // 685 / 225 = 3.04 -> ceil = 4 minutes base
      // 5 headings / headingsWeight(5) = 1 additional minute
      // Total = 5 minutes
      const content = `# Heading 1
${'word '.repeat(135)}
## Heading 2
${'word '.repeat(135)}
### Heading 3
${'word '.repeat(135)}
#### Heading 4
${'word '.repeat(135)}
##### Heading 5
${'word '.repeat(135)}`
      expect(calculateReadTime(content)).toBe(5)
    })

    it('respects custom wordsPerMinute option', () => {
      // 200 words at 100 WPM = 2 minutes, but minimum is 3
      // 400 words at 100 WPM = 4 minutes (exceeds minimum)
      expect(calculateReadTime('word '.repeat(400), { wordsPerMinute: 100 })).toBe(4)
    })

    it('respects custom defaultTime option', () => {
      expect(calculateReadTime('', { defaultTime: 5 })).toBe(5)
      expect(calculateReadTime('word '.repeat(100), { defaultTime: 5 })).toBe(5)
    })

    it('enforces minimum time for long articles', () => {
      // 1600 words > longArticleThreshold (1500), should be at least 5 min
      const longContent = 'word '.repeat(1600)
      const result = calculateReadTime(longContent)
      expect(result).toBeGreaterThanOrEqual(DEFAULT_READ_TIME_CONFIG.minTimeForLongArticle)
    })

    it('enforces minimum time for very long articles', () => {
      // 3100 words > veryLongArticleThreshold (3000), should be at least 10 min
      const veryLongContent = 'word '.repeat(3100)
      const result = calculateReadTime(veryLongContent)
      expect(result).toBeGreaterThanOrEqual(DEFAULT_READ_TIME_CONFIG.minTimeForVeryLongArticle)
    })

    it('strips HTML tags before counting words', () => {
      const htmlContent = '<p>word </p>'.repeat(225)
      const plainContent = 'word '.repeat(225)
      expect(calculateReadTime(htmlContent)).toBe(calculateReadTime(plainContent))
    })
  })

  describe('getPostReadTime', () => {
    it('returns default time for null/undefined post', () => {
      expect(getPostReadTime(null)).toBe(DEFAULT_READ_TIME_CONFIG.defaultTime)
      expect(getPostReadTime(undefined)).toBe(DEFAULT_READ_TIME_CONFIG.defaultTime)
    })

    it('uses explicit readTime from frontmatter when provided', () => {
      const post = { metadata: { fm: { readTime: 10 } } }
      expect(getPostReadTime(post)).toBe(10)
    })

    it('calculates from content when no explicit readTime', () => {
      const post = { content: 'word '.repeat(900) }
      expect(getPostReadTime(post)).toBe(4)
    })

    it('estimates from excerpt when no content (multiplied by 3)', () => {
      // Excerpt of 225 words -> calculateReadTime returns 3 (minimum)
      // 3 * 3 = 9 minutes estimated for full article
      const post = { metadata: { fm: { excerpt: 'word '.repeat(225) } } }
      expect(getPostReadTime(post)).toBe(9)
    })

    it('returns default for empty post object', () => {
      expect(getPostReadTime({})).toBe(DEFAULT_READ_TIME_CONFIG.defaultTime)
    })

    it('passes options through to calculation', () => {
      const post = { content: 'word '.repeat(400) }
      expect(getPostReadTime(post, { wordsPerMinute: 100 })).toBe(4)
    })
  })

  describe('DEFAULT_READ_TIME_CONFIG', () => {
    it('exports expected configuration values', () => {
      expect(DEFAULT_READ_TIME_CONFIG).toEqual({
        wordsPerMinute: 225,
        defaultTime: 3,
        minTimeForLongArticle: 5,
        minTimeForVeryLongArticle: 10,
        longArticleThreshold: 1500,
        veryLongArticleThreshold: 3000,
        headingsWeight: 5
      })
    })
  })
})
