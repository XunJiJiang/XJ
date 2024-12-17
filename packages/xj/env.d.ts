/* eslint-disable @typescript-eslint/no-explicit-any */

// import { Ref } from '@/reactive/ref'

declare const $if: (
  props: {
    value: Ref<any>
  },
  ...children: XJ.Element[]
) => any
declare const $elseif: (
  props: {
    value: any
  },
  ...children: XJ.Element[]
) => any
declare const $else: (
  props: {
    [key: string | number | symbol]: never
  },
  ...children: XJ.Element[]
) => any
declare const $for: (
  props: {
    value: any[]
  },
  ...children: XJ.Element[]
) => any

declare namespace JSX {
  // type Element = string
  interface IntrinsicElements {
    [eleName: string]: any
  }

  // interface IntrinsicAttributes {
  //   [attrName: string]: any
  // }

  // interface ElementAttributesProperty {
  //   $props: {}
  // }

  // interface ElementClass {
  //   $props: {}
  // }

  // interface Element extends XJ.Element<any> {}

  interface ElementChildrenAttribute {
    children: Element[]
  }
}

declare const __jsx: {
  h: (tag: string, props: any, ...children: any[]) => any
  Fragment: (props: { children?: any }) => any
}

type OleElement = Element

declare namespace XJ {
  const STOP_EFFECTS: unique symbol
  const START_EFFECTS: unique symbol
  type STOP_EFFECTS = typeof STOP_EFFECTS
  type START_EFFECTS = typeof START_EFFECTS

  type Element<T extends OleElement = OleElement> = T & {
    [__action in START_EFFECTS | STOP_EFFECTS]: () => void
  }
}
