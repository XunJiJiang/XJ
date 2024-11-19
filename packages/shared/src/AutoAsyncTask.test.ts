/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { nextTick } from './AutoAsyncTask'
import { createWait } from '@test/utils/wait'

const wait30 = createWait(30)

describe('AutoAsyncTask', () => {
  it('添加并执行一个任务', async () => {
    const task = vi.fn()

    nextTick(task)

    await wait30()

    expect(task).toHaveBeenCalled()
  })

  it('如果使用相同的密钥添加，则不会执行两次相同的任务', async () => {
    const task = vi.fn()
    const key = () => {}

    nextTick(task, key)
    nextTick(task, key)

    await wait30()

    expect(task).toHaveBeenCalledTimes(1)
  })

  it('按添加的顺序执行任务', async () => {
    const task1 = vi.fn()
    const task2 = vi.fn()

    nextTick(task1)
    nextTick(task2)

    await wait30()

    expect(task1).toHaveBeenCalled()
  })

  it('使用不同的键分别处理任务', async () => {
    const task1 = vi.fn()
    const task2 = vi.fn()
    const key1 = () => {}
    const key2 = () => {}

    nextTick(task1, key1)
    nextTick(task2, key2)

    await wait30()

    expect(task1).toHaveBeenCalled()
    expect(task2).toHaveBeenCalled()
  })

  it('如果使用相同的密钥添加，则只执行最后一次添加的任务', async () => {
    const task1 = vi.fn()
    const task2 = vi.fn()
    const key = () => {}

    nextTick(task1, key)
    nextTick(task2, key)

    await wait30()

    expect(task1).not.toHaveBeenCalled()
    expect(task2).toHaveBeenCalled()
  })

  // TODO: 没找到vitest中测试函数运行顺序的方法
  it('在执行任务期间添加任务，会在当前任务队列完成后执行', async () => {
    const task1 = vi.fn()
    const task2 = vi.fn()
    const task3 = vi.fn()

    nextTick(() => {
      nextTick(task3)
      task1()
    })

    nextTick(() => {
      task2()
    })

    await wait30()
  })

  // 当多个函数且函数执行时间超过帧时间时，会分批执行
  it('当多个函数且函数执行时间较长，会分批执行', async () => {
    const task1 = vi.fn()
    const task2 = vi.fn()
    const task3 = vi.fn()

    const wait = createWait(20)

    nextTick(() => {
      const timeout = Date.now() + 10
      task1()
      while (Date.now() < timeout) {
        //
      }
    })

    nextTick(() => {
      const timeout = Date.now() + 10
      task2()
      while (Date.now() < timeout) {
        //
      }
    })

    nextTick(() => {
      task3()
    })

    await wait()

    expect(task1).toHaveBeenCalled()

    await wait()

    expect(task2).toHaveBeenCalled()

    await wait()

    expect(task3).toHaveBeenCalled()
  })
})
