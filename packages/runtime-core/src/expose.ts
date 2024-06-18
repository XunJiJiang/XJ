import { extend } from '@xj-view/shared'

import { type XJData } from './component'

let exposeTemp: XJData[] = []

let statue: 'start' | 'end' = 'start'

export type XJExpose = XJData

export const collectExpose = {
  start: () => {
    statue = 'start'

    return (): XJData => {
      statue = 'end'
      const exposeData = exposeTemp
      exposeTemp = []

      return extend({}, ...exposeData)
    }
  },
}

export const expose = (content: XJData) => {
  if (statue === 'start') {
    exposeTemp.push(content)
  }
}
