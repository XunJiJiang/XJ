import { createNode, Fragment } from '@xj-fv/runtime-core'

function jsx(type, props, key) {
  const { children } = props
  delete props.children
  if (arguments.length > 2) {
    props.key = key
  }
  return createNode(type, props, children)
}

export { Fragment, jsx, jsx as jsxs, jsx as jsxDEV }
