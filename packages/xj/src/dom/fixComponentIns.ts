import BaseElement from './BaseElement'

// 当前实例
let currentComponent: BaseElement | null = null

// 修改正在实例化的组件
export const setComponentIns = (instance: BaseElement) => {
  let restoreRun = false
  const old = currentComponent
  currentComponent = instance

  return {
    restore() {
      currentComponent = old
      restoreRun = true
    },
    get old() {
      if (!restoreRun) {
        return old
      }
      /*@__PURE__*/ console.error('setComponentIns: restore has been run')
      return null
    }
  }
}

/** 表现: 当一个函数只能在setup中使用时, 可以通过该函数获取实例 */
export const getCurrentComponent = () => {
  return currentComponent ?? null
}
