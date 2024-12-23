import { onBeforeMount } from './src/hooks/lifecycle/beforeMount'

import { onMounted } from './src/hooks/lifecycle/mounted'

import { onUnmounted } from './src/hooks/lifecycle/unmounted'

import { ref, isRef, type Ref } from './src/reactive/ref'

import { reactive, type Reactive } from './src/reactive/reactive'

import { isReactive } from './src/reactive/Dependency'

import { effect } from './src/reactive/effect'

import { watch } from './src/reactive/watch'

import {
  type CustomElementConfig,
  defineCustomElement
} from './src/dom/defineElement'

import {
  $if,
  $elseif,
  $else,
  $for,
  type CustomElementComponent,
  type BaseProps,
  type BaseEmits,
  type DefineProps,
  type CustomElementOptions
} from './src/dom/createElement'

import type { BaseElement } from './src/dom/BaseElement'

import { __jsx, h, Fragment } from './src/dom/jsx'

export default {
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  isRef,
  reactive,
  isReactive,
  effect,
  watch,
  defineCustomElement,
  $if,
  $elseif,
  $else,
  $for,
  __jsx,
  h,
  Fragment
}

export type {
  BaseElement,
  CustomElementComponent,
  BaseProps,
  BaseEmits,
  DefineProps,
  CustomElementConfig,
  CustomElementOptions,
  Ref,
  Reactive
}

export {
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  isRef,
  reactive,
  isReactive,
  effect,
  watch,
  defineCustomElement,
  $if,
  $elseif,
  $else,
  $for,
  __jsx,
  h,
  Fragment
}
