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

export type ChildNode =
  | string
  | number
  | boolean
  | Text
  | Element
  | null
  | undefined

export type ChildrenNode = ChildNode | ChildNode[]

export type XJSlots = Record<string, (...args: unknown[]) => ChildrenNode>

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
  val: XJSlots | ((...args: unknown[]) => ChildrenElement) | ChildrenNode,
): val is XJSlots => {
  return (
    isPlainObject(val) &&
    !isText(val) &&
    !isElement(val) &&
    !isFunction(val) &&
    Object.values(val).every(isFunction)
  )
}

export const isChildrenNodeArr = (val: unknown): val is ChildNode[] =>
  isArray(val) && val.every(val => !isArray(val) && isChildrenNode(val))

export const isChildrenNode = (val: unknown): val is ChildrenNode => {
  return (
    isString(val) ||
    isNumber(val) ||
    isBoolean(val) ||
    isText(val) ||
    isElement(val) ||
    isChildrenNodeArr(val) ||
    val === null ||
    val === undefined
  )
}
