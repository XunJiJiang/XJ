import {
  type ReservedProp,
  isHTMLTag,
  isVoidTag,
  isSVGTag,
  isMATS,
  isFunction,
  isString,
  isNumber,
  isBoolean,
  isText,
  isElement,
  isOn,
  sliceOn,
  isEventTag,
  isArray,
  isReservedProp,
  isPlainObject,
  // isKnownHtmlAttr,
  // isBooleanAttr,
} from '@xj/shared'

type XJData = Record<string, unknown>

type XJEventKey = `on${string}` | `$${string}`

type XJEvent = Record<XJEventKey, (...args: unknown[]) => void>

type XJPropKey = string extends XJEventKey | ReservedProp ? never : string

type XJProp = Record<XJPropKey, unknown>

type ChildNode = string | number | boolean | Text | Element | null | undefined

type ChildrenNode = ChildNode | ChildNode[]

type XJSlots = Record<string, (...args: unknown[]) => ChildrenNode>

function setReservedProp(
  key: ReservedProp,
  value: unknown,
  el: HTMLElement,
): void {
  if (key === 'ref') {
    if (isFunction(value)) {
      ;(value as (el: HTMLElement) => void)(el)
    } else if (isPlainObject(value) && 'current' in value) {
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
}

function elementalizingChildrenNode(
  children: ChildrenNode,
): (Element | Text)[] {
  if (isString(children) || isNumber(children) || isBoolean(children)) {
    return [document.createTextNode(String(children))]
  }
  if (isText(children) || isElement(children)) {
    return [children]
  }
  if (isChildrenNodeArr(children)) {
    return children.map(child => {
      if (isString(child) || isNumber(child) || isBoolean(child)) {
        return document.createTextNode(String(child))
      }
      if (isText(child) || isElement(child)) {
        return child
      }
      /*#__PURE__*/ console.log(
        `runtime-core -> src -> node.ts -> elementalizingChildrenNode -> child: ${child}`,
      )
      throw new Error(`Invalid children: ${child}`)
    })
  }

  /*#__PURE__*/ console.log(
    `runtime-core -> src -> node.ts -> elementalizingChildrenNode -> children: ${children}`,
  )
  throw new Error(`Invalid children: ${children}`)
}

function isChildrenNodeArr(val: unknown): val is ChildNode[] {
  return isArray(val) && val.every(val => !isArray(val) && isChildrenNode(val))
}

function isChildrenNode(val: unknown): val is ChildrenNode {
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

function isXJSlots(
  val: XJSlots | (() => Element) | ChildrenNode,
): val is XJSlots {
  return (
    isPlainObject(val) &&
    !isText(val) &&
    !isElement(val) &&
    !isFunction(val) &&
    Object.values(val).every(isFunction)
  )
}

export type XJComponent = (
  props: XJData,
  event: XJEvent,
  children?: (() => Element | Text | (Element | Text)[]) | XJSlots,
) => Element

function _createComponent(
  component: XJComponent,
  props: XJData | null,
  children: ChildrenNode | (() => Element) | XJSlots,
): Element {
  const _props = {} as XJProp
  const _event = {} as XJEvent
  if (props) {
    for (const key in props) {
      const value = props[key]
      if (isReservedProp(key)) {
        // TODO: handle reserved props
        continue
      }

      if (isOn(key)) {
        if (!isFunction(value)) {
          /*#__PURE__*/ console.log(
            `runtime-core -> src -> node.ts -> _createComponent -> key: ${key}`,
          )
          throw new Error(`event ${key} should be a function`)
        }
        const eventName = sliceOn(key)
        _event[eventName as XJEventKey] = value as (...args: unknown[]) => void
      } else {
        _props[key] = value
      }
    }
  }

  if (children) {
    if (isXJSlots(children)) {
      return component(_props, _event, children)
    } else if (isFunction(children)) {
      return component(_props, _event, children)
    } else {
      return component(_props, _event, () => {
        if (isChildrenNode(children)) {
          return elementalizingChildrenNode(children)
        }

        /*#__PURE__*/ console.log(
          `runtime-core -> src -> node.ts -> _createComponent -> children: ${children}`,
        )
        throw new Error(`Invalid children: ${children}`)
      })
    }
  } else {
    return component(_props, _event)
  }
}

function _createHTMLElement(
  tag: string,
  props: XJData | null,
  children: ChildrenNode,
): Element {
  const el = document.createElement(tag)
  if (props) {
    for (const key in props) {
      const value = props[key]
      if (isReservedProp(key)) {
        // TODO: handle reserved props
        setReservedProp(key as ReservedProp, value, el as HTMLElement)
        continue
      }
      if (isOn(key)) {
        const eventName = sliceOn(key)
        if (isEventTag(eventName)) {
          el.addEventListener(eventName, value as EventListener)
        } else {
          /*#__PURE__*/ console.log(
            `runtime-core -> src -> node.ts -> _createHTMLElement -> key: ${key}`,
          )
          throw new Error(`event ${eventName} is not supported in ${tag} tag`)
        }
      } else {
        el.setAttribute(key, String(value) as string)
      }
    }
  }

  if (children) {
    if (isChildrenNode(children)) {
      const _children = elementalizingChildrenNode(children)
      _children.forEach(child => {
        el.appendChild(child)
      })
    } else {
      /*#__PURE__*/ console.log(
        `runtime-core -> src -> node.ts -> _createHTMLElement -> children: ${children}`,
      )
      throw new Error(`Invalid children: ${children}`)
    }
  }

  return el
}

function _createSVGElement(
  tag: string,
  props: XJData | null,
  children: ChildrenNode,
): Element {
  // TODO: handle SVG
  props
  children
  /*#__PURE__*/ console.log(
    `runtime-core -> src -> node.ts -> _createSVGElement -> tag: ${tag}`,
  )
  throw new Error(`SVG tag ${tag} is not supported`)
}

function _createMATS(
  tag: string,
  props: XJData | null,
  children: ChildrenNode,
): Element {
  // TODO: handle MATS
  props
  children
  /*#__PURE__*/ console.log(
    `runtime-core -> src -> node.ts -> _createMATS -> tag: ${tag}`,
  )
  throw new Error(`MATS tag ${tag} is not supported`)
}

function _createNode(
  tag: string | XJComponent,
  props: XJData | null,
  children: ChildrenNode | (() => Element) | XJSlots,
): Element {
  if (isFunction(tag)) {
    return _createComponent(tag as XJComponent, props, children)
  } else if (!isString(tag)) {
    throw new Error(`Invalid tag: ${tag}`)
  }

  const _children = isXJSlots(children)
    ? (() => {
        /*#__PURE__*/ console.log(
          `runtime-core -> src -> node.ts -> _createNode -> children: ${children}`,
        )
        throw new Error(`slots can't be used in non-component element`)
      })()
    : isChildrenNode(children)
      ? children
      : null

  if (isHTMLTag(tag)) {
    if (isVoidTag(tag) && children) {
      throw new Error(`void element ${tag} should not have children`)
    }
    return _createHTMLElement(tag, props, _children)
  } else if (isSVGTag(tag)) {
    return _createSVGElement(tag, props, _children)
  } else if (isMATS(tag)) {
    return _createMATS(tag, props, _children)
  } else {
    /*#__PURE__*/ console.log(
      `runtime-core -> src -> node.ts -> _createNode -> tag: ${tag}`,
    )
    throw new Error(`tag ${tag} is not supported`)
  }
}

export const createNode = (
  tag: string | XJComponent,
  props?: XJData | null,
  children?: ChildrenNode | (() => Element) | XJSlots,
): Element => {
  return _createNode(tag, props ?? {}, children ?? null)
}
