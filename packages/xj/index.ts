import { onBeforeMount } from './src/hooks/lifecycle/beforeMount'

import { onMounted } from './src/hooks/lifecycle/mounted'

import { onUnmounted } from './src/hooks/lifecycle/unmounted'

import { ref, isRef } from './src/reactive/ref'

import { reactive } from './src/reactive/reactive'

import { isReactive } from './src/reactive/Dependency'

import { effect } from './src/reactive/effect'

import { watch } from './src/reactive/watch'

import { defineCustomElement } from './src/dom/defineElement'

import { default as useId } from './src/hooks/useId'

import { createElement } from './src/dom/createElement'

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
  useId,
  createElement,
  __jsx,
  h,
  Fragment
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
  useId,
  createElement,
  __jsx,
  h,
  Fragment
}
