declare const __jsx: {
  h: (tag: string, props: any, ...children: any[]) => any
  Fragment: (props: { children?: any }) => any
}

type OleElement = Element

declare namespace XJ {
  type Element<T extends OleElement> = T & {
    __stopEffects__: () => void
    __startEffects__: () => void
  }
}
