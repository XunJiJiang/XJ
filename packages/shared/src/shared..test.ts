/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, vi } from 'vitest'
import {
  isFunction,
  isArray,
  isObject,
  hasOwn,
  isHTMLElement,
  isPromise,
  notNull,
  isNewCall
} from './shared'

describe('shared utility functions', () => {
  test('isFunction 应该对函数返回 true', () => {
    const fn = () => {}
    expect(isFunction(fn)).toBe(true)
  })

  test('isFunction 应该对非函数返回 false', () => {
    expect(isFunction(123)).toBe(false)
    expect(isFunction('string')).toBe(false)
    expect(isFunction({})).toBe(false)
    expect(isFunction([])).toBe(false)
  })

  test('isArray 应该对数组返回 true', () => {
    expect(isArray([])).toBe(true)
    expect(isArray([1, 2, 3])).toBe(true)
  })

  test('isArray 应该对非数组返回 false', () => {
    expect(isArray(123)).toBe(false)
    expect(isArray('string')).toBe(false)
    expect(isArray({})).toBe(false)
    expect(isArray(() => {})).toBe(false)
  })

  test('isArray 应该对对象返回 true', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ a: 1 })).toBe(true)
  })

  test('isArray 应该对非对象返回 false', () => {
    expect(isObject(null)).toBe(false)
    expect(isObject(123)).toBe(false)
    expect(isObject('string')).toBe(false)
    expect(isObject([])).toBe(true)
  })

  test('hasOwn 应该对具有指定 key 属性的对象返回 true', () => {
    const obj = { a: 1 }
    expect(hasOwn(obj, 'a')).toBe(true)
  })

  test('hasOwn 应该对不具有指定 key 属性的对象返回 false', () => {
    const obj = { a: 1 }
    expect(hasOwn(obj, 'b')).toBe(false)
  })

  test('isHTMLElement 应该对 HTMLElements 返回 true', () => {
    const div = document.createElement('div')
    expect(isHTMLElement(div)).toBe(true)
  })

  test('isHTMLElement 应该对非 HTMLElements 返回 false', () => {
    expect(isHTMLElement({})).toBe(false)
    expect(isHTMLElement(null)).toBe(false)
    expect(isHTMLElement('string')).toBe(false)
  })

  test('isPromise 应该对 Promise 返回 true', () => {
    const promise = new Promise(() => {})
    expect(isPromise(promise)).toBe(true)
  })

  test('isPromise 应该对非 Promise 返回 false', () => {
    expect(isPromise({})).toBe(false)
    expect(isPromise(null)).toBe(false)
    expect(isPromise('string')).toBe(false)
  })

  test('isAsyncFunction 应该对异步函数返回 true', () => {
    const asyncFn = async () => {}
    expect(isFunction(asyncFn)).toBe(true)
  })

  test('isAsyncFunction 应该对非异步函数返回 false', () => {
    const fn = () => {}
    expect(isFunction(fn)).toBe(true)
  })

  test('notNull 应该对非 null 或 undefined 返回 true', () => {
    expect(notNull(0)).toBe(true)
    expect(notNull('')).toBe(true)
    expect(notNull({})).toBe(true)
    expect(notNull([])).toBe(true)
    expect(notNull(false)).toBe(true)
    expect(notNull(true)).toBe(true)
    expect(notNull(NaN)).toBe(true)
    expect(notNull(Symbol())).toBe(true)
    expect(notNull(() => {})).toBe(true)
    expect(notNull(null)).toBe(false)
    expect(notNull(undefined)).toBe(false)
  })

  test('isNewCall', () => {
    const callback = vi.fn()
    function Foo() {
      callback(isNewCall(new.target))
    }
    new Foo()
    Foo()
    expect(callback).toHaveBeenNthCalledWith(1, true)
    expect(callback).toHaveBeenNthCalledWith(2, false)
  })
})
