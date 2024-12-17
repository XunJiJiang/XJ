import {
  type ChildType,
  type CustomElementComponent,
  createElement,
  isIfLabel,
  isElseLabel,
  isForLabel
} from './createElement'
import { isArray } from '@xj-fv/shared'
import { isRef } from '@/reactive/ref'
import { isReactive } from '@/reactive/Dependency'
import { Reactive } from '@/reactive/reactive'

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
    | CustomElementComponent<any, any, any, any>
    | FunctionLabelComponent.$if
    | FunctionLabelComponent.$elseif
    | FunctionLabelComponent.$else
    | FunctionLabelComponent.$for,
  // TODO: props type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: any,
  firstChild?:
    | Reactive<ChildType[]>
    | DeepChildList
    | ((item: unknown, index: number) => ChildType | ChildType[]),
  ...children: DeepChildList[]
): Node | Node[] | (Node | Node[])[] => {
  let _tag: string | typeof Fragment

  if (
    firstChild !== undefined &&
    typeof firstChild !== 'function' &&
    !isReactive(firstChild)
  )
    children = [firstChild, ...children]

  function _flat(array: DeepChildList[]): ChildType[] {
    if (array.every((val) => !isArray(val))) {
      return array
    }
    const _array = array.flat() as DeepChildList[]
    return _flat(_array)
  }

  const _children = _flat(children)

  if (typeof tag === 'function') {
    if (isIfLabel(tag)) {
      return tag({
        value: props.value,
        children: _children
      })
    } else if (isElseLabel(tag)) {
      return tag({
        children: _children
      })
    } else if (isForLabel(tag)) {
      return tag({
        value: props.value,
        children: firstChild as (
          item: unknown,
          index: number,
          setKey: (key: string | number | symbol) => void
        ) => Node | Node[]
      })
    }

    return tag(
      props,
      isReactive(firstChild)
        ? (firstChild as unknown as Reactive<ChildType[]>)
        : _children
    )
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
    return createElement(
      _tag,
      props ?? {},
      isReactive(firstChild)
        ? (firstChild as unknown as Reactive<ChildType[]>)
        : (_children ?? [])
    )
  }
}

export const __jsx = {
  h,
  Fragment
}
