import { extend, getUniqueKey } from '@xj-fv/shared'

import { type XJData } from './component'

const exposeTempMap = new Map<string, XJData[]>()

const keyArr: string[] = []

export type CollectExposeEnd = () => XJData

export const collectExpose = {
  start: (v: unknown) => {
    const key = getUniqueKey('collectExposeEnd:#{key}:')
    console.log('start', v)
    keyArr.push(key)

    return (): XJData => {
      console.log('end')
      keyArr.pop()
      const exposeData = exposeTempMap.get(key) || []
      exposeTempMap.delete(key)

      return extend({}, ...exposeData)
    }
  },
}

export const expose = (content: XJData) => {
  const key = keyArr[keyArr.length - 1]
  const exposeData = exposeTempMap.get(key) || []
  exposeTempMap.set(key, [...exposeData, content])
}
