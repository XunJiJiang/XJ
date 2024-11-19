// /* eslint-disable @typescript-eslint/no-explicit-any */

export const isFunction = <T = (...args: unknown[]) => unknown>(
  fn: unknown
): fn is T => typeof fn === 'function'

export const isArray = <T extends unknown[] = unknown[]>(
  arr: unknown
): arr is T => Array.isArray(arr)

export const isObject = (val: unknown): val is object => {
  return val !== null && typeof val === 'object'
}

export const hasOwn = <T extends object>(
  val: object,
  key: string | symbol
): val is T => Object.prototype.hasOwnProperty.call(val, key)

export const isHTMLElement = (el: unknown): el is HTMLElement =>
  el instanceof HTMLElement

export const isPromise = <T = unknown>(val: unknown): val is Promise<T> =>
  (isObject(val) || isFunction(val)) && isFunction((val as Promise<T>).then)

export const isAsyncFunction = <T = (...args: unknown[]) => Promise<unknown>>(
  fn: unknown
): fn is T =>
  isFunction(fn) &&
  Symbol.toStringTag in fn &&
  fn[Symbol.toStringTag] === 'AsyncFunction'

export const notNull = <T>(val: T | void | null): val is NonNullable<T> =>
  val != null

/**
 * 当前函数是否是通过new关键字调用
 * @param target new.target
 * @returns
 */
export const isNewCall = /*@__PURE__*/ (target: unknown): boolean => {
  return target !== undefined
}
