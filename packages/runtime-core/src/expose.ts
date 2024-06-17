import { extend } from '@xj/shared'

import { type XJData } from './component'

let exposeTemp: XJData[] = []

let statue: 'start' | 'end' = 'start'

export const collectExpose = {
  start: () => {
    statue = 'start'
  },

  end: (): XJData => {
    statue = 'end'
    const exposeData = exposeTemp
    exposeTemp = []

    return extend({}, ...exposeData)
  },
}

export const expose = (content: XJData) => {
  if (statue === 'start') {
    exposeTemp.push(content)
  }
}
