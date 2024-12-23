/* eslint-disable @typescript-eslint/no-explicit-any */
import { isReactive } from './Dependency'
import { _effect } from './effect'
import { Reactive } from './reactive'
import { isRef, Ref } from './ref'
import { isArray, isNewCall } from '@xj-fv/shared'

// TODO: 大量使用 as

// ABOUT: flush
// 对于在setup函数中运行的effect
//       post: 初次在onMounted后运行, 之后异步运行 默认
//       pre: 初次在onMounted前运行, 之后异步运行
//       sync: 同步运行
// 对于其他effect
//       post\pre: 异步运行 默认
//       sync: 同步运行

export interface Watch {
  <T>(
    source: WatchSource<T>,
    callback: WatchCallback<T, T>,
    options?: Partial<WatchOptions>
  ): WatchHandle
  <T extends Readonly<MultiWatchSources>>(
    sources: readonly [...T] | T,
    callback: WatchCallback<WatchSourceRefs<T>, WatchSourceRefs<T>>,
    options?: Partial<WatchOptions>
  ): WatchHandle
}

type WatchSourceRef<T> =
  T extends WatchSource<infer V> ? V : T extends object ? T : T

type WatchSourceRefs<T> = {
  [K in keyof T]: WatchSourceRef<T[K]>
}

type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onCleanup: (cleanupFn: () => void) => void
) => any

type MultiWatchSources = WatchSource<any>[]

// 初次运行时, oldValue 与 value 相同
type WatchSource<T> =
  | Ref<T, any> // ref 自动解ref 当ref为基础数据类型时, 新旧值才会不同
  | (() => T extends object ? Reactive<T> : T) // getter 返回值必须依赖于响应式对象 当返回值为基础数据类型时, 新旧值才会不同
  | (T extends object ? Reactive<T> : never)

interface WatchOptions {
  deep: boolean | number // 默认：false
  flush: 'pre' | 'post' | 'sync' // 默认：'post'
  promSync: boolean // 默认：false 是否启用同步模式 该模式下, 同步修改的依赖的回调会在下一个微任务内同步执行
}

interface WatchHandle {
  (opt?: { cleanup?: boolean }): void
  pause: (opt?: { cleanup?: boolean }) => void
  resume: () => void
  stop: () => void
}

/** 深度遍历响应式值使得effect可以获取深度依赖 */
const deepTraverse = <T>(value: T, deep: number | true): T => {
  const map = new WeakMap()

  const _deepTraverse = <T>(value: T, deep: number | true) => {
    if (value && value instanceof Node) {
      return value
    }

    if (deep === 0) return value

    if (typeof value !== 'object' || value === null) return value
    if (map.has(value)) return map.get(value)

    const result: T = (isArray(value) ? [] : {}) as T

    map.set(value, result)

    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = _deepTraverse(value[key], deep === true ? true : deep - 1)
      }
    }

    return result
  }

  return _deepTraverse(value, deep)
}

type WatchAloneCallback<T> = T extends () => infer R
  ? WatchCallback<WatchSourceRef<R>, WatchSourceRef<R>>
  : WatchCallback<WatchSourceRef<T>, WatchSourceRef<T>>

// TODO: watchForAlone any太多了
const watchForAlone = <T extends Ref<any> | (() => any) | Reactive<any>>(
  source: T,
  callback: WatchAloneCallback<T>,
  options: WatchOptions
): WatchHandle => {
  const value: {
    value: Parameters<WatchAloneCallback<T>>[0]
    oldValue: Parameters<WatchAloneCallback<T>>[1]
  } = {
    value: null,
    oldValue: null
  }

  let isFirst = true

  options.deep = isReactive(source)
    ? options.deep === false
      ? 1
      : options.deep
    : options.deep

  return _effect(
    [
      () => {
        if (isRef<T>(source)) {
          value.value = source.value
        } else if (typeof source === 'function') {
          value.value = source()
        } else {
          value.value = source
        }

        if (
          typeof value.value === 'object' &&
          value.value !== null &&
          options.deep !== false
        ) {
          const _val = deepTraverse(value.value, options.deep)
          value.value = _val
        }

        if (isFirst) {
          value.oldValue = value.value
          isFirst = false
        }
      },
      (onCleanup) => {
        callback(value.value, value.oldValue, onCleanup)
        value.oldValue = value.value
      }
    ],
    {
      flush: options.flush,
      promSync: options.promSync
    }
  )
}

const watchForArray = <T extends Readonly<MultiWatchSources>>(
  sources: readonly [...T],
  callback: WatchCallback<WatchSourceRefs<T>, WatchSourceRefs<T>>,
  options: WatchOptions
): WatchHandle => {
  const value: {
    value: [...WatchSourceRefs<T>]
    oldValue: [...WatchSourceRefs<T>]
  } = {
    value: [] as [...WatchSourceRefs<T>],
    oldValue: [] as [...WatchSourceRefs<T>]
  }

  let isFirst = true

  options.deep = sources.some((source) => isReactive(source))
    ? options.deep === false
      ? 1
      : options.deep
    : options.deep

  return _effect(
    [
      () => {
        sources.forEach((source, index) => {
          if (isRef(source)) {
            value.value[index] = source.value as WatchSourceRef<T[typeof index]>
          } else if (typeof source === 'function') {
            value.value[index] = source() as WatchSourceRef<T[typeof index]>
          } else {
            value.value[index] = source as WatchSourceRef<T[typeof index]>
          }

          if (
            typeof value.value[index] === 'object' &&
            value.value[index] !== null &&
            options.deep !== false
          ) {
            const _val = deepTraverse(value.value[index], options.deep)
            value.value[index] = _val
          }
        })

        if (isFirst) {
          value.oldValue = value.value
          isFirst = false
        }
      },
      (onCleanup) => {
        callback(value.value, value.oldValue, onCleanup)
        value.oldValue = [] as [...WatchSourceRefs<T>]
        for (const item of value.value) {
          value.oldValue.push(item)
        }
      }
    ],
    {
      flush: options.flush,
      promSync: options.promSync
    }
  )
}

type WatchAloneSource<T> =
  T extends Readonly<MultiWatchSources>
    ? T extends Array<any>
      ? T extends Reactive<any>
        ? T
        : never
      : never
    : T

export function watch<T extends Reactive<any>>(
  source: T,
  callback: WatchCallback<WatchSourceRef<T>, WatchSourceRef<T>>,
  options?: Partial<WatchOptions>
): WatchHandle
export function watch<T extends Ref<any>>(
  source: T,
  callback: WatchCallback<WatchSourceRef<T>, WatchSourceRef<T>>,
  options?: Partial<WatchOptions>
): WatchHandle
export function watch<T extends () => any>(
  source: T,
  callback: WatchCallback<
    WatchSourceRef<ReturnType<T>>,
    WatchSourceRef<ReturnType<T>>
  >,
  options?: Partial<WatchOptions>
): WatchHandle
export function watch<T extends Readonly<MultiWatchSources>>(
  sources: readonly [...T],
  callback: WatchCallback<WatchSourceRefs<T>, WatchSourceRefs<T>>,
  options?: Partial<WatchOptions>
): WatchHandle
export function watch<T>(
  source: T extends Readonly<MultiWatchSources>
    ? readonly [...T]
    : // TODO: 此处source应该是T, 但会导致数组类型的source不能获取指定下标的类型
      WatchAloneSource<T>,
  callback:
    | WatchAloneCallback<T>
    | WatchCallback<WatchSourceRefs<T>, WatchSourceRefs<T>>,
  options?: Partial<WatchOptions>
): WatchHandle {
  if (isNewCall(new.target)) throw new Error('watch: must be called directly')

  const opt: WatchOptions = {
    deep: false,
    flush: 'post',
    promSync: false,
    ...(options ?? {})
  }

  if (!isReactive(source) && isArray(source)) {
    return watchForArray(
      source as readonly WatchSource<unknown>[],
      callback as WatchCallback<
        WatchSourceRefs<unknown>,
        WatchSourceRefs<unknown>
      >,
      opt
    )
  } else {
    return watchForAlone(
      source as WatchSource<unknown>,
      callback as WatchAloneCallback<unknown>,
      opt
    )
  }
}
