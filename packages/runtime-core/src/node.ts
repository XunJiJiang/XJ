import {
  type ReservedPropKey,
  isHTMLTag,
  isVoidTag,
  isSVGTag,
  isMATS,
  isFunction,
  isArray,
  isString,
  isNumber,
  isBoolean,
  isText,
  isElement,
  isOn,
  sliceOn,
  isEventTag,
  isReservedProp,
  isSpecialNativeProp,
  toLowerCase,
  isEmptyObject,
  // isKnownHtmlAttr,
  // isBooleanAttr,
} from '@xj-fv/shared'

import {
  type XJData,
  type XJEventKey,
  type XJEvent,
  type XJProp,
  type XJChildNode,
  type XJChildrenNode,
  type XJSlots,
  type XJComponent,
  type XJNodeTypes,
  isXJSlots,
  isXJChildrenNodeArr,
  isXJChildrenNode,
  Fragment,
} from './component'

import { nodeOps } from './nodeOps'

import {
  type ReservedProps,
  setReservedProp,
  setSpecialNativeProp,
  captureComponentReservedProp,
} from './prop'

const elementalizingXJChildrenNode = (
  children: XJChildrenNode,
): (Element | Text)[] => {
  const { createText } = nodeOps

  if (isString(children) || isNumber(children) || isBoolean(children)) {
    return [createText(String(children))]
  }

  if (isText(children) || isElement(children)) {
    return [children]
  }

  if (isXJChildrenNodeArr(children)) {
    return children.map(child => {
      if (isString(child) || isNumber(child) || isBoolean(child)) {
        return createText(String(child))
      }

      if (isText(child) || isElement(child)) {
        return child
      }

      if (child == null) {
        return createText('')
      }

      /*#__PURE__*/ console.log(
        `runtime-core -> src -> node.ts -> elementalizingXJChildrenNode -> child: ${child}`,
      )
      throw new Error(`Invalid children: ${child}`)
    })
  }

  /*#__PURE__*/ console.log(
    `runtime-core -> src -> node.ts -> elementalizingXJChildrenNode -> children: ${children}`,
  )
  throw new Error(`Invalid children: ${children}`)
}

const _createComponent = (
  component: XJComponent,
  props: XJData | null,
  children: XJChildrenNode | XJSlots,
): XJNodeTypes => {
  const _props = {} as XJProp
  const _event = {} as XJEvent

  const reservedProps: Partial<ReservedProps> = {}

  if (props) {
    for (const key in props) {
      const value = props[key]
      if (isReservedProp(key)) {
        reservedProps[key as ReservedPropKey] = value
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
        _event[('on' + eventName) as XJEventKey] = value as (
          ...args: unknown[]
        ) => void
      } else {
        _props[key] = value
      }
    }
  }

  if (children) {
    if (isXJSlots(children)) {
      return captureComponentReservedProp(
        component,
        _props,
        _event,
        children,
        reservedProps,
      )
    } else if (isXJChildrenNode(children)) {
      return captureComponentReservedProp(
        component,
        _props,
        _event,
        () => {
          return elementalizingXJChildrenNode(children)
        },
        reservedProps,
      )
    } else {
      /*#__PURE__*/ console.log(
        `runtime-core -> src -> node.ts -> _createComponent -> children: ${children}`,
      )
      throw new Error(`Invalid children: ${children}`)
    }
  } else {
    return component(_props, _event)
  }
}

const _createHTMLElement = (
  tag: string,
  props: XJData | null,
  children: XJChildrenNode,
): Element => {
  const { createElement } = nodeOps
  const el = createElement(tag)
  if (props) {
    for (const key in props) {
      const value = props[key]

      if (isReservedProp(key)) {
        setReservedProp(key, value, el as HTMLElement)
        continue
      }

      if (isSpecialNativeProp(key)) {
        setSpecialNativeProp(key, value, el as HTMLElement)
        continue
      }

      if (isOn(key)) {
        const eventName = sliceOn(key)
        if (isEventTag(eventName)) {
          el.addEventListener(toLowerCase(eventName), value as EventListener)
        } else {
          /*#__PURE__*/ console.log(
            `runtime-core -> src -> node.ts -> _createHTMLElement -> key: ${key}`,
          )
          throw new Error(`event ${eventName} is not supported in ${tag} tag`)
        }
        continue
      }

      el.setAttribute(key, String(value) as string)
    }
  }

  if (children) {
    if (isXJChildrenNode(children)) {
      const _children = elementalizingXJChildrenNode(children)
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

const _createSVGElement = (
  tag: string,
  props: XJData | null,
  children: XJChildrenNode,
): Element => {
  // TODO: handle SVG
  props
  children
  /*#__PURE__*/ console.log(
    `runtime-core -> src -> node.ts -> _createSVGElement -> tag: ${tag}`,
  )
  throw new Error(`SVG tag ${tag} is not supported`)
}

const _createMATS = (
  tag: string,
  props: XJData | null,
  children: XJChildrenNode,
): Element => {
  // TODO: handle MATS
  props
  children
  /*#__PURE__*/ console.log(
    `runtime-core -> src -> node.ts -> _createMATS -> tag: ${tag}`,
  )
  throw new Error(`MATS tag ${tag} is not supported`)
}

const _createNode = (
  tag: string | XJComponent | typeof Fragment,
  props: XJData | null,
  children: XJChildrenNode | XJSlots,
): XJNodeTypes => {
  if (isFunction(tag)) {
    return _createComponent(tag as XJComponent, props, children)
  } else if (tag === Fragment) {
    const fragment: XJComponent = (props, _, children) => {
      if (!isFunction(children) && isXJSlots(children)) {
        /*#__PURE__*/ console.log(
          `runtime-core -> src -> node.ts -> _createNode -> children: ${children}`,
        )
        throw new Error(`Fragment should not have slots`)
      }
      if (props && !isEmptyObject(props)) {
        /*#__PURE__*/ console.log(
          `runtime-core -> src -> node.ts -> _createNode -> props: ${props}`,
        )
        throw new Error(`Fragment should not have props`)
      }
      return isFunction(children) ? children() : []
    }
    if (children) {
      if (isXJChildrenNode(children)) {
        const _children = elementalizingXJChildrenNode(children)
        return _createComponent(fragment, {}, _children)
      } else {
        /*#__PURE__*/ console.log(
          `runtime-core -> src -> node.ts -> _createNode -> children: ${children}`,
        )
        throw new Error(`Invalid children: ${children}`)
      }
    } else {
      return _createComponent(fragment, {}, [])
    }
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
    : isXJChildrenNode(children)
      ? children
      : (() => {
          /*#__PURE__*/ console.log(
            `runtime-core -> src -> node.ts -> _createNode -> children: ${children}`,
          )
          throw new Error(`Invalid children: ${children}`)
        })()

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
  tag: string | XJComponent | typeof Fragment,
  props?: XJData | null,
  children?: XJChildrenNode | XJSlots,
): XJNodeTypes => {
  return _createNode(tag, props ?? {}, children ?? null)
}

export const h = (
  tag: string | XJComponent | typeof Fragment,
  props?: XJData | null,
  children?: XJChildrenNode | XJSlots,
  ...childrenArr: XJChildNode[]
): XJNodeTypes => {
  function _flat(array: XJChildNode[]): XJChildNode[] {
    if (array.every(val => !isArray(val))) {
      return array
    }
    const _array = array.flat()
    return _flat(_array)
  }
  const _children = isXJSlots(children)
    ? children
    : isFunction(children)
      ? children
      : [...(isArray(children) ? children : [children]), ..._flat(childrenArr)]

  return createNode(tag, props ?? {}, _children ?? null)
}
