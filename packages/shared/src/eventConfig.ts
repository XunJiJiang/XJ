import { makeMap } from './makeMap'

const EVENT_TAGS =
  'click,change,input,focus,blur,keydown,keyup,keypress,submit,scroll,resize,' +
  'touchstart,touchmove,touchend,touchcancel,mousedown,mouseup,mousemove,mouseenter,' +
  'mouseleave,mouseover,mouseout,contextmenu,drag,dragstart,dragend,dragenter'

export const isEventTag = /*#__PURE__*/ makeMap(EVENT_TAGS, true)
