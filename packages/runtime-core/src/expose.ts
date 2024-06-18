import { extend } from '@xj-fv/shared'

import { type XJData } from './component'

let exposeTemp: XJData[] = []

let statue: 'start' | 'end' = 'start'

export const collectExpose = {
  start: (v: unknown) => {
    console.log('start', v)
    statue = 'start'
  },

  end: (): XJData => {
    console.log('end')
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
