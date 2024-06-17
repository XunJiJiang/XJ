// import { createNode } from './node'
import { isElement } from '@xj/shared'

export const createRoot = (container: Element) => {
  if (!isElement(container)) {
    /*#__PURE__*/ console.log(
      `runtime-core -> src -> index.ts -> createRoot -> el: ${container}`,
    )
    throw new Error('Invalid root element')
  }
  const render = (rootComponent: Element): void => {
    container.appendChild(rootComponent)
  }

  return {
    render,
  }
}

export { createNode, h, Fragment } from './node'
export {} from './nodeOps'
export { type ReservedProps } from './prop'
export { expose } from './expose'
export {
  type XJData,
  type XJEventKey,
  type XJEvent,
  type XJPropKey,
  type XJProp,
  type XJChildrenNode,
  type XJSlots,
  type XJComponent,
} from './component'
