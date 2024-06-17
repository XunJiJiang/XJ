import { type XJProp } from './component'

const doc = (typeof document !== 'undefined' ? document : null) as Document

export type ElementNamespace = 'svg' | 'mathml' | undefined

export const svgNS = 'http://www.w3.org/2000/svg'
export const mathmlNS = 'http://www.w3.org/1998/Math/MathML'

export type NodeOps = {
  insert: (child: Node, parent: Node, anchor?: Node | null) => void
  remove: (child: Node) => void
  createElement: (
    tag: string,
    namespace?: ElementNamespace,
    is?: string,
    props?: XJProp,
  ) => Element
  createText: (text: string) => Text
  createComment: (text: string) => Comment
  setText: (node: Text, text: string) => void
  setElementText: (el: Element, text: string) => void
  parentNode: (node: Node) => Node | null
  nextSibling: (node: Node) => Node | null
  querySelector: (selector: string) => Element | null
  setScopeId: (el: Element, id: string) => void
  cloneNode: (node: Node) => Node
}

export const nodeOps: NodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor ?? null)
  },

  remove: child => {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },

  createElement: (tag, namespace, is, props) => {
    const el =
      namespace === 'svg'
        ? doc.createElementNS(svgNS, tag)
        : namespace === 'mathml'
          ? doc.createElementNS(mathmlNS, tag)
          : doc.createElement(tag, is ? { is } : undefined)

    if (tag === 'select' && props && props.multiple != null) {
      ;(el as HTMLSelectElement).setAttribute(
        'multiple',
        String(props.multiple),
      )
    }

    return el
  },

  createText: text => doc.createTextNode(text),

  createComment: text => doc.createComment(text),

  setText: (node, text) => {
    node.nodeValue = text
  },

  setElementText: (el, text) => {
    el.textContent = text
  },

  parentNode: node => node.parentNode,

  nextSibling: node => node.nextSibling,

  querySelector: selector => doc.querySelector(selector),

  setScopeId: (el, id) => {
    el.setAttribute(id, '')
  },

  cloneNode: node => node.cloneNode(true),
}
