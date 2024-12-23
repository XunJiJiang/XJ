/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Func } from '@xj-fv/shared'

export type EventHandlers =
  // #region Description
  | 'beforeinstallprompt'
  | 'beforexrselect'
  | 'abort'
  | 'beforeinput'
  | 'beforematch'
  | 'beforetoggle'
  | 'blur'
  | 'cancel'
  | 'canplay'
  | 'canplaythrough'
  | 'change'
  | 'click'
  | 'close'
  | 'contentvisibilityautostatechange'
  | 'contextlost'
  | 'contextmenu'
  | 'contextrestored'
  | 'cuechange'
  | 'dblclick'
  | 'drag'
  | 'dragend'
  | 'dragenter'
  | 'dragleave'
  | 'dragover'
  | 'dragstart'
  | 'drop'
  | 'durationchange'
  | 'emptied'
  | 'ended'
  | 'error'
  | 'focus'
  | 'formdata'
  | 'input'
  | 'invalid'
  | 'keydown'
  | 'keypress'
  | 'keyup'
  | 'load'
  | 'loadeddata'
  | 'loadedmetadata'
  | 'loadstart'
  | 'mousedown'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'mouseout'
  | 'mouseover'
  | 'mouseup'
  | 'mousewheel'
  | 'pause'
  | 'play'
  | 'playing'
  | 'progress'
  | 'ratechange'
  | 'reset'
  | 'resize'
  | 'scroll'
  | 'securitypolicyviolation'
  | 'seeked'
  | 'seeking'
  | 'select'
  | 'slotchange'
  | 'stalled'
  | 'submit'
  | 'suspend'
  | 'timeupdate'
  | 'toggle'
  | 'volumechange'
  | 'waiting'
  | 'webkitanimationend'
  | 'webkitanimationiteration'
  | 'webkitanimationstart'
  | 'webkittransitionend'
  | 'wheel'
  | 'auxclick'
  | 'gotpointercapture'
  | 'lostpointercapture'
  | 'pointerdown'
  | 'pointermove'
  | 'pointerrawupdate'
  | 'pointerup'
  | 'pointercancel'
  | 'pointerover'
  | 'pointerout'
  | 'pointerenter'
  | 'pointerleave'
  | 'selectstart'
  | 'selectionchange'
  | 'animationend'
  | 'animationiteration'
  | 'animationstart'
  | 'transitionrun'
  | 'transitionstart'
  | 'transitionend'
  | 'transitioncancel'
  | 'afterprint'
  | 'beforeprint'
  | 'beforeunload'
  | 'hashchange'
  | 'languagechange'
  | 'message'
  | 'messageerror'
  | 'offline'
  | 'online'
  | 'pagehide'
  | 'pageshow'
  | 'popstate'
  | 'rejectionhandled'
  | 'storage'
  | 'unhandledrejection'
  | 'unload'
  | 'devicemotion'
  | 'deviceorientation'
  | 'deviceorientationabsolute'
  | 'pageswap'
  | 'pagereveal'
  | 'scrollend'
// #endregion

export const events = [
  'search',
  'appinstalled',
  'beforeinstallprompt',
  'beforexrselect',
  'abort',
  'beforeinput',
  'beforematch',
  'beforetoggle',
  'blur',
  'cancel',
  'canplay',
  'canplaythrough',
  'change',
  'click',
  'close',
  'contentvisibilityautostatechange',
  'contextlost',
  'contextmenu',
  'contextrestored',
  'cuechange',
  'dblclick',
  'drag',
  'dragend',
  'dragenter',
  'dragleave',
  'dragover',
  'dragstart',
  'drop',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'focus',
  'formdata',
  'input',
  'invalid',
  'keydown',
  'keypress',
  'keyup',
  'load',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'mousedown',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'mousewheel',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'reset',
  'resize',
  'scroll',
  'securitypolicyviolation',
  'seeked',
  'seeking',
  'select',
  'slotchange',
  'stalled',
  'submit',
  'suspend',
  'timeupdate',
  'toggle',
  'volumechange',
  'waiting',
  'webkitanimationend',
  'webkitanimationiteration',
  'webkitanimationstart',
  'webkittransitionend',
  'wheel',
  'auxclick',
  'gotpointercapture',
  'lostpointercapture',
  'pointerdown',
  'pointermove',
  'pointerrawupdate',
  'pointerup',
  'pointercancel',
  'pointerover',
  'pointerout',
  'pointerenter',
  'pointerleave',
  'selectstart',
  'selectionchange',
  'animationend',
  'animationiteration',
  'animationstart',
  'transitionrun',
  'transitionstart',
  'transitionend',
  'transitioncancel',
  'afterprint',
  'beforeprint',
  'beforeunload',
  'hashchange',
  'languagechange',
  'message',
  'messageerror',
  'offline',
  'online',
  'pagehide',
  'pageshow',
  'popstate',
  'rejectionhandled',
  'storage',
  'unhandledrejection',
  'unload',
  'devicemotion',
  'deviceorientation',
  'deviceorientationabsolute',
  'pageswap',
  'pagereveal',
  'scrollend'
] as EventHandlers[]

/** 放置外部调用clearRef的标识 */
export const SYMBOL_INIT = Symbol('clearRef')

export type EventListeners = {
  listener: EventListener
  handles: EventListener[]
}

export default interface BaseElement<T extends object = object>
  extends HTMLElement {
  get obAttr(): string[]

  /** 整合observedAttributes和从父组件获取的数据 */
  $props: T

  /** 当前组件给原生生命周期事件共享的数据 */
  $sharedData: Record<string, any>

  /** 当使用createElement创建dom时，将参数中的属性赋予此处 */
  $propData: Record<string, any>

  /** 当使用createElement创建dom时，将参数中的事件赋予此处 */
  $emitMethods: Record<string, Func>

  /** 影子 DOM 根 */
  $root: ShadowRoot | BaseElement
  /** 当前组件暴露给父组件的属性 */
  $exposedData: Record<string, any>

  /** 父组件 */
  $parentComponent: BaseElement | null

  /** 子组件slot(仅未开启shadowRoot时可用) */
  $slots: Record<string, Node[]>
}
