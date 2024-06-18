import {
  type ReservedPropKey,
  type SpecialNativePropKey,
  // isReservedProp,
  isPlainObject,
  isFunction,
  isArray,
  isString,
  isElement,
  isHTMLElement,
  isNumber,
} from '@xj-fv/shared'

import {
  type XJComponent,
  type XJData,
  type XJEvent,
  type XJSlots,
  type XJNodeTypes,
} from './component'

import { type CollectExposeEnd, collectExpose } from './expose'

export type ReservedProps = Record<ReservedPropKey, unknown>

export const setReservedProp = (
  key: ReservedPropKey,
  value: unknown,
  el?: HTMLElement,
): void => {
  if (isHTMLElement(el)) {
    if (key === 'ref') {
      if (isFunction(value)) {
        ;(value as (el: HTMLElement) => void)(el)
      }

      // TODO: handle ref as object
      else if (isPlainObject(value) && 'current' in value) {
        ;(value as { current: HTMLElement }).current = el
      } else {
        /*#__PURE__*/ console.log(
          `runtime-core -> src -> node.ts -> _createHTMLElement -> key: ${key}`,
        )
        throw new Error(
          `ref should be a function or an object with a current property`,
        )
      }
    }

    if (key === 'key') {
      if (isString(value) || isNumber(value)) {
        el.setAttribute('__xj-key__', String(value))
      } else if (
        isArray(value) &&
        value.every(val => isString(val) || isNumber(val))
      ) {
        el.setAttribute('__xj-key__', value.join('.'))
      } else {
        /*#__PURE__*/ console.log(
          `runtime-core -> src -> node.ts -> _createHTMLElement -> key: ${key}`,
        )
        throw new Error(
          `typeof key should be string, number, or an array of them`,
        )
      }
    }
  }
}

export const captureComponentReservedProp = (
  component: XJComponent,
  props: XJData,
  event: XJEvent,
  children: XJSlots | ((...args: unknown[]) => XJNodeTypes),
  reservedProps: Partial<ReservedProps> = {},
): XJNodeTypes => {
  const reservedPropKey = Object.keys(reservedProps) as ReservedPropKey[]

  const collectExposeEnd = collectExpose()

  const el = component(props, event, children)

  const ref = reservedPropKey.includes('ref') ? reservedProps.ref : undefined

  const expose = collectExposeEnd()

  if (isFunction(ref)) {
    ref(expose)
  }

  if (isPlainObject(ref) && 'current' in ref) {
    ref.current = expose
  }

  return el
}

export const setSpecialNativeProp = (
  key: SpecialNativePropKey,
  value: unknown,
  el: HTMLElement,
): void => {
  if (key === 'class') {
    if (!isString(value) && !(isArray(value) && value.every(isString))) {
      /*#__PURE__*/ console.log(
        `runtime-core -> src -> node.ts -> _createHTMLElement -> key: ${key}`,
      )
      throw new Error(`class should be a string or an array of strings`)
    }
    setClassProp(el, value)
  } else if (key === 'style') {
    setStyleProp(el, value as CSSStyleDeclaration)
  } else {
    el.setAttribute(key, String(value))
  }
}

const setClassProp = (el: Element, value: string | string[]) => {
  if (!isElement(el)) {
    /*#__PURE__*/ console.log(
      `runtime-core -> src -> node.ts -> setClassProp -> el: ${el}`,
    )
    throw new Error(`el should be an HTMLElement`)
  }
  if (isString(value)) {
    el.classList.add(value)
  } else {
    el.classList.add(...value)
  }
}

const setStyleProp = (
  el: HTMLElement,
  value?: CSSStyleDeclaration | string,
) => {
  if (!isHTMLElement(el)) {
    /*#__PURE__*/ console.log(
      `runtime-core -> src -> node.ts -> setStyleProp -> el: ${el}`,
    )
    throw new Error(`el should be an HTMLElement`)
  }
  if (!value) {
    el.setAttribute('style', '')
    return
  }
  if (isString(value)) {
    el.setAttribute('style', value)
  } else {
    for (const key in value) {
      el.style[key] = value[key]
    }
  }
}
