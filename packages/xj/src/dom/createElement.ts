/* eslint-disable @typescript-eslint/no-explicit-any */
import { isReactive } from '@/reactive/Dependency'
import { isRef, Ref } from '@/reactive/ref'
import { type StopFn } from '@/reactive/effect'
import { watch } from '@/reactive/watch'
import { reactive, type Reactive } from '@/reactive/reactive'
import { type Func, type HTMLElementTag, isArray } from '@xj-fv/shared'
import { type BaseElement } from './BaseElement'

class SameKey extends Error {
  constructor(key: string) {
    super(`x-for: key ${key} is same`)
  }
}

export const $if: FunctionLabelComponent.$if = ({ value }, ...children) => {}
export const $elseif: FunctionLabelComponent.$elseif = (
  { value },
  ...children
) => {}
export const $else: FunctionLabelComponent.$else = (_props, ...children) => {}

// TODO: $for 存在内存泄漏
export const $for: FunctionLabelComponent.$for = ({ value, children }) => {
  const childNodes: (Node | Node[])[] = isReactive(value) ? reactive([]) : []
  const itemMap = new Map<number | string | symbol, Node[] | Node>()
  const newKeys = new Set<number | string | symbol>()

  let tempKey: number | string | symbol | null = null

  const createSetKey = (/* index: number */) => {
    return (key: string | number | symbol) => {
      newKeys.add(key)
      tempKey = key
      if (itemMap.has(key)) {
        throw new SameKey(String(key))
      }
    }
  }

  if (isReactive<any>(value) && isArray<Reactive<any[]>>(value)) {
    // const stopFn =
    watch(
      value,
      (value) => {
        value.forEach((item, index) => {
          try {
            const child = children(item, index, createSetKey())
            itemMap.set(tempKey!, child)
            childNodes[index] = child
          } catch (e) {
            if (e instanceof SameKey) {
              childNodes[index] = itemMap.get(tempKey!)!
            } else {
              throw e
            }
          }
        })
        tempKey = null
        itemMap.forEach((_value, key) => {
          if (!newKeys.has(key)) {
            itemMap.delete(key)
          }
        })
        childNodes.splice(value.length)
        newKeys.clear()
      },
      { deep: false, promSync: true }
    )
  } else if (isArray(value)) {
    value.forEach((item: any, index) => {
      const child = children(item, index, createSetKey())
      childNodes.push(child)
    })
  }

  return childNodes
}

// const functionLabels = new Set([$if, $elseif, $else, $for])

export const isIfLabel = (
  fn: Func
): fn is FunctionLabelComponent.$if | FunctionLabelComponent.$elseif =>
  fn === $if || fn === $elseif

export const isElseLabel = (fn: Func): fn is FunctionLabelComponent.$else =>
  fn === $else

export const isForLabel = (fn: Func): fn is FunctionLabelComponent.$for =>
  fn === $for

export const STOP_EFFECTS: XJ.STOP_EFFECTS = Symbol(
  'x-stop-effects'
) as XJ.STOP_EFFECTS

export const START_EFFECTS: XJ.START_EFFECTS = Symbol(
  'x-start-effects'
) as XJ.START_EFFECTS

export type Exposed = Record<string, any>

type Constructors =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ArrayConstructor
  | ObjectConstructor
  | FunctionConstructor

export type ConstructorToType<C> = C extends StringConstructor
  ? string
  : C extends NumberConstructor
    ? number
    : C extends BooleanConstructor
      ? boolean
      : C extends ArrayConstructor
        ? Array<unknown>
        : C extends ObjectConstructor
          ? object
          : C extends FunctionConstructor
            ? Func
            : C extends () => Array<infer U>
              ? U[]
              : C extends () => infer U
                ? U
                : never

export type BaseProps = Record<string, Constructors | (() => unknown)>

export type DefineProps<T extends BaseProps> = {
  [key in keyof T]: {
    default?: ConstructorToType<T[key]>
    required?: boolean
    type: T[key] | T[key][]
  }
}

export type BaseEmits = Record<string, FunctionConstructor | (() => Func)>

export type DefineEmits<T extends BaseEmits> = {
  [key in keyof T]: {
    default?: FuncConstructorToType<T[key]>
    required?: boolean
    type: T[key] | T[key][]
  }
}

/** 获取必填key */
type GetRequiredKeys<
  T extends
    | DefineProps<{
        [key: string]: Constructors | (() => unknown)
      }>
    | undefined
> = {
  [K in keyof T]: T[K] extends { required: true } ? K : never
}[keyof T]

/** 解析必传属性和非必传属性 */
export type RequiredKeys<
  P extends BaseProps,
  Props extends DefineProps<P> | undefined
> = Partial<Omit<P, GetRequiredKeys<Props>>> &
  Omit<P, keyof Omit<P, GetRequiredKeys<Props>>>

export type FuncConstructorToType<C> = C extends FunctionConstructor
  ? Func
  : C extends () => infer U
    ? U extends Func
      ? U
      : never
    : never

// TODO: 不会限制不存在的属性可能是因为IntrinsicAttributes为any
export type CustomElementComponent<
  P extends BaseProps,
  E,
  O extends string,
  Props extends DefineProps<P> | undefined
  // S,
  // Shadow
> = (
  props: {
    [key in keyof RequiredKeys<P, Props>]: ConstructorToType<
      RequiredKeys<P, Props>[key]
    >
  } & Partial<
    {
      [key in keyof E as `on-${string & key}`]: FuncConstructorToType<E[key]>
    } & Record<O, string> & {
        expose: Ref<Exposed | null>
        ref: Ref<BaseElement | null>
      }
  >,
  children: ChildType[] | Reactive<ChildType[]>
) => BaseElement

/** 保留键 */
export const reservedKeys = ['ref', 'expose'] as const

type ReservedKey = (typeof reservedKeys)[number]

export const isReservedKey = (key: string): key is ReservedKey =>
  reservedKeys.includes(key as ReservedKey)

export type CustomElementOptions = {
  extends: HTMLElementTag | null
  shadow: boolean
  __context__: {
    component: CustomElementComponent<any, any, any, any>
  }
}

/** 记录自定义web组件名 */
const customElementNameMap = new Map<string, CustomElementOptions>()

/** 是否是自定义web组件 */
export const isCustomElement = (
  _el: Element,
  name: string
): _el is BaseElement => customElementNameMap.has(name)

/** 获取自定义组件的配置 */
export const getCustomElementOption = (
  name: string
): CustomElementOptions | undefined => {
  return customElementNameMap.get(name)
}

export const hasCustomElementOption = (name: string): boolean => {
  return customElementNameMap.has(name)
}

export const setCustomElementOption = (
  name: string,
  opt: CustomElementOptions
) => {
  customElementNameMap.set(name, opt)
}

export const customElementOptionMap = {
  set: setCustomElementOption,
  get: getCustomElementOption,
  has: hasCustomElementOption
}

const setAttribute = (el: Element, key: string, value: any) => {
  if (value === null || value === undefined) {
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, String(value))
  }
}

export type ChildType = string | Node | Ref<unknown> | Reactive<unknown[]>

const isXJElement = <T extends Element = Element>(
  el: any
): el is XJ.Element<T> => {
  return STOP_EFFECTS in el && START_EFFECTS in el
}

const oldAppendChild = Element.prototype.appendChild

Element.prototype.appendChild = function <T extends Node>(node: T): T {
  const _ret = oldAppendChild.call(this, node)
  if (isXJElement(node)) {
    node[START_EFFECTS]()
  }
  return _ret as T
}

const oldInsertAfter = Element.prototype.insertAdjacentElement

Element.prototype.insertAdjacentElement = function (
  position: InsertPosition,
  element: Element
): Element | null {
  const _ret = oldInsertAfter.call(this, position, element)
  if (isXJElement(element)) {
    element[START_EFFECTS]()
  }
  return _ret
}

const oldReplaceChild = Element.prototype.replaceChild

Element.prototype.replaceChild = function <T extends Node>(
  newChild: Node,
  oldChild: T
): T {
  const _ret = oldReplaceChild.call(this, newChild, oldChild)
  if (isXJElement(newChild)) {
    newChild[START_EFFECTS]()
  }
  if (isXJElement(oldChild)) {
    oldChild[STOP_EFFECTS]()
  }
  return _ret as T
}

export const _createElement = (
  tag: string,
  props?: { [key: string]: any },
  children?: ChildType[] | Reactive<ChildType[]>
): Element => {
  // TODO: 使用模板字符串拼接dom字符串, 使用与否目前没有显著性能差异
  // if (
  //   Object.values(props ?? {}).every((val) => typeof val === 'string') &&
  //   children &&
  //   children.length <= 1 &&
  //   children.every((val) => typeof val === 'string')
  // ) {
  //   return `
  //     <${tag} ${Object.entries(props ?? {})
  //       .map(([key, val]) => `${key}="${val}"`)
  //       .join(' ')}
  //     >
  //       ${children.join('')}
  //     </${tag}>
  //   `
  // }

  const customElementOption = customElementOptionMap.get(tag)

  const el = (() => {
    if (customElementOption?.extends) {
      return document.createElement(customElementOption.extends, { is: tag })
    } else return document.createElement(tag)
  })() as XJ.Element<HTMLElement>

  const isCustomEle = isCustomElement(el, tag)
  const component = el as XJ.Element<BaseElement>

  if (isCustomEle && !customElementOption?.shadow) {
    children = children?.filter((child) => {
      if (child instanceof HTMLElement) {
        if (child.slot) {
          component.$slots[child.slot] = component.$slots[child.slot] || []
          if (child instanceof HTMLTemplateElement) {
            // 获取template的内容
            const content = child.content
            const childNodes = content.childNodes
            childNodes.forEach((childNode) => {
              if (childNode instanceof HTMLElement) {
                component.$slots[child.slot].push(childNode)
                return false
              } else if (typeof childNode === 'string') {
                const textNode = document.createTextNode(childNode)
                component.$slots[child.slot].push(textNode)
                return false
              }
            })
          } else {
            component.$slots[child.slot].push(child)
            return false
          }
        } else if (child instanceof HTMLTemplateElement) {
          // 获取template的内容
          const content = child.content
          const childNodes = content.childNodes
          childNodes.forEach((childNode) => {
            if (childNode instanceof HTMLElement) {
              component.$slots['default'].push(childNode)
            } else if (typeof childNode === 'string') {
              const textNode = document.createTextNode(childNode)
              component.$slots['default'].push(textNode)
            }
          })
          return false
        }
        return true
      }
    })
  }

  const EffectStops: Set<StopFn> = new Set()

  let isStop = true
  const childNodes = isCustomEle ? el.$root?.childNodes : el.childNodes

  const textNodeEffects = new Set<() => void>()
  const textNodeEffectsStops = new Set<StopFn>()

  el[STOP_EFFECTS] = () => {
    if (isStop) return
    isStop = true
    EffectStops.forEach((stop) => stop())
    EffectStops.clear()

    textNodeEffectsStops.forEach((stop) => stop())
    textNodeEffectsStops.clear()

    childNodes.forEach((child) => {
      if (isXJElement(child)) {
        child[STOP_EFFECTS]()
      }
    })
  }

  el[START_EFFECTS] = () => {
    if (!isStop) return
    isStop = false

    // 自定义元素observe属性绑定
    // 原生元素响应式属性绑定
    for (const key in props) {
      if (isCustomEle) {
        if (el.obAttr.includes(key) && isRef<string>(props[key])) {
          const stop = watch(
            props[key],
            (value) => {
              setAttribute(el, key, value)
            },
            { promSync: true }
          )
          EffectStops.add(stop)
        }
      } else {
        if (!isReservedKey(key)) {
          if (key === 'class') {
            if (isReactive<string[]>(props[key])) {
              if (isArray<Reactive<string[]>>(props[key])) {
                if (!isReactive<string[]>(props[key])) return
                const stop = watch(
                  props[key],
                  (value) => {
                    el.className = value.join(' ')
                  },
                  { deep: 1, promSync: true }
                )
                EffectStops.add(stop)
              }
            } else if (isRef(props[key])) {
              if (isArray<string[]>(props[key].value)) {
                const stop = watch(
                  props[key],
                  (value) => {
                    setAttribute(el, key, value)
                  },
                  { promSync: true }
                )
                EffectStops.add(stop)
              } else {
                const stop = watch(
                  props[key] as Ref<string>,
                  (value) => {
                    setAttribute(el, key, value)
                  },
                  { promSync: true }
                )
                EffectStops.add(stop)
              }
            }
          } else if (isRef(props[key])) {
            const stop = watch(
              props[key],
              (value) => {
                setAttribute(el, key, String(value))
              },
              { promSync: true }
            )
            EffectStops.add(stop)
          }
        }
      }
    }

    textNodeEffects.forEach((effect) => effect())

    childNodes.forEach((child) => {
      if (isXJElement(child)) {
        child[START_EFFECTS]()
      }
    })
  }

  const elRemove = el.remove.bind(el)

  el.remove = () => {
    el[STOP_EFFECTS]()
    elRemove()
  }

  // 事件绑定
  // 自定义组件属性绑定
  // 原生组件静态属性绑定
  // ref和expose属性绑定
  for (const key in props) {
    // 处理事件绑定
    if (key.startsWith('on-')) {
      // /*#__PURE__*/ eventCheck(key.slice(3) as EventHandlers, props[key])
      const eventName = key.slice(3)
      // 对于自定义元素
      if (isCustomEle) {
        if (component) component.$emitMethods[eventName] = props[key]
      }
      // 对于原生元素
      else {
        el.addEventListener(eventName, props[key])
      }
    }
    // 处理属性绑定
    else {
      // 对于自定义元素
      if (isCustomEle) {
        // 对于保留属性 TODO: 目前是ref,expose。有修改需求时，需要修改此处
        if (isReservedKey(key)) {
          if (isRef(props[key])) {
            if (key === 'ref') {
              props[key].value = el
            } else if (key === 'expose') {
              props[key].value = el.$exposedData
            }
          } else {
            /*#__PURE__*/ console.error(
              `ref和expose属性只能是ref类型, 但得到了 ${typeof props[key]} ${props[key]}`
            )
          }
        }
        // 对于observe属性
        else if (el.obAttr.includes(key)) {
          if (!isRef(props[key])) {
            setAttribute(el, key, props[key])
          }
        }
        // 其他属性认为是prop声明的属性, 直接赋值
        else {
          component.$propData[key] = props[key]
        }
      }
      // 对于原生元素
      else {
        // 对于保留属性 TODO: 目前是ref,expose。有修改需求时，需要修改此处
        if (isReservedKey(key)) {
          if (isRef(props[key])) {
            if (key === 'ref') {
              props[key].value = el
            } else if (key === 'expose') {
              /*@__PURE__*/ console.error(
                `原生元素不支持expose属性, 请使用自定义元素`
              )
            }
          } else {
            /*#__PURE__*/ console.error(
              `ref和expose属性只能是ref类型, 但得到了 ${typeof props[key]} ${props[key]}`
            )
          }
        }
        // 对于class
        else if (key === 'class') {
          if (isArray<string[]>(props[key])) {
            if (!isReactive(props[key])) {
              el.className = props[key].join(' ')
            }
          } else {
            if (!isRef(props[key])) {
              setAttribute(el, key, props[key])
            }
          }
        } else if (!isRef(props[key])) {
          setAttribute(el, key, props[key])
        }
      }
    }
  }

  if (isReactive(children)) {
    const stop = watch(
      children as Reactive<ChildType[]>,
      (value) => {
        const oldValue = el.childNodes
        value.forEach((child, index) => {
          if (oldValue && oldValue[index] === child) {
            return
          } else {
            const newNode = ((child, textNodeEffects, textNodeEffectsStops) => {
              if (child instanceof Node) {
                return child
              }
              return createWatchNode(
                child,
                textNodeEffects,
                textNodeEffectsStops
              )
            })(child, textNodeEffects, textNodeEffectsStops)
            if (childNodes[index]) {
              el.replaceChild(newNode, childNodes[index])
            } else {
              el.appendChild(newNode)
            }
          }
        })
        if (value.length < childNodes.length) {
          for (let i = value.length; i < childNodes.length; i++) {
            childNodes[i].remove()
          }
        }
      },
      { deep: true, promSync: true }
    )
    EffectStops.add(stop)
  } else {
    children?.forEach((child) => {
      if (child instanceof Node) {
        el.appendChild(child)
      } else {
        const childEl = createWatchNode(
          child,
          textNodeEffects,
          textNodeEffectsStops
        )

        el.appendChild(childEl)
      }
    })
  }

  return el
}

export const createElement = (
  tag: string,
  props?: { [key: string]: any },
  children?: ChildType[] | Reactive<ChildType[]>
): Element => {
  return _createElement(tag, props, children)
}

export const createWatchNode = (
  child: ChildType,
  textNodeEffects: Set<() => void>,
  textNodeEffectsStops: Set<StopFn>
): Node => {
  if (isRef(child)) {
    const childEl = document.createTextNode(String(child.value))
    textNodeEffects.add(() => {
      textNodeEffectsStops.add(
        watch(
          child,
          (value) => {
            childEl.nodeValue = String(value)
          },
          { deep: true, promSync: true }
        )
      )
    })
    return childEl
  }
  if (isReactive(child)) {
    const childEl = document.createTextNode(String(child))
    textNodeEffects.add(() => {
      textNodeEffectsStops.add(
        watch(
          child as Reactive<unknown[]>,
          (value) => {
            childEl.nodeValue = String(value)
          },
          { deep: true, promSync: true }
        )
      )
    })
    return childEl
  }
  return document.createTextNode(String(child))
}
