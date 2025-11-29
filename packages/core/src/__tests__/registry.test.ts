import { describe, it, expect } from 'bun:test'
import {
  createRegistry,
  registerTag,
  getTagMapping,
  DEFAULT_TAG_MAPPINGS,
} from '../registry.js'
import { withTag, withTags } from '../utils.js'
import type { TagRegistry, TagMapping } from '../registry.js'

describe('registry creation', () => {
  it('should create registry with default mappings', () => {
    const registry = createRegistry()

    expect(registry).toBeDefined()
    expect(typeof registry).toBe('object')
    expect(Object.keys(registry).length).toBeGreaterThan(0)
  })

  it('should include common content types', () => {
    const registry = createRegistry()

    expect(registry['project']).toBeDefined()
    expect(registry['project'].primitive).toBe('Content')
    expect(registry['essay']).toBeDefined()
    expect(registry['essay'].primitive).toBe('Content')
    expect(registry['task']).toBeDefined()
    expect(registry['person']).toBeDefined()
    expect(registry['skill']).toBeDefined()
  })

  it('should include reference types', () => {
    const registry = createRegistry()

    expect(registry['link']).toBeDefined()
    expect(registry['link'].primitive).toBe('Reference')
    expect(registry['reference']).toBeDefined()
    expect(registry['reference'].primitive).toBe('Reference')
  })

  it('should include meta types', () => {
    const registry = createRegistry()

    expect(registry['tag']).toBeDefined()
    expect(registry['tag'].primitive).toBe('Meta')
    expect(registry['comment']).toBeDefined()
    expect(registry['annotation']).toBeDefined()
  })

  it('should create independent copies', () => {
    const r1 = createRegistry()
    const r2 = createRegistry()

    r1['custom'] = { primitive: 'Content' }

    expect(r2['custom']).toBeUndefined()
  })
})

describe('tag mapping', () => {
  it('should get existing mapping', () => {
    const registry = createRegistry()
    const mapping = getTagMapping(registry, 'project')

    expect(mapping).toBeDefined()
    expect(mapping?.primitive).toBe('Content')
  })

  it('should return undefined for unknown tag', () => {
    const registry = createRegistry()
    const mapping = getTagMapping(registry, 'unknown-tag')

    expect(mapping).toBeUndefined()
  })

  it('should register new tag (mutable)', () => {
    const registry = createRegistry()
    
    registerTag(registry, 'recipe', {
      primitive: 'Content',
      attributes: { cuisine: 'italian' },
    })

    expect(registry['recipe']).toBeDefined()
    expect(registry['recipe'].primitive).toBe('Content')
    expect(registry['recipe'].attributes).toEqual({ cuisine: 'italian' })
  })

  it('should overwrite existing tag (mutable)', () => {
    const registry = createRegistry()
    
    registerTag(registry, 'project', {
      primitive: 'Content',
      attributes: { custom: true },
    })

    expect(registry['project'].attributes).toEqual({ custom: true })
  })
})

describe('immutable registry operations', () => {
  it('should add single tag without mutating original', () => {
    const original = createRegistry()
    const originalKeys = Object.keys(original).length

    const updated = withTag(original, 'recipe', {
      primitive: 'Content',
      attributes: { cuisine: 'italian' },
    })

    expect(updated['recipe']).toBeDefined()
    expect(updated['recipe'].primitive).toBe('Content')
    expect(original['recipe']).toBeUndefined()
    expect(Object.keys(original).length).toBe(originalKeys)
  })

  it('should add multiple tags without mutating original', () => {
    const original = createRegistry()
    const originalKeys = Object.keys(original).length

    const updated = withTags(original, {
      'recipe': { primitive: 'Content' },
      'ingredient': { primitive: 'Content' },
      'method': { primitive: 'Content' },
    })

    expect(updated['recipe']).toBeDefined()
    expect(updated['ingredient']).toBeDefined()
    expect(updated['method']).toBeDefined()
    expect(original['recipe']).toBeUndefined()
    expect(Object.keys(original).length).toBe(originalKeys)
  })

  it('should chain multiple withTag calls', () => {
    const registry = createRegistry()
    
    const updated = withTag(
      withTag(
        withTag(registry, 'a', { primitive: 'Content' }),
        'b', { primitive: 'Reference' }
      ),
      'c', { primitive: 'Meta' }
    )

    expect(updated['a']).toBeDefined()
    expect(updated['b']).toBeDefined()
    expect(updated['c']).toBeDefined()
    expect(registry['a']).toBeUndefined()
  })
})

describe('validation and transformation', () => {
  it('should store validation function', () => {
    const registry = createRegistry()
    const validate = (attrs: Record<string, any>) => attrs.servings > 0

    registerTag(registry, 'recipe', {
      primitive: 'Content',
      validate,
    })

    expect(registry['recipe'].validate).toBeDefined()
    expect(registry['recipe'].validate?.({ servings: 4 })).toBe(true)
    expect(registry['recipe'].validate?.({ servings: -1 })).toBe(false)
  })

  it('should store transformation function', () => {
    const registry = createRegistry()
    const transform = (attrs: Record<string, any>) => ({
      ...attrs,
      normalized: attrs.name?.toLowerCase(),
    })

    registerTag(registry, 'custom', {
      primitive: 'Content',
      transform,
    })

    expect(registry['custom'].transform).toBeDefined()
    const result = registry['custom'].transform?.({ name: 'TEST' })
    expect(result?.normalized).toBe('test')
  })

  it('should support both validate and transform', () => {
    const registry = createRegistry()

    registerTag(registry, 'validated-tag', {
      primitive: 'Content',
      validate: (attrs) => typeof attrs.required === 'string',
      transform: (attrs) => ({ ...attrs, processed: true }),
    })

    const mapping = registry['validated-tag']
    expect(mapping.validate?.({ required: 'yes' })).toBe(true)
    expect(mapping.validate?.({ required: 123 })).toBe(false)
    expect(mapping.transform?.({ required: 'yes' })).toEqual({
      required: 'yes',
      processed: true,
    })
  })
})

describe('edge cases', () => {
  it('should handle empty tag name', () => {
    const registry = createRegistry()
    registerTag(registry, '', { primitive: 'Content' })
    expect(registry['']).toBeDefined()
  })

  it('should handle special characters in tag name', () => {
    const registry = createRegistry()
    registerTag(registry, 'my-custom-tag', { primitive: 'Content' })
    registerTag(registry, 'tag_with_underscore', { primitive: 'Content' })
    
    expect(registry['my-custom-tag']).toBeDefined()
    expect(registry['tag_with_underscore']).toBeDefined()
  })

  it('should handle undefined attributes', () => {
    const registry = createRegistry()
    registerTag(registry, 'simple', { primitive: 'Content' })
    
    expect(registry['simple'].attributes).toBeUndefined()
  })
})
