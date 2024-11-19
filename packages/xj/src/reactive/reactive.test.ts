/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { reactive } from './reactive'

describe('reactive', () => {
  it('正确赋值', () => {
    const obj = { a: 1, b: 2 }
    const reactiveObj = reactive(obj)

    expect(reactiveObj).toEqual(obj)
  })

  it('修改属性', () => {
    const obj = { a: 1, b: 2 }
    const reactiveObj = reactive(obj)

    reactiveObj.a = 3
    expect(reactiveObj.a).toBe(3)
  })

  it('添加属性', () => {
    const obj = { a: 1, b: 2 }
    const reactiveObj = reactive(obj)

    ;(reactiveObj as any).c = 3
    expect((reactiveObj as any).c).toBe(3)
  })

  it('删除属性', () => {
    const obj = { a: 1, b: 2 }
    const reactiveObj = reactive<{
      a: number
      b?: number
    }>(obj)

    delete reactiveObj.b
    expect(reactiveObj.b).toBeUndefined()
  })
})
