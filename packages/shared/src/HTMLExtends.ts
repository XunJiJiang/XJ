type HTMLElementConstructor = {
  new (): HTMLElement
  prototype: HTMLElement
}

export type HTMLElementTag =
  //#region HTMLElementTag
  | ''
  | 'a'
  | 'area'
  | 'audio'
  | 'br'
  | 'base'
  | 'body'
  | 'button'
  | 'canvas'
  | 'dl'
  | 'data'
  | 'datalist'
  | 'details'
  | 'dialog'
  | 'div'
  | 'embed'
  | 'fieldset'
  | 'form'
  // collection |
  // formControls |
  // options |
  | 'hr'
  | 'head'
  | 'h'
  | 'html'
  | 'iframe'
  | 'img'
  | 'input'
  | 'li'
  | 'label'
  | 'legend'
  | 'link'
  | 'map'
  | 'media'
  | 'menu'
  | 'meta'
  | 'meter'
  | 'mod'
  | 'ol'
  | 'object'
  | 'optgroup'
  | 'option'
  | 'output'
  | 'p'
  | 'picture'
  | 'pre'
  | 'progress'
  | 'script'
  | 'select'
  | 'slot'
  | 'source'
  | 'span'
  | 'style'
  | 'tableCaption'
  | 'tableCell'
  | 'tableCol'
  | 'table'
  | 'tableRow'
  | 'tableSection'
  | 'template'
  | 'textarea'
  | 'time'
  | 'title'
  | 'track'
  | 'ul'
  | 'unknown'
  | 'video'
//#endregion

export const HTMLExtends = new Map<HTMLElementTag, HTMLElementConstructor>([
  ['', HTMLElement],

  ['a', HTMLAnchorElement],
  ['area', HTMLAreaElement],
  ['audio', HTMLAudioElement],

  ['br', HTMLBRElement],
  ['base', HTMLBaseElement],
  ['body', HTMLBodyElement],
  ['button', HTMLButtonElement],

  ['canvas', HTMLCanvasElement],

  ['dl', HTMLDListElement],
  ['data', HTMLDataElement],
  ['datalist', HTMLDataListElement],
  ['details', HTMLDetailsElement],
  ['dialog', HTMLDialogElement],
  ['div', HTMLDivElement],

  ['embed', HTMLEmbedElement],

  ['fieldset', HTMLFieldSetElement],
  ['form', HTMLFormElement],
  // ['collection', HTMLCollection], // Map
  // ['formControls', HTMLFormControlsCollection], // HTMLElementConstructor
  // ['options', HTMLOptionsCollection], // HTMLElementConstructor

  ['hr', HTMLHRElement],
  ['head', HTMLHeadElement],
  ['h', HTMLHeadingElement],
  ['html', HTMLHtmlElement],

  ['iframe', HTMLIFrameElement],
  ['img', HTMLImageElement],
  ['input', HTMLInputElement],

  ['li', HTMLLIElement],
  ['label', HTMLLabelElement],
  ['legend', HTMLLegendElement],
  ['link', HTMLLinkElement],

  ['map', HTMLMapElement],
  ['media', HTMLMediaElement],
  ['menu', HTMLMenuElement],
  ['meta', HTMLMetaElement],
  ['meter', HTMLMeterElement],
  ['mod', HTMLModElement],

  ['ol', HTMLOListElement],
  ['object', HTMLObjectElement],
  ['optgroup', HTMLOptGroupElement],
  ['option', HTMLOptionElement],
  ['output', HTMLOutputElement],

  ['p', HTMLParagraphElement],
  ['picture', HTMLPictureElement],
  ['pre', HTMLPreElement],
  ['progress', HTMLProgressElement],

  ['script', HTMLScriptElement],
  ['select', HTMLSelectElement],
  ['slot', HTMLSlotElement],
  ['source', HTMLSourceElement],
  ['span', HTMLSpanElement],
  ['style', HTMLStyleElement],

  ['tableCaption', HTMLTableCaptionElement],
  ['tableCell', HTMLTableCellElement],
  ['tableCol', HTMLTableColElement],
  ['table', HTMLTableElement],
  ['tableRow', HTMLTableRowElement],
  ['tableSection', HTMLTableSectionElement],
  ['template', HTMLTemplateElement],
  ['textarea', HTMLTextAreaElement],
  ['time', HTMLTimeElement],
  ['title', HTMLTitleElement],
  ['track', HTMLTrackElement],

  ['ul', HTMLUListElement],
  ['unknown', HTMLUnknownElement],

  ['video', HTMLVideoElement]
])

// HTMLAllCollection
