import {
  type ChildType,
  type CustomElementComponent,
  createElement
} from './createElement'
import { isArray } from '@xj-fv/shared'
import { isRef } from '@/reactive/ref'
import { isReactive } from '@/reactive/Dependency'

const isFragment = (tag: unknown): tag is typeof Fragment => tag === Fragment

export const Fragment = Symbol.for('x-fgt') as unknown as {
  __isFragment: true
}

type DeepChildList = ChildType[] | DeepChildList[]

export const h = (
  tag:
    | string
    | typeof Fragment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | CustomElementComponent<any, any, any, any>,
  // TODO: props type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: any,
  ...children: DeepChildList[]
): Node | Node[] => {
  let _tag: string | typeof Fragment

  function _flat(array: DeepChildList[]): ChildType[] {
    if (array.every((val) => !isArray(val))) {
      return array
    }
    const _array = array.flat() as DeepChildList[]
    return _flat(_array)
  }

  const _children = _flat(children)

  if (typeof tag === 'function') {
    const _events: {
      [key: string]: EventListener
    } = {}
    const _props: {
      [key: string]: unknown
    } = {}

    for (const key in props) {
      if (key.startsWith('on-')) {
        _events[key.slice(3)] = props[key]
      } else {
        _props[key] = props[key]
      }
    }

    return tag(props, _children)
  } else {
    _tag = tag
  }

  if (isFragment(_tag)) {
    return _children.reduce((children, child) => {
      if (child instanceof Node) children.push(child)
      // TODO: 未处理Ref Reactive
      if (isRef(child)) {
        throw new Error('jsx Fragment 未处理Ref')
      }
      if (isReactive(child)) {
        throw new Error('jsx Fragment 未处理Reactive')
      }
      if (typeof child === 'string') {
        children.push(document.createTextNode(child))
      }
      return children
    }, [] as Node[])
  } else {
    return createElement(_tag, props ?? {}, _children ?? [])
  }
}

export const __jsx = {
  h,
  Fragment
}
