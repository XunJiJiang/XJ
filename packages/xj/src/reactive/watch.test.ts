/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest'
import { ref } from './ref'
import { reactive } from './reactive'
import { watch } from './watch'
import { wait } from '@test/utils/wait'
import { deepClone } from '@test/utils/deepClone'

describe('watch', () => {
  it('浅层观察reactive', async () => {
    const source = reactive({ count: 0, nested: { value: 0 } })
    const source2 = ref({
      value: 'string'
    })
    const source3 = () => source2.value
    const callback = vi.fn()
    watch([source, source3], ([v1, v2], oldV) => {
      callback(deepClone([[v1, v2], oldV]))
    })

    expect(callback).toHaveBeenNthCalledWith(1, [
      [
        {
          count: 0,
          nested: {
            value: 0
          }
        },
        {
          value: 'string'
        }
      ],
      [
        {
          count: 0,
          nested: {
            value: 0
          }
        },
        {
          value: 'string'
        }
      ]
    ])

    source.count = 1
    source.nested.value = 1

    await wait()

    expect(callback).toHaveBeenNthCalledWith(2, [
      [
        {
          count: 1,
          nested: {
            value: 1
          }
        },
        {
          value: 'string'
        }
      ],
      [
        {
          count: 0,
          nested: {
            value: 1
          }
        },
        {
          value: 'string'
        }
      ]
    ])
  })

  it('观察引用并使用新值和旧值调用回调', () => {
    const source = ref(0)
    const callback = vi.fn()

    watch(
      source,
      (v, ov, cb) => {
        callback(v, ov, cb)
      },
      {
        flush: 'sync'
      }
    )

    source.value = 1

    expect(callback).toHaveBeenCalledWith(1, 0, expect.any(Function))
  })

  it('观察 getter 函数并使用新值和旧值调用回调', async () => {
    const callback = vi.fn()
    const state = reactive({ count: 0 })
    watch(
      () => state.count,
      (v, ov, cb) => {
        callback(v, ov, cb)
      }
    )

    state.count = 1

    await wait()

    expect(callback).toHaveBeenCalledWith(1, 0, expect.any(Function))
  })

  it('观察源数组并使用新值和旧值调用回调', async () => {
    const source1 = ref(0)
    const source2 = ref(1)
    const callback = vi.fn()

    watch([source1, source2], (v, ov, cb) => {
      callback(v, ov, cb)
    })

    source1.value = 2
    source2.value = 3

    await wait()

    expect(callback).toHaveBeenCalledWith([2, 3], [0, 1], expect.any(Function))
  })

  it('深度观察', async () => {
    const source = ref({ nested: { value: 0 } })
    const callback = vi.fn()

    watch(
      source,
      (v, ov, cb) => {
        callback(v, ov, cb)
      },
      { deep: true }
    )

    source.value.nested.value = 1

    await wait()

    expect(callback).toHaveBeenCalledWith(
      { nested: { value: 1 } },
      { nested: { value: 0 } },
      expect.any(Function)
    )
  })

  it('深度观察对象', async () => {
    const source = ref({
      nested: {
        nested: {
          nested: {
            nested: {
              nested: {
                value: 0
              }
            }
          }
        }
      }
    })
    const callback = vi.fn()

    watch(
      source,
      (v, ov, cb) => {
        callback(v, ov, cb)
      },
      { deep: true }
    )

    source.value.nested.nested.nested.nested.nested.value = 1

    await wait(50)

    expect(callback).toHaveBeenCalledWith(
      {
        nested: {
          nested: {
            nested: {
              nested: {
                nested: {
                  value: 1
                }
              }
            }
          }
        }
      },
      {
        nested: {
          nested: {
            nested: {
              nested: {
                nested: {
                  value: 0
                }
              }
            }
          }
        }
      },
      expect.any(Function)
    )
  })

  it('深度观察数组', async () => {
    const source = reactive([{ value: 0 }])
    const callback = vi.fn()

    watch(
      source,
      (v, ov, cb) => {
        callback(v, ov, cb)
      },
      { deep: true }
    )

    source[0].value = 1

    await wait()

    expect(callback).toHaveBeenCalledWith(
      [{ value: 1 }],
      [{ value: 0 }],
      expect.any(Function)
    )
  })

  it('观察多个数组', async () => {
    const source1 = ref([0])
    const source2 = ref(['string-1'])
    const callback = vi.fn()

    watch([source1, source2], ([v1, v2]) => {
      callback(deepClone([v1, v2]))
    })

    source1.value = [2]
    source2.value = ['string-2']

    await wait()

    expect(callback).toHaveBeenCalledWith([[2], ['string-2']])
  })

  it('单层深度观察', async () => {
    const source = reactive({
      value: 0,
      nested: {
        value: 0
      }
    })
    const callback = vi.fn()

    watch(
      source,
      (v, oldV, onCleanup) => {
        callback(...deepClone([v, oldV, onCleanup]))
      },
      { deep: 1 }
    )

    source.nested.value = 1
    source.value = 1

    await wait()

    expect(callback).toHaveBeenCalledWith(
      {
        value: 1,
        nested: {
          value: 1
        }
      },
      {
        value: 0,
        nested: {
          value: 1
        }
      },
      expect.any(Function)
    )
  })

  it('2层深度下同时观察三种类型的源', async () => {
    const source1 = ref({ value: 0 })
    const source2 = reactive<{
      value:
        | {
            nested: {
              value: number
            }
          }
        | number
    }>({ value: 0 })
    const source3 = reactive({
      value: 0
    })
    const source4 = () => source3
    const callback = vi.fn()

    watch(
      [source1, source2, source4],
      ([v1, v2, v3], [ov1, ov2, ov3], cb) => {
        callback(...deepClone([[v1, v2, v3], [ov1, ov2, ov3], cb]))
      },
      { deep: 2 }
    )

    source1.value.value = 1
    source2.value = {
      nested: {
        value: 1
      }
    }
    source3.value = 1

    await wait()

    expect(callback).toHaveBeenNthCalledWith(
      2,
      [
        {
          value: 1
        },
        {
          value: {
            nested: {
              value: 1
            }
          }
        },
        {
          value: 1
        }
      ],
      [
        {
          value: 0
        },
        {
          value: 0
        },
        {
          value: 0
        }
      ],
      expect.any(Function)
    )

    // TODO: 上面的针对source2的变动修改了reactive内的对象
    // 在watch依赖收集完成后, 在原有依赖上修改或新增值为对象的属性
    // 这个新的对象目前不会被依赖
    source2.value.nested.value = 2

    await wait()

    expect(callback).toHaveBeenCalledTimes(2)
  })
})
