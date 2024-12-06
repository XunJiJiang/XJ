/* eslint-disable @typescript-eslint/no-explicit-any */
// 为了在自定义组件中使用类型推断, 需要使用any
/*
 * WARN: 可能存在的问题:
 * 1. 在单个自定义组件内创建出超出一层的自定义组件时,
 *    子组件只能获取到最外层的父组件实例, 无法获取到中间的父组件实例
 *    就这样挺好, 不需要关心中间的组件实例
 */

import {
  Func,
  hasOwn,
  isArray,
  notNull,
  type HTMLElementTag,
  HTMLExtends,
  createIdGenerator
} from '@xj-fv/shared'
import { SYMBOL_INIT, type BaseElement } from './BaseElement'
import { setComponentIns } from './fixComponentIns'
import { startSetupRunning } from '@/hooks/lifecycle/verifySetup'
import { clearBeforeMount, runBeforeMount } from '@/hooks/lifecycle/beforeMount'
import { clearMounted, runMounted } from '@/hooks/lifecycle/mounted'
import { isRef, Ref } from '@/reactive/ref'
import { Reactive } from '@/reactive/reactive'
import { StopFn } from '@/reactive/effect'
import { watch } from '@/reactive/watch'
import { isReactive } from '@/reactive/Dependency'

type Shared = Record<string, any>

type Exposed = Record<string, any>

// export type DefineProps<T extends Record<string, any>> = T

// export type DefineEmit<T extends Record<string, any>> = (
//   key: keyof T,
//   ...args: Parameters<T[keyof T]>
// ) => ReturnType<T[keyof T]>

export interface EleCallback {
  (this: BaseElement, context: { data: Shared }): void
}

export interface EleAttributeChangedCallback {
  (
    this: BaseElement,
    change: {
      name: string
      oldValue: string
      newValue: string
    },
    context: { data: Shared }
  ): void
}

export type BaseProps = Record<string, Constructors | (() => unknown)>

type Constructors =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ArrayConstructor
  | ObjectConstructor
  | FunctionConstructor

type ConstructorToType<C> = C extends StringConstructor
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

type DefineProps<T extends BaseProps> = {
  [key in keyof T]: {
    default?: ConstructorToType<T[key]>
    required?: boolean
    type: T[key] | T[key][]
  }
}

export type BaseEmits = Record<string, FunctionConstructor | (() => Func)>

type FuncConstructorToType<C> = C extends FunctionConstructor
  ? Func
  : C extends () => infer U
    ? U extends Func
      ? U
      : never
    : never

type DefineEmits<T extends BaseEmits> = {
  [key in keyof T]: {
    default?: FuncConstructorToType<T[key]>
    required?: boolean
    type: T[key] | T[key][]
  }
}

// type BaseSlots = Record<string, () => Node[] | Node> | string[]

type DefineSlots<T> =
  | {
      [key in keyof T]: () => Node[]
    }
  | (T extends string[] ? [...T] : never)
  | void

type DefineSlot<T, Shadow extends boolean> = Shadow extends false
  ? T extends string[]
    ? {
        [key in T[number]]: () => Node[]
      }
    : {
        [key in keyof T]: () => Node[]
      }
  : void

export type CustomElementConfig<
  P extends BaseProps,
  E extends BaseEmits,
  O extends string,
  S = [],
  Shadow extends boolean = false
> = {
  name?: string
  style?:
    | string
    | ((
        props: {
          [key in keyof P]: ConstructorToType<P[key]>
        } & Record<O, string>
      ) => string)
  shadow?: Shadow
  setup: (
    props: {
      [key in keyof P]: ConstructorToType<P[key]>
    } & Record<O, string>,
    context: {
      expose: (methods: Exposed) => void
      share: (methods: Shared) => void
      emit: <T extends keyof E & string>(
        key: T,
        ...args: Parameters<FuncConstructorToType<E[T]>>
      ) => ReturnType<FuncConstructorToType<E[T]>>
      slot: DefineSlot<S, Shadow>
    }
  ) => Node | Node[] | void
  props?: DefineProps<P>
  emits?: DefineEmits<E>
  slots?: DefineSlots<S>
  observedAttributes?: O[]
  connected?: EleCallback
  disconnected?: EleCallback
  adopted?: EleCallback
  attributeChanged?: EleAttributeChangedCallback
}

// TODO: 不会限制不存在的属性可能是因为IntrinsicAttributes为any
export type CustomElementType<
  P extends BaseProps,
  E,
  O extends string
  // S,
  // Shadow
> = (
  props: Partial<
    {
      [key in keyof P]: ConstructorToType<P[key]>
    } & {
      [key in keyof E as `on-${string & key}`]: FuncConstructorToType<E[key]>
    } & Record<O, string> & {
        expose: Ref<Exposed | null>
        ref: Ref<BaseElement | null>
      }
  >,
  events: {
    [key in keyof E]: Func
  },
  children: ChildType[]
) => BaseElement

const idGenerator = createIdGenerator('xj-custom-element')

const customElementRegistry = window.customElements

const checkPropsEmit = <T extends BaseProps, K extends BaseEmits>(
  opts: DefineProps<T> | DefineEmits<K>,
  ele: BaseElement
) => {
  for (const key in opts) {
    if (!opts[key].required && !('default' in opts[key])) {
      /*@__PURE__*/ console.error(
        `${ele.localName}: emit: ${key} 为非必须属性, 但未设置默认值。`
      )
    }
  }
}

// 不能使用on-开头的属性
const checkObservedAttributes = (attrs: string[]) => {
  for (const attr of attrs) {
    if (/^(on-)/.test(attr)) {
      /*@__PURE__*/ console.error(
        `observedAttributes: ${attr} 不能以 on- 开头。`
      )
    } else if (reservedKeys.includes(attr)) {
      /*@__PURE__*/ console.error(`observedAttributes: ${attr} 为保留键。`)
    }
  }
}

const isObservableAttr = <T extends string>(
  key: string,
  observedAttributes: T[]
): key is T => {
  return observedAttributes.includes(key as T)
}

/** 保留键 */
const reservedKeys = ['ref', 'expose']

type ReservedKey = 'ref' | 'expose'

export const isReservedKey = (key: string): key is ReservedKey =>
  reservedKeys.includes(key)

export type CustomElementOptions = {
  extends: HTMLElementTag | null
  shadow: boolean
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

// TODO: B extends string
export const defineCustomElement = <
  P extends BaseProps,
  E extends BaseEmits,
  O extends string,
  S = [],
  Shadow extends boolean = false
>(
  config: CustomElementConfig<P, E, O, S, Shadow>,
  options?: CustomElementOptions
): CustomElementType<P, E, O> => {
  const {
    name = idGenerator(),
    style,
    shadow = false,
    setup,
    props,
    emits,
    slots,
    observedAttributes,
    connected,
    disconnected,
    adopted,
    attributeChanged
    // ...rest
  } = config

  if (customElementNameMap.has(name.toLowerCase())) {
    /*@__PURE__*/ console.error(`自定义组件 ${name} 重复定义。`)
    return
  }

  const _shadow = shadow

  if (style && !shadow) {
    const styleEle = document.createElement('style')
    if (typeof style === 'string' && style !== '') styleEle.textContent = style
    else if (typeof style === 'function') {
      /*@__PURE__*/ console.error(
        `${name}: 当不使用shadow时, style只能是string类型。`
      )
    }

    document.head.appendChild(styleEle)
  }

  const BaseEle = HTMLExtends.get(options?.extends ?? '') ?? HTMLElement

  class Ele
    extends BaseEle
    implements
      BaseElement<
        {
          [key in keyof P]: ConstructorToType<P[key]>
        } & Record<O, string>
      >
  {
    constructor() {
      super()
      // 设置当前组件实例, 并返回父组件实例
      const { restore } = setComponentIns(this)
      this.$sharedData = {}

      const _observedAttributes = observedAttributes || []

      // TODO: 在解决 "不使用Shadow Root的元素绑定数据时外部会获取到子组件内容" 的问题前, 强制使用Shadow Root
      if (_shadow && !options?.extends) {
        this.$root = this.attachShadow({ mode: 'open' })
      } else {
        this.$root = this
      }

      /*@__PURE__*/ checkPropsEmit(emits ?? {}, this)
      /*@__PURE__*/ checkPropsEmit(props ?? {}, this)
      /*@__PURE__*/ checkObservedAttributes(_observedAttributes)

      // 恢复父组件实例
      restore()
    }

    static get observedAttributes() {
      return observedAttributes || []
    }

    get obAttr() {
      return observedAttributes || []
    }

    connectedCallback() {
      const { old: parentComponent, restore } = setComponentIns(this)
      this.$parentComponent = parentComponent

      const shadow = this.$root

      const _observedAttributes = observedAttributes || []

      // 获取observedAttributes定义属性的键值
      const attrs = Array.from(this.attributes)
      for (const attr of attrs) {
        const { name, value } = attr
        if (isObservableAttr<O>(name, _observedAttributes)) {
          ;(
            this.$props as {
              [key in O]: string
            }
          )[name] = value
        } else if (reservedKeys.includes(name)) {
          continue
        }
        // else {
        //   /*@__PURE__*/ console.warn(
        //     `由 ${parentComponent?.localName} 赋予 ${this.localName} 的属性 ${name} 可能不被 ${name} 需要。`
        //   )
        // }
      }

      // 从父组件的暴露中获取props定义的属性
      if (props) {
        const _props = props
        const propData = this.$propData
        for (const key in _props) {
          const { default: def, required } = _props[key]
          if (key in propData) {
            this.$props[key] = propData[key]
          } else if (!required && 'default' in _props[key] && notNull(def)) {
            this.$props[key] = def as ({
              [key in keyof P]: ConstructorToType<P[key]>
            } & { [key in O]: string })[Extract<keyof P, string>]
          } else {
            /*@__PURE__*/ console.error(
              (() => {
                if (
                  !required &&
                  (!('default' in _props[key]) || !notNull(def))
                ) {
                  return `${this.localName}: ${key} 为非必须属性, 但未设置有效默认值。`
                } else if (required && !propData[key]) {
                  return `${this.localName}: ${key} 为必须属性, 但未传递值。`
                } else {
                  return `${this.localName}: 未知错误`
                }
              })()
            )
          }
        }
      }

      // 包装父组件暴露的方法
      const emitFn = <T extends keyof E & string>(
        key: T,
        ...args: Parameters<FuncConstructorToType<E[T]>>
      ): ReturnType<FuncConstructorToType<E[T]>> => {
        if (
          emits &&
          (hasOwn(this.$emitMethods, key) || !emits[key].required) &&
          hasOwn(emits, key)
        ) {
          const emitMethods = this.$emitMethods

          const _emit = emits

          if (typeof emitMethods[key] === 'function') {
            const fn = emitMethods[key]
            return fn(...args)
          }
          // 非必须的方法, 且有默认值
          else if (
            !_emit[key].required &&
            typeof _emit[key].default === 'function'
          ) {
            const fn = _emit[key].default
            const { restore } = setComponentIns(this)
            const _return = fn(...args)
            restore()
            return _return
          }

          /*@__PURE__*/ console.error(
            (() => {
              const parentName = this.$parentComponent?.localName ?? ''
              if (
                hasOwn(emitMethods, key) &&
                typeof emitMethods[key] !== 'function'
              ) {
                return `on-${key} 需要的类型为 function, 而 ${parentName} 向 ${this.localName} 传递了类型为 ${typeof emitMethods[key]} 的值`
              } else if (
                !_emit[key].required &&
                typeof _emit[key].default !== 'function'
              ) {
                return `在 ${parentName} 中创建的 ${this.localName} 的 on-${key} 属性为空, 且没有默认值`
              }

              return `${this.localName}(${emitFn}): 未知错误`
            })()
          )

          return void 0 as ReturnType<FuncConstructorToType<E[T]>>
        } else {
          /*@__PURE__*/ console.error(
            (() => {
              const parentName = this.$parentComponent?.localName ?? ''
              if (!emits) {
                return `${this.localName} 未定义任何 emit`
              } else if (!hasOwn(emits, key)) {
                return `${this.localName} 未定义 emit: ${key}`
              } else if (
                emits[key].required &&
                !hasOwn(this.$emitMethods, key)
              ) {
                return `在 ${parentName} 中创建的 ${this.localName} 的 on-${key} 属性为空, 而该值为必传`
              }

              return `${this.localName}(${emitFn}): 未知错误`
            })()
          )
        }
        return void 0 as ReturnType<FuncConstructorToType<E[T]>>
      }

      const exposeData = (methods: Exposed) => {
        for (const key in methods) {
          if (key in this.$exposedData) {
            /*@__PURE__*/ console.warn(
              `${this.localName} 重复暴露 ${key} 属性，旧的值将被覆盖。`
            )
          }
          const _val = methods[key]
          this.$exposedData[key] = _val
        }
      }

      const shareData = (attrs: Shared) => {
        for (const key in attrs) {
          if (key in this.$sharedData) {
            /*@__PURE__*/ console.warn(
              `${this.localName} 重复暴露 ${key} 属性，旧的值将被覆盖。`
            )
          }
          const _val = attrs[key]
          this.$sharedData[key] = _val
        }
      }

      const slotData: Record<string, () => Node[]> = {}

      if (!_shadow && slots) {
        if (Array.isArray(slots)) {
          for (const key of slots) {
            const nodes = this.$slots[key]
            if (nodes) slotData[key] = () => nodes
            else {
              /*@__PURE__*/ console.error(
                `${this.localName}: 未找到插槽 ${key} 的内容。`
              )
            }
          }
        } else {
          for (const key in slots) {
            const nodes = this.$slots[key]
            if (nodes) slotData[key] = () => nodes
            else if (slots[key]) slotData[key] = slots[key]
            else {
              /*@__PURE__*/ console.error(
                `${this.localName}: 未找到插槽 ${key} 的内容。`
              )
            }
          }
        }
      }

      const { end: setupEnd } = startSetupRunning()
      // 获取setup中的数据
      const setupData =
        setup(this.$props, {
          expose: exposeData,
          share: shareData,
          emit: emitFn,
          slot: (_shadow ? void 0 : slotData) as DefineSlot<S, Shadow>
        }) || {}

      setupEnd()

      // Lifecycle: beforeMount 调用时机
      runBeforeMount(this)

      // 创建模板
      if (setupData instanceof Node) {
        shadow.appendChild(setupData)
      } else if (
        isArray(setupData) &&
        setupData.every((ele) => ele instanceof Node)
      ) {
        setupData.forEach((ele) => {
          if (ele instanceof Node) shadow.appendChild(ele)
        })
      }

      // 创建 style 标签
      if (style && _shadow) {
        const styleEle = document.createElement('style')
        if (typeof style === 'string') styleEle.textContent = style
        else if (typeof style === 'function')
          styleEle.textContent = style(this.$props)
        shadow.appendChild(styleEle)
      }

      // 由于规定effect需要在组件创建开始，onMount 运行前就要创建，而目前使用startSetupRunning来限制在setup中运行
      // 所以这里需要先模拟为在setup内

      // TODO: 在移除全部对shadow.querySelectorAll的使用后，即可放开shadow选项
      // 则修改样式绑定的方式

      // WARN: 由于暂时没有多文档支持, 所以暂时不需要考虑多文档的情况
      clearBeforeMount(this)
      // Lifecycle: mounted 调用时机
      runMounted(this)

      connected?.call(this, {
        data: this.$sharedData
      })
      restore()
    }

    disconnectedCallback() {
      const { restore } = setComponentIns(this)
      clearMounted(this)
      disconnected?.call(this, {
        data: this.$sharedData
      })
      restore()
      this.__init__(SYMBOL_INIT)
    }

    adoptedCallback() {
      const { restore } = setComponentIns(this)
      // Lifecycle: 暂时没有多文档支持
      adopted?.call(this, {
        data: this.$sharedData
      })
      restore()
    }

    attributeChangedCallback(name: O, oldValue: string, newValue: string) {
      const { restore } = setComponentIns(this)
      ;(
        this.$props as {
          [key in O]: string
        }
      )[name] = newValue
      attributeChanged?.call(
        this,
        { name, oldValue, newValue },
        {
          data: this.$sharedData
        }
      )
      restore()
    }

    $props = {} as {
      [key in keyof P]: ConstructorToType<P[key]>
    } & Record<O, string>

    $sharedData: Record<string, any> = {}

    $propData: Record<string, any> = {}

    $emitMethods: Record<string, Func> = {}

    $root: ShadowRoot | BaseElement

    $exposedData: Record<string, any> = {}

    $parentComponent: BaseElement | null = null

    $slots: Record<string, Node[]> = {}

    private __init__(symbol: typeof SYMBOL_INIT) {
      if (symbol !== SYMBOL_INIT) {
        /*@__PURE__*/ console.error(
          `${this.localName}: __init__方法只能由xj-web内部调用。`
        )
        return false
      }

      this.$props = {} as {
        [key in keyof P]: ConstructorToType<P[key]>
      } & Record<O, string>
      this.$sharedData = {}

      this.$exposedData = {}

      this.$parentComponent = null

      return true
    }
  }

  customElementNameMap.set(name.toLowerCase(), {
    extends: options?.extends ?? null,
    shadow: _shadow
  })

  customElementRegistry.define(name, Ele, {
    extends: options?.extends ?? undefined
  })

  return (
    props: Partial<
      {
        [key in keyof P]: ConstructorToType<P[key]>
      } & {
        [key in keyof E as `on-${string & key}`]: FuncConstructorToType<E[key]>
      } & Record<O, string> & {
          expose: Ref<Exposed | null>
          ref: Ref<BaseElement | null>
        }
    >,
    events: {
      [key in keyof E]: Func
    },
    children: ChildType[]
  ) => {
    // return name.toLowerCase()
    return createElement(
      name.toLowerCase(),
      props,
      events,
      children
    ) as BaseElement
  }
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
  return '__stopEffects__' in el && '__startEffects__' in el
}

const oldAppendChild = Element.prototype.appendChild

Element.prototype.appendChild = function <T extends Node>(node: T): T {
  const _ret = oldAppendChild.call(this, node)
  if (isXJElement(node)) {
    node.__startEffects__()
  }
  return _ret
}

export const createElement = (
  tag: string,
  props?: { [key: string]: any },
  events?: { [key: string]: Func },
  children?: ChildType[]
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

  const customElementOption = getCustomElementOption(tag)

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

  el.__stopEffects__ = () => {
    if (isStop) return
    isStop = true
    EffectStops.forEach((stop) => stop())
    EffectStops.clear()

    textNodeEffectsStops.forEach((stop) => stop())
    textNodeEffectsStops.clear()

    childNodes.forEach((child) => {
      if (isXJElement(child)) {
        child.__stopEffects__()
      }
    })
  }

  el.__startEffects__ = () => {
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
        child.__startEffects__()
      }
    })
  }

  const elRemove = el.remove.bind(el)

  el.remove = () => {
    el.__stopEffects__()
    elRemove()
  }

  // 事件绑定
  // 自定义组件属性绑定
  // 原生组件静态属性绑定
  // ref和expose属性绑定
  for (const key in props) {
    // 处理属性绑定

    // 对于自定义元素
    if (isCustomEle) {
      // 对于保留属性 TODO: 目前是ref和expose。有修改需求时，需要修改此处
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
      // 对于保留属性 TODO: 目前是ref和expose。有修改需求时，需要修改此处
      // TODO: 在将ref和expose支持函数前，需要先统一两个createElement函数
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

  // 事件绑定
  for (const key in events) {
    const eventName = key
    // 对于自定义元素
    if (isCustomEle) {
      if (component) component.$emitMethods[eventName] = props[key]
    }
    // 对于原生元素
    else {
      el.addEventListener(eventName, props[key])
    }
  }

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

  return el
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
