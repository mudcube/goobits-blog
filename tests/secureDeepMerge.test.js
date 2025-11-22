import { describe, it, expect } from 'vitest'
import { secureDeepMerge, isSafeKey } from '../config/secureDeepMerge.js'

describe('secureDeepMerge', () => {
  describe('isSafeKey', () => {
    it('returns true for safe keys', () => {
      expect(isSafeKey('name')).toBe(true)
      expect(isSafeKey('value')).toBe(true)
      expect(isSafeKey('nested')).toBe(true)
      expect(isSafeKey('config')).toBe(true)
    })

    it('returns false for dangerous keys', () => {
      expect(isSafeKey('__proto__')).toBe(false)
      expect(isSafeKey('constructor')).toBe(false)
      expect(isSafeKey('prototype')).toBe(false)
    })

    it('returns false for non-string keys', () => {
      expect(isSafeKey(123)).toBe(false)
      expect(isSafeKey(null)).toBe(false)
      expect(isSafeKey(undefined)).toBe(false)
    })
  })

  describe('secureDeepMerge', () => {
    it('merges simple objects', () => {
      const target = { a: 1, b: 2 }
      const source = { b: 3, c: 4 }
      const result = secureDeepMerge(target, source)

      expect(result).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('does not mutate the original target', () => {
      const target = { a: 1 }
      const source = { b: 2 }
      secureDeepMerge(target, source)

      expect(target).toEqual({ a: 1 })
    })

    it('deeply merges nested objects', () => {
      const target = {
        config: {
          theme: 'light',
          settings: { timeout: 100 }
        }
      }
      const source = {
        config: {
          theme: 'dark',
          settings: { retry: 3 }
        }
      }
      const result = secureDeepMerge(target, source)

      expect(result.config.theme).toBe('dark')
      expect(result.config.settings.timeout).toBe(100)
      expect(result.config.settings.retry).toBe(3)
    })

    it('replaces arrays instead of merging them', () => {
      const target = { arr: [1, 2, 3] }
      const source = { arr: [4, 5] }
      const result = secureDeepMerge(target, source)

      expect(result.arr).toEqual([4, 5])
    })

    it('prevents __proto__ pollution', () => {
      const target = {}
      const maliciousSource = JSON.parse('{"__proto__": {"polluted": true}}')
      const result = secureDeepMerge(target, maliciousSource)

      // The __proto__ key should be skipped
      expect(result.polluted).toBeUndefined()
      expect({}.polluted).toBeUndefined()
    })

    it('prevents constructor pollution', () => {
      const target = {}
      const maliciousSource = { constructor: { polluted: true } }
      const result = secureDeepMerge(target, maliciousSource)

      // The constructor key should be skipped
      expect(result.constructor).toBe(Object)
    })

    it('prevents prototype pollution', () => {
      const target = {}
      const maliciousSource = { prototype: { polluted: true } }
      const result = secureDeepMerge(target, maliciousSource)

      // The prototype key should be skipped
      expect(result.prototype).toBeUndefined()
    })

    it('handles null/undefined sources gracefully', () => {
      const target = { a: 1 }

      expect(secureDeepMerge(target, null)).toEqual({ a: 1 })
      expect(secureDeepMerge(target, undefined)).toEqual({ a: 1 })
    })

    it('handles primitive source values', () => {
      const target = { a: 1 }

      expect(secureDeepMerge(target, 'string')).toEqual({ a: 1 })
      expect(secureDeepMerge(target, 123)).toEqual({ a: 1 })
    })
  })
})
