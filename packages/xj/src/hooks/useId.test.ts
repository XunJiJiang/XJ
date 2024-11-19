import { describe, it, expect } from 'vitest'
import useId from './useId'

describe('useId', () => {
  it('返回唯一实例', () => {
    const id1 = useId()
    const id2 = useId()
    const id3 = useId()

    expect(id1).toMatch(/::xj-web::\d+::/)
    expect(id2).toMatch(/::xj-web::\d+::/)
    expect(id3).toMatch(/::xj-web::\d+::/)

    expect(id1).not.toBe(id2)
    expect(id2).not.toBe(id3)
    expect(id1).not.toBe(id3)
  })
})
