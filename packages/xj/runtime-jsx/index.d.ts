import type { ReservedProps } from '@xj-view/runtime-core'
import type { NativeElements } from './jsx'

/**
 * JSX namespace for usage with @jsxImportsSource directive
 * when ts compilerOptions.jsx is 'react-jsx' or 'react-jsxdev'
 * https://www.typescriptlang.org/tsconfig#jsxImportSource
 */
export {
  createNode as jsx,
  createNode as jsxDEV,
  Fragment,
} from '@xj-view/runtime-core'

export namespace JSX {
  export interface ElementClass {
    $props: object
  }
  export interface ElementAttributesProperty {
    $props: object
  }
  export interface IntrinsicElements extends NativeElements {
    // allow arbitrary elements
    [name: string]: unknown
  }
  export interface IntrinsicAttributes extends ReservedProps {}
}
