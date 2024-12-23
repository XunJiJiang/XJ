import { onBeforeMount } from '@/hooks/lifecycle/beforeMount'
import { onMounted } from '@/hooks/lifecycle/mounted'
import { hasSetupRunning } from '@/hooks/lifecycle/verifySetup'
import { isAsyncFunction, isFunction, nextTick } from '@xj-fv/shared'

// ABOUT: flush
// 对于在setup函数中运行的effect
//       post: 初次在onMounted后运行, 之后异步运行 默认
//       pre: 初次在onMounted前运行, 之后异步运行
//       sync: 同步运行
// 对于其他effect
//       post\pre: 异步运行 默认
//       sync: 同步运行

type EffectCleanupCallback = () => void

// TODO: 如果effect要支持异步函数, 则 onCleanup 需要限制在await前调用
// 如果传入异步函数，则不会将effect的返回值作为cleanup函数
type OnCleanup = (cleanupCallback: EffectCleanupCallback) => void

export type EffectCallback<T = void> = (
  onCleanup: OnCleanup
) => T extends true
  ? Promise<unknown>
  : T extends false
    ? EffectCleanupCallback
    : Promise<unknown> | EffectCleanupCallback | void

export type StopFn = (opt?: { cleanup?: boolean }) => void

export const SYMBOL_PRIVATE = Symbol('private')

export interface EffectHandle {
  (opt?: { cleanup?: boolean }): void
  stop: (opt?: { cleanup?: boolean }) => void
  pause: () => void
  resume: () => void
}

export interface EffectHandleHasRun {
  (opt?: { cleanup?: boolean }): void
  stop: (opt?: { cleanup?: boolean }) => void
  pause: () => void
  resume: () => void
  __run__: (cb: () => void, privateSymbol: typeof SYMBOL_PRIVATE) => void
}

type EffectOptions = {
  flush?: 'pre' | 'sync' | 'post' // 默认：'post'
  promSync?: boolean // 默认：false 是否启用同步模式 该模式下, 同步修改的依赖的回调会在下一个微任务内同步执行
}

let currentEffectCallback: EffectCallback | null = null

export const getCurrentEffectCallback = () => currentEffectCallback

/** 运行中的currentEffectCallback列表，不包括最新的 */
const currentEffectCallbacks: EffectCallback[] = []

/**
 * 保存effect和对应的Set<EffectCallback>
 * 一个effect对应多个Set<EffectCallback>
 */
export const effectDepsMap = new Map<EffectCallback, Set<Set<EffectCallback>>>()

export const effectReturnMap = new WeakMap<EffectCallback, EffectHandleHasRun>()

/**
 * 创建副作用函数
 * @param callback 副作用函数
 * @returns 停止运行副作用函数
 * @example
 * ```ts
 * const stop = effect(() => {
 *   console.log('effect')
 *   return () => {
 *     console.log('cleanup')
 *   }
 * })
 * // 停止
 * stop()
 *
 * const { pause, resume, stop } = effect(() => {
 *   console.log('effect')
 *   return () => {
 *     console.log('cleanup')
 *   }
 * })
 * // 暂停
 * pause()
 * // 恢复
 * resume()
 * // 停止
 * stop()
 */
export const effect = (
  callback: EffectCallback,
  opt?: EffectOptions
): EffectHandle => {
  return _effect([callback], opt)
}

/**
 * @param callback [进行依赖收集的函数, 不进行依赖收集的函数]
 * @param opt
 * @returns
 */
export const _effect = (
  [callback, callbackNoCollect]: [EffectCallback, EffectCallback?],
  opt?: EffectOptions
): EffectHandle => {
  const inSetup = hasSetupRunning()
  const flush = opt?.flush ?? 'post'
  opt = {
    flush,
    promSync: opt?.promSync ?? false
  }

  if (inSetup && flush !== 'sync') {
    let stopFn: StopFn | null = null
    const effectCallbackReturn: EffectHandle = (opt) =>
      effectCallbackReturn.stop(opt)
    effectCallbackReturn.stop = (opt) => {
      if (stopFn) return stopFn(opt)
      console.warn(
        `自定义组件内effect的stop方法只能在onMounted生命周期运行后调用`
      )
    }
    effectCallbackReturn.pause = () => {
      console.warn(
        `自定义组件内effect的pause方法只能在onMounted生命周期运行后调用`
      )
    }
    effectCallbackReturn.resume = () => {
      console.warn(
        `自定义组件内effect的resume方法只能在onMounted生命周期运行后调用`
      )
    }
    if (flush === 'post') {
      onMounted(() => {
        const _ret = effectBuild(
          [
            async (onCleanup) => {
              const _ret = await callback(onCleanup)
              return _ret
            },
            callbackNoCollect
          ],
          opt
        )
        stopFn = _ret
        effectCallbackReturn.stop = _ret.stop
        effectCallbackReturn.pause = _ret.pause
        effectCallbackReturn.resume = _ret.resume
        return _ret
      })
    } else if (flush === 'pre') {
      let _stopFn: EffectCleanupCallback
      onBeforeMount(() => {
        const _ret = effectBuild(
          [
            async (onCleanup) => {
              const _ret = await callback(onCleanup)
              return _ret
            },
            callbackNoCollect
          ],
          opt
        )
        _stopFn = _ret
        stopFn = _ret
        effectCallbackReturn.stop = _ret.stop
        effectCallbackReturn.pause = _ret.pause
        effectCallbackReturn.resume = _ret.resume
      })
      onMounted(() => {
        return _stopFn
      })
    }

    return effectCallbackReturn
  } else {
    return effectBuild([callback, callbackNoCollect], opt)
  }
}

enum EffectStatus {
  RUNNING,
  PAUSE,
  STOP
}

const effectBuild = (
  [callback, callbackNoCollect]: [EffectCallback, EffectCallback?],
  opt: EffectOptions
): EffectHandleHasRun => {
  const cbIsAsync = isAsyncFunction<EffectCallback<true>>(callback)
  const cbNoCollIsAsync =
    callbackNoCollect && isAsyncFunction(callbackNoCollect)

  effectDepsMap.set(callback, new Set())
  let state = EffectStatus.RUNNING
  if (currentEffectCallback) currentEffectCallbacks.push(currentEffectCallback)
  currentEffectCallback = callback
  let cleanupSet: Set<EffectCleanupCallback> | null =
    new Set<EffectCleanupCallback>()
  const onCleanup: OnCleanup = (cleanupCallback) => {
    if (state === EffectStatus.STOP) return
    cleanupSet!.add(cleanupCallback)
  }
  let cleanupCallback = callback(onCleanup) ?? null
  if (isFunction(cleanupCallback) && !cbIsAsync) {
    onCleanup(cleanupCallback)
    cleanupCallback = null
  }
  currentEffectCallback = currentEffectCallbacks.pop() ?? null

  if (callbackNoCollect) {
    const cleanupCallback = callbackNoCollect(onCleanup)
    if (isFunction(cleanupCallback) && !cbNoCollIsAsync) {
      onCleanup(cleanupCallback)
    }
  }

  const cleanup = () => {
    if (state === EffectStatus.STOP) return
    cleanupSet!.forEach((cleanupCallback, _, set) => {
      cleanupCallback()
      set.delete(cleanupCallback)
    })
  }

  const effectCallbackReturn: EffectHandleHasRun = (opt) =>
    effectCallbackReturn.stop(opt)
  effectCallbackReturn.stop = (opt) => {
    if (state === EffectStatus.STOP) return
    opt = { cleanup: true, ...(opt ?? {}) }
    if (opt?.cleanup) cleanup()
    state = EffectStatus.STOP
    cleanupSet = null
    // 获取影响当前effect的依赖
    const effectDeps = effectDepsMap.get(callback)
    // 删除effect对应的依赖中的effect
    effectDeps?.forEach((dep) => {
      dep.delete(callback)
    })
    effectDepsMap.delete(callback)
    callback = () => {}
    if (callbackNoCollect) {
      callbackNoCollect = () => {}
    }
  }
  effectCallbackReturn.__run__ = (cb) => {
    if (state === EffectStatus.STOP || state === EffectStatus.PAUSE) {
      cb()
      return
    }
    cleanup()

    cb()

    if (opt.flush === 'sync') {
      const cleanupCallback = callback(onCleanup)
      if (isFunction(cleanupCallback) && !cbIsAsync) {
        onCleanup(cleanupCallback)
      }
      if (callbackNoCollect) {
        const cleanupCallback = callbackNoCollect(onCleanup)
        if (isFunction(cleanupCallback) && !cbNoCollIsAsync) {
          onCleanup(cleanupCallback)
        }
      }
    } else {
      nextTick(
        () => {
          if (state === EffectStatus.STOP) return
          const cleanupCallback = callback(onCleanup)
          if (isFunction(cleanupCallback) && !cbIsAsync) {
            onCleanup(cleanupCallback)
          }
          if (callbackNoCollect) {
            const cleanupCallback = callbackNoCollect(onCleanup)
            if (isFunction(cleanupCallback) && !cbNoCollIsAsync) {
              onCleanup(cleanupCallback)
            }
          }
        },
        callback,
        {
          promSync: opt.promSync
        }
      )
    }
  }
  effectCallbackReturn.pause = () => {
    if (state === EffectStatus.STOP) return
    state = EffectStatus.PAUSE
  }
  effectCallbackReturn.resume = () => {
    if (state === EffectStatus.STOP) return
    state = EffectStatus.RUNNING
  }
  effectReturnMap.set(callback, effectCallbackReturn)
  return effectCallbackReturn
}
