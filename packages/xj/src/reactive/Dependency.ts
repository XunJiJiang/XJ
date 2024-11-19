/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * class Dependency
 * 创建依赖
 * function effect
 * 创建副作用函数
 * function isRef
 * 判断是否为引用响应式
 * function isReactive
 * 判断是否为响应式对象
 */
import {
  effectDepsMap,
  effectReturnMap,
  getCurrentEffectCallback,
  SYMBOL_PRIVATE,
  type EffectCallback
} from './effect'
import { isArray, isObject } from '@xj-fv/shared'

/** 无key的依赖key */
const SYMBOL_EFFECT = Symbol('effect')
/** 被代理标志 */
export const SYMBOL_DEPENDENCY = Symbol('dependency')

/** 函数上非纯函数的属性 */
// const NOT_PURE_ARR_FUNC_KEY = [
//   'push',
//   'pop',
//   'shift',
//   'unshift',
//   'splice',
//   'sort',
//   'reverse',
//   'copyWithin',
//   'fill'
// ]

/** 函数上修改this指向的属性 */
// const BIND_THIS_FUNC_KEY = ['bind ', 'call', 'apply']

const hasSYMBOL_DEPENDENCY = (
  val: object
): val is { [key in typeof SYMBOL_DEPENDENCY]: Dependency<object> } => {
  return (
    (val as { [key in typeof SYMBOL_DEPENDENCY]: Dependency<object> })[
      SYMBOL_DEPENDENCY
    ] !== undefined
  )
}

/**
 * 判断是否为响应式对象
 * @param val
 * @returns
 * @example
 * ```ts
 * const obj = reactive({})
 * console.log(isReactive(obj)) // true
 * ```
 */
export const isReactive = <T extends object = Record<string | symbol, any>>(
  val: unknown
): val is Dependency<T> => {
  return (
    isObject(val) &&
    hasSYMBOL_DEPENDENCY(val) &&
    val[SYMBOL_DEPENDENCY] instanceof Dependency
  )
}

/**
 * class Dependency
 * 创建依赖
 * @example
 * ```ts
 * const dep = new Dependency({})
 * console.log(dep.value) // {}
 * ```
 */
class Dependency<T extends object> {
  /**
   * 依赖集合
   * key: 依赖对象上的属性
   * value: 属性对应的effect集合
   */
  private _deps = new Map<string | symbol, Set<EffectCallback>>()
  /** 代理对象 */
  private _value: object
  /** 代理处理器 */
  private _proxy: ProxyHandler<T>
  /**
   * 代理对象的属性是否被代理
   * 防止重复代理
   * 对于对象类型的属性, 需要深度代理
   */
  private _isProxy: Array<string | symbol> = []

  constructor(value: T) {
    this._value = value
    this._proxy = new Proxy(this._value, {
      get: (target, key, receiver) => {
        if (key === SYMBOL_DEPENDENCY) return this
        // if (!Reflect.has(target, key)) {
        // }

        // const distribute = this.distribute.bind(this)
        const _value = Reflect.get(target, key, receiver)
        let _ret = _value
        if (
          isObject(_value) &&
          !this._isProxy.includes(key) &&
          !(_value instanceof Node) &&
          typeof _value !== 'function'
        ) {
          const newDep = new Dependency(_value)
          Reflect.set(target, key, newDep.value, receiver)
          _ret = newDep.value
          this._isProxy.push(key)
        }

        this.collect(key)

        return _ret
      },
      set: (target, key, value, receiver) => {
        let _ret = false
        const cb = () => {
          _ret = Reflect.set(target, key, value, receiver)
        }

        if (isArray(target)) this.distribute(cb)
        else this.distribute(cb, key)

        return _ret
      },
      //TODO: 触发set和deleteProperty前都会触发defineProperty
      // 导致两次触发依赖发布
      // 先停止defineProperty的代理
      // defineProperty: (target, key, descriptor) => {
      //   let _ret = false
      //   const cb = () => {
      //     _ret = Reflect.defineProperty(target, key, descriptor)
      //   }
      //   if (isArray(target)) this.distribute(cb)
      //   else this.distribute(cb, key)
      //   return _ret
      // },
      deleteProperty: (target, key) => {
        let _ret = false
        const cb = () => {
          _ret = Reflect.deleteProperty(target, key)
        }

        if (isArray(target)) this.distribute(cb)
        else this.distribute(cb, key)

        if (_ret) this.remove(key)

        return _ret
      }
    })
  }

  private collect(key: string | symbol = SYMBOL_EFFECT) {
    const currentEffectCallback = getCurrentEffectCallback()

    if (currentEffectCallback) {
      const _dep =
        this._deps.get(key) ?? this._deps.set(key, new Set()).get(key)!
      _dep.add(currentEffectCallback)

      const effectDeps = effectDepsMap.get(currentEffectCallback)!
      effectDeps.add(_dep)
    }
  }

  private distribute(update: () => void, key: string | symbol = SYMBOL_EFFECT) {
    let updateRun = false
    const run = () => {
      if (updateRun) return
      updateRun = true
      update()
    }

    if (key === SYMBOL_EFFECT) {
      this._deps.forEach((dep) => {
        dep.forEach((effectCallback) => {
          const effectReturn = effectReturnMap.get(effectCallback)
          if (effectReturn) effectReturn.__run__(run, SYMBOL_PRIVATE)
          else run()
        })
      })
    } else {
      const _dep =
        this._deps.get(key) ?? this._deps.set(key, new Set()).get(key)!
      _dep.forEach((effectCallback) => {
        const effectReturn = effectReturnMap.get(effectCallback)
        if (effectReturn) effectReturn.__run__(run, SYMBOL_PRIVATE)
        else run()
      })
    }

    if (!updateRun) run()
  }

  private remove(key: string | symbol) {
    this._deps.delete(key)
  }

  get value() {
    return this._proxy
  }
}

export default Dependency
