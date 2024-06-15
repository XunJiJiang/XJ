// import { shared } from '@xj/shared';
import 'reflect-metadata'

type Xj = {
  name: string
  age: number
  sayHello: () => void
}

export const xj: Xj = {
  name: 'xj',
  age: 18,
  sayHello: () => {
    console.log('Hello, I am xj')
  },
}

export default function createXJ(dom: HTMLDivElement) {
  dom.innerHTML = 'XJ hello'
}
