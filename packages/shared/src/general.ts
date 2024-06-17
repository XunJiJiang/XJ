import { makeMap } from './makeMap'

const isOnReg = /^(on|\$)[a-zA-Z]\w*/

export const isOn = (key: string) => isOnReg.test(key)

export const sliceOn = (key: string) =>
  key.startsWith('$') ? key.slice(1) : key.slice(2)

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val: object,
  key: string | symbol,
): key is keyof typeof val => hasOwnProperty.call(val, key)

export const extend = Object.assign

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string =>
  objectToString.call(value)

export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}

export const toLowerCase = (str: string): string => str.toLowerCase()

export const isArray = Array.isArray
export const isMap = (val: unknown): val is Map<unknown, unknown> =>
  toTypeString(val) === '[object Map]'
export const isSet = (val: unknown): val is Set<unknown> =>
  toTypeString(val) === '[object Set]'

export const isDate = (val: unknown): val is Date =>
  toTypeString(val) === '[object Date]'
export const isRegExp = (val: unknown): val is RegExp =>
  toTypeString(val) === '[object RegExp]'

type FunctionType = (...args: unknown[]) => unknown

export const isFunction = (val: unknown): val is FunctionType =>
  typeof val === 'function'
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isNumber = (val: unknown): val is number => typeof val === 'number'
export const isBoolean = (val: unknown): val is boolean =>
  typeof val === 'boolean'
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
export const isObject = (
  val: unknown,
): val is Record<string | number | symbol, unknown> =>
  val !== null && typeof val === 'object'

export const isText = (val: unknown): val is Text => val instanceof Text

export const isElement = (val: unknown): val is Element =>
  val instanceof Element

export const isNode = (val: unknown): val is Node => val instanceof Node

export const isHTMLElement = (val: unknown): val is HTMLElement =>
  val instanceof HTMLElement

export const isPromise = <T = unknown>(val: unknown): val is Promise<T> => {
  return (
    (isObject(val) || isFunction(val)) &&
    'then' in val &&
    isFunction(val.then) &&
    'catch' in val &&
    isFunction(val.catch)
  )
}

export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === '[object Object]'

export const isIntegerKey = (key: unknown) =>
  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key

export type ReservedPropKey = 'key' | 'ref'

export const isReservedProp = /*#__PURE__*/ makeMap<ReservedPropKey>(
  // the leading comma is intentional so empty string "" is also included
  ',key,ref',
)

export type SpecialNativePropKey = 'style' | 'class'

export const isSpecialNativeProp =
  /*#__PURE__*/ makeMap<SpecialNativePropKey>('style,class')

// compare whether a value has changed, accounting for NaN.
export const hasChanged = (value: unknown, oldValue: unknown): boolean =>
  !Object.is(value, oldValue)
