/* eslint-disable @typescript-eslint/no-explicit-any */

import type { XJ, FunctionLabelComponent } from './env'

declare global {
  const $if: FunctionLabelComponent.$if
  const $elseif: FunctionLabelComponent.$elseif
  const $else: FunctionLabelComponent.$else
  const $for: FunctionLabelComponent.$for

  namespace JSX {
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
      children: XJ.Element[]
    }
  }
}
