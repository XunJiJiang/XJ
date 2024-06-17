// import { shared } from '@xj/shared';
import 'reflect-metadata'
import { createNode, Fragment, createRoot, expose, h } from '@xj/runtime-core'

const xj = {
  createNode,
  Fragment,
  createRoot,
  expose,
  h,
}

export const __jsx = {
  h,
  Fragment,
}

export { createNode, Fragment, createRoot, expose, h } from '@xj/runtime-core'

export default xj
