import { describe, it, expect } from 'vitest'
import { ref } from './ref'

/**
 * @vitest-environment jsdom
 */

describe('ref', () => {
  it('传入number', () => {
    const value = 42
    const result = ref(value)
    expect(result.value).toBe(value)
  })

  it('传入null', () => {
    const result = ref(null)
    expect(result.value).toBeNull()
  })

  it('传入object', () => {
    const value = { a: 1, b: 2 }
    const result = ref(value)
    expect(result.value).toEqual(value)
    expect(result.value.a).toBe(1)
  })

  it('传入array', () => {
    const value = [1, 2, 3]
    const result = ref(value)
    expect(result.value).toEqual(value)
    expect(result.value[0]).toBe(1)
  })

  it('传入字符串', () => {
    const value = 'hello'
    const result = ref(value)
    expect(result.value).toBe(value)
  })
})
