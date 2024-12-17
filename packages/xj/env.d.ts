/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Reactive } from '@/reactive/reactive'
import type { Ref } from '@/reactive/ref'
import type { ChildType } from '@/dom/createElement'

type OleElement = Element

declare global {
  const __jsx: {
    h: (tag: string, props: any, ...children: any[]) => any
    Fragment: (props: { children?: any }) => any
  }

  type OleElement = Element

  namespace XJ {
    const STOP_EFFECTS: unique symbol
    const START_EFFECTS: unique symbol
    type STOP_EFFECTS = typeof STOP_EFFECTS
    type START_EFFECTS = typeof START_EFFECTS

    type Element<T extends OleElement = OleElement> = T & {
      [__action in START_EFFECTS | STOP_EFFECTS]: () => void
    }
  }

  namespace FunctionLabelComponent {
    const $if: (props: { children: ChildType[]; value: Ref<any> }) => any
    const $elseif: (props: { children: ChildType[]; value: Ref<any> }) => any
    const $else: (props: {
      [key: string | number | symbol]: key extends 'children'
        ? ChildType[]
        : any
    }) => any
    const $for: <T>(props: {
      value: T
      children: (
        item: T extends (infer K)[]
          ? K
          : T extends Reactive<(infer K)[]>
            ? K
            : never,
        index: number,
        setKey: (key: string | number | symbol) => void
      ) => Node | Node[]
    }) => (Node | Node[])[]

    type $if = typeof $if
    type $elseif = typeof $elseif
    type $else = typeof $else
    type $for = typeof $for
  }
}

export type { XJ, __jsx, FunctionLabelComponent }
