import {
  type ReservedPropKey,
  isPlainObject,
  isArray,
  isText,
  isString,
  isNumber,
  isBoolean,
  isElement,
  isFunction,
} from '@xj/shared'

export type XJData = Record<string, unknown>

export type XJEventKey = `on${string}` | `$${string}`

export type XJEvent = Record<XJEventKey, (...args: unknown[]) => void>

export type XJPropKey = string extends XJEventKey | ReservedPropKey
  ? never
  : string

export type XJProp = Record<XJPropKey, unknown>

export type XJChildNode =
  | string
  | number
  | boolean
  | Text
  | Element
  | null
  | undefined

export type XJChildrenNode = XJChildNode | XJChildNode[]

export type XJSlots = Record<string, (...args: unknown[]) => XJChildrenNode>

export type ChildrenElement = Element | Text | (Element | Text)[]

export type XJComponent<T extends 'children' | 'slots' | null = null> =
  T extends 'children'
    ? (
        props: XJData,
        event: XJEvent,
        children?: () => ChildrenElement,
      ) => Element
    : T extends 'slots'
      ? (props: XJData, event: XJEvent, slots?: XJSlots) => Element
      : (
          props: XJData,
          event: XJEvent,
          children?: (() => ChildrenElement) | XJSlots,
        ) => Element

export const isXJSlots = (
  val: XJSlots | ((...args: unknown[]) => ChildrenElement) | XJChildrenNode,
): val is XJSlots => {
  return (
    isPlainObject(val) &&
    !isText(val) &&
    !isElement(val) &&
    !isFunction(val) &&
    Object.values(val).every(isFunction)
  )
}

export const isXJChildrenNodeArr = (val: unknown): val is XJChildNode[] =>
  isArray(val) && val.every(val => !isArray(val) && isXJChildrenNode(val))

export const isXJChildrenNode = (val: unknown): val is XJChildrenNode => {
  return (
    isString(val) ||
    isNumber(val) ||
    isBoolean(val) ||
    isText(val) ||
    isElement(val) ||
    isXJChildrenNodeArr(val) ||
    val === null ||
    val === undefined
  )
}
