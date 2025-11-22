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
      // 225 words = 1 minute at default WPM, but minimum is 3
      const shortContent = 'word '.repeat(225)
      expect(calculateReadTime(shortContent)).toBe(3)

      // 675 words = 3 minutes at default WPM
      const mediumContent = 'word '.repeat(675)
      expect(calculateReadTime(mediumContent)).toBe(3)

      // 900 words = 4 minutes at default WPM
      const longerContent = 'word '.repeat(900)
      expect(calculateReadTime(longerContent)).toBe(4)
    })

    it('adds time for headings', () => {
      // Content with headings should take longer
      const contentWithHeadings = `
# Heading 1
${'word '.repeat(225)}

## Heading 2
${'word '.repeat(225)}

### Heading 3
${'word '.repeat(225)}
`
      const result = calculateReadTime(contentWithHeadings)
      expect(result).toBeGreaterThanOrEqual(3)
    })

    it('respects custom options', () => {
      const content = 'word '.repeat(100)
      const result = calculateReadTime(content, { wordsPerMinute: 100 })
      // 100 words at 100 WPM = 1 minute, but default minimum is 3
      expect(result).toBe(3)
    })

    it('strips HTML tags before counting', () => {
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

    it('uses explicit readTime from metadata if provided', () => {
      const post = {
        metadata: {
          fm: {
            readTime: 10
          }
        }
      }
      expect(getPostReadTime(post)).toBe(10)
    })

    it('calculates from content if no explicit readTime', () => {
      const post = {
        content: 'word '.repeat(900)
      }
      expect(getPostReadTime(post)).toBe(4)
    })

    it('estimates from excerpt if no content', () => {
      const post = {
        metadata: {
          fm: {
            excerpt: 'word '.repeat(100)
          }
        }
      }
      const result = getPostReadTime(post)
      expect(result).toBeGreaterThanOrEqual(DEFAULT_READ_TIME_CONFIG.defaultTime)
    })

    it('returns default for empty post object', () => {
      expect(getPostReadTime({})).toBe(DEFAULT_READ_TIME_CONFIG.defaultTime)
    })
  })

  describe('DEFAULT_READ_TIME_CONFIG', () => {
    it('has expected default values', () => {
      expect(DEFAULT_READ_TIME_CONFIG.wordsPerMinute).toBe(225)
      expect(DEFAULT_READ_TIME_CONFIG.defaultTime).toBe(3)
      expect(DEFAULT_READ_TIME_CONFIG.minTimeForLongArticle).toBe(5)
      expect(DEFAULT_READ_TIME_CONFIG.minTimeForVeryLongArticle).toBe(10)
    })
  })
})
