/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { createElement } from './createElement'

describe('createElement', () => {
  it('创建具有指定标签的元素', () => {
    const tag = 'div'
    const element = createElement(tag)
    expect(element.tagName.toLowerCase()).toBe(tag)
  })

  it('在创建的元素时设置属性', () => {
    const tag = 'div'
    const attributes = { id: 'test-id', class: 'test-class' }
    const element = createElement(tag, attributes)
    expect(element.getAttribute('id')).toBe('test-id')
    expect(element.getAttribute('class')).toBe('test-class')
  })

  it('如果 children 是数组，则附加子元素', () => {
    const tag = 'div'
    const child1 = document.createElement('span')
    const child2 = document.createElement('span')
    const children = [child1, child2]
    const element = createElement(tag, {}, children)
    expect(element.children.length).toBe(2)
    expect(element.children[0]).toBe(child1)
    expect(element.children[1]).toBe(child2)
  })

  it('如果 children 是字符串则应附加文本节点', () => {
    const tag = 'div'
    const text = 'Hello, World!'
    const element = createElement(tag, {}, [text])
    expect(element.textContent).toBe(text)
  })

  it('创建一个没有属性和子元素的元素', () => {
    const tag = 'div'
    const element = createElement(tag)
    expect(element.tagName.toLowerCase()).toBe(tag)
    expect(element.attributes.length).toBe(0)
    expect(element.childNodes.length).toBe(0)
  })
})
