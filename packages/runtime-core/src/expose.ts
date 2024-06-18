import { extend, getUniqueKey } from '@xj-fv/shared'

import { type XJData } from './component'

const exposeTempMap = new Map<string, XJData[]>()

const keyArr: string[] = []

export type CollectExposeEnd = () => XJData

export const collectExpose = () => {
  const key = getUniqueKey('collectExposeEnd:#{key}:')
  keyArr.push(key)

  return (): XJData => {
    keyArr.pop()
    const exposeData = exposeTempMap.get(key) || []
    exposeTempMap.delete(key)

    return extend({}, ...exposeData)
  }
}

export const expose = (content: XJData) => {
  const key = keyArr[keyArr.length - 1]
  const exposeData = exposeTempMap.get(key) || []
  exposeTempMap.set(key, [...exposeData, content])
}
