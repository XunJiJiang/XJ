import { describe, it, expect, vi } from 'vitest'
import { effect } from './effect'
import { ref } from './ref'
import { wait } from '@test/utils/wait'

/**
 * @vitest-environment jsdom
 */

describe('effect', () => {
  it('同步收集依赖', () => {
    const collRef = ref(0)
    const callback = vi.fn()
    effect(() => {
      callback(collRef.value)
    })
    expect(callback).toHaveBeenCalled()
  })

  it('返回停止函数', () => {
    const collRef = ref(0)
    const callback = vi.fn()
    const stop = effect(() => {
      callback(collRef.value)
    })
    stop()
    collRef.value = 1
    collRef.value = 2
    collRef.value = 3
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('停止时应调用清理函数', async () => {
    const cleanup = vi.fn()
    const callback = vi.fn().mockReturnValue(cleanup)
    const stop = effect(callback)
    stop()
    expect(cleanup).toHaveBeenCalled()
  })

  it('暂停和恢复效果', async () => {
    const collRef = ref(0)
    const callback = vi.fn()
    const stop = effect(() => {
      callback(collRef.value)
    })
    stop.pause()
    collRef.value = 1
    expect(callback).toHaveBeenCalledTimes(1)
    stop.resume()
    collRef.value = 2
    await wait()
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('使用同步刷新选项运行效果', () => {
    const collRef = ref(0)
    const callback = vi.fn()
    effect(
      () => {
        callback(collRef.value)
      },
      { flush: 'sync' }
    )
    expect(callback).toHaveBeenCalledTimes(1)
    collRef.value = 1
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('使用异步刷新选项运行效果', async () => {
    const collRef = ref(0)
    const callback = vi.fn()
    effect(
      () => {
        callback(collRef.value)
      },
      { flush: 'post' }
    )
    expect(callback).toHaveBeenCalledTimes(1)
    collRef.value = 1
    collRef.value = 2
    collRef.value = 3
    collRef.value = 4
    expect(callback).toHaveBeenCalledTimes(1)
    await wait()
    expect(callback).toHaveBeenCalledTimes(2)
  })
})
