/* eslint-disable @typescript-eslint/no-explicit-any */
import { Reactive, reactive } from './reactive'
import { isObject } from '@xj-fv/shared'

export interface CreateRef {
  <T>(value: null): Ref<T | null>
  <T>(value: T): Ref<T>
}

// 外部类型声明，将一个数据的类型转为ref类型
export type RefType<T> = { value: T }

const SYMBOL_REF = Symbol('ref')

/**
 * 判断是否为引用响应式
 * @param val
 * @returns
 * @example
 * ```ts
 * const ref = ref(0)
 * console.log(isRef(ref)) // true
 * ```
 */
export const isRef = <T = unknown>(val: unknown): val is Ref<T> => {
  return (
    isObject(val) &&
    SYMBOL_REF in (val as RefImpl<T>) &&
    (val as RefImpl<T>)[SYMBOL_REF] === true
  )
}

class RefImpl<T = any, S = T> {
  private [SYMBOL_REF] = true

  #value: Reactive<{
    value: T
  }>

  constructor(value: T) {
    this.#value = reactive({ value })
  }

  get value(): Reactive<{
    value: T
  }>['value'] {
    return this.#value.value
  }

  set value(value: S) {
    this.#value.value = value as Reactive<{
      value: T
    }>['value']
  }
}

// export interface Ref<T = any, S = T> {
//   get value(): T
//   set value(_: S)
// }

export type Ref<T = any, S = T> = RefImpl<T, S>

/**
 * 创建Ref
 * @param value
 * @returns
 * @example
 * ```ts
 * const ref = ref(0)
 * console.log(ref.value) // 0
 * ref.value = 1
 * console.log(ref.value) // 1
 * ```
 */
export const ref: CreateRef = <T>(value: T | null) => {
  return new RefImpl(value)
}
