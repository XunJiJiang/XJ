import Dependency, { SYMBOL_DEPENDENCY } from './Dependency'

// TODO: 当传入的值是dep实例时，是直接返回还是根据dep实例的值返回一个新的dep实例？
// TODO: 不进行响应式的类
// type NonReactive<T extends object> = T extends Node | Window | Document
//   ? T
//   : T extends Function
//     ? T
//     : T extends Date
//       ? T
//       : T extends RegExp
//         ? T
//         : T extends Map<infer K, infer V>
//           ? Map<NonReactive<K>, NonReactive<V>>
//           : T extends Set<infer U>
//             ? Set<NonReactive<U>>
//             : T extends Promise<infer R>
//               ? Promise<NonReactive<R>>
//               : T extends Array<infer E>
//                 ? Array<NonReactive<E>>
//                 : T extends object
//                   ? { [K in keyof T]: NonReactive<T[K]> }
//                   : T

export type Reactive<T extends object> = {
  [key in keyof T]: T[key] extends object
    ? T[key] extends Node
      ? T[key]
      : Reactive<T[key]>
    : T[key]
} & {
  [SYMBOL_DEPENDENCY]: Dependency<T>
}

export const reactive = <T extends object>(obj: T): Reactive<T> => {
  const dep = new Dependency(obj)

  return dep.value as Reactive<T>
}
