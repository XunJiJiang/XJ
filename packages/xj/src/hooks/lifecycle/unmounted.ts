import { onMounted } from './mounted'
import { type LifecycleFn } from './verifySetup'

export const onUnmounted: LifecycleFn = (callback) => {
  onMounted(() => {
    return callback
  })
}
