import { describe, it, expect } from 'vitest'
import { bemClasses, dynamicClasses, propertyModifier, ClassNames } from '../utils/classUtils.js'

describe('classUtils', () => {
  describe('bemClasses', () => {
    it('returns block class when no options provided', () => {
      expect(bemClasses('goo__card')).toBe('goo__card')
    })

    it('adds modifiers with double-dash notation', () => {
      expect(bemClasses('goo__card', { modifiers: ['large'] }))
        .toBe('goo__card goo__card--large')

      expect(bemClasses('goo__card', { modifiers: ['large', 'featured'] }))
        .toBe('goo__card goo__card--large goo__card--featured')
    })

    it('adds elements with single-dash notation', () => {
      expect(bemClasses('goo__card', { elements: ['title'] }))
        .toBe('goo__card goo__card-title')

      expect(bemClasses('goo__card', { elements: ['title', 'content'] }))
        .toBe('goo__card goo__card-title goo__card-content')
    })

    it('adds element modifiers', () => {
      expect(bemClasses('goo__card', {
        elementModifiers: { title: ['large'] }
      })).toBe('goo__card goo__card-title--large')
    })

    it('appends additional className', () => {
      expect(bemClasses('goo__card', { className: 'custom-class' }))
        .toBe('goo__card custom-class')
    })

    it('combines all options correctly', () => {
      const result = bemClasses('goo__card', {
        modifiers: ['featured'],
        elements: ['title'],
        elementModifiers: { content: ['bold'] },
        className: 'extra'
      })
      expect(result).toBe('goo__card goo__card--featured goo__card-title goo__card-content--bold extra')
    })

    it('filters out empty/falsy modifiers', () => {
      expect(bemClasses('goo__card', { modifiers: ['', null, 'valid', undefined] }))
        .toBe('goo__card goo__card--valid')
    })

    it('throws TypeError for non-string block', () => {
      expect(() => bemClasses(123)).toThrow(TypeError)
      expect(() => bemClasses(null)).toThrow(TypeError)
    })
  })

  describe('dynamicClasses', () => {
    it('applies modifiers based on truthy conditions', () => {
      expect(dynamicClasses('goo__btn', { active: true, disabled: false }))
        .toBe('goo__btn goo__btn--active')
    })

    it('applies multiple modifiers for multiple truthy conditions', () => {
      expect(dynamicClasses('goo__btn', { active: true, large: true }))
        .toBe('goo__btn goo__btn--active goo__btn--large')
    })

    it('returns only block when all conditions are falsy', () => {
      expect(dynamicClasses('goo__btn', { active: false, disabled: false }))
        .toBe('goo__btn')
    })

    it('appends additional className', () => {
      expect(dynamicClasses('goo__btn', { active: true }, 'extra'))
        .toBe('goo__btn goo__btn--active extra')
    })

    it('throws TypeError for non-string block', () => {
      expect(() => dynamicClasses(null)).toThrow(TypeError)
    })
  })

  describe('propertyModifier', () => {
    it('creates modifier class from property and value', () => {
      expect(propertyModifier('goo__card', 'size', 'large'))
        .toBe('goo__card--size-large')
    })

    it('handles numeric values', () => {
      expect(propertyModifier('goo__grid', 'columns', 3))
        .toBe('goo__grid--columns-3')
    })

    it('returns empty string for falsy values', () => {
      expect(propertyModifier('goo__card', 'size', '')).toBe('')
      expect(propertyModifier('goo__card', 'size', null)).toBe('')
      expect(propertyModifier('goo__card', 'size', undefined)).toBe('')
    })

    it('throws TypeError for non-string block or property', () => {
      expect(() => propertyModifier(123, 'size', 'large')).toThrow(TypeError)
      expect(() => propertyModifier('goo__card', 123, 'large')).toThrow(TypeError)
    })
  })

  describe('ClassNames', () => {
    it('exports standard component class names', () => {
      expect(ClassNames.blogCard).toBe('goo__card')
      expect(ClassNames.postList).toBe('goo__post-list')
      expect(ClassNames.tags).toBe('goo__tags')
      expect(ClassNames.categories).toBe('goo__categories')
    })
  })
})
