import { utils } from '@xj/utils';
import 'reflect-metadata';

const formatMetadataKey = Symbol('format');
function format(formatString: string) {
  return Reflect.metadata(formatMetadataKey, formatString);
}
function getFormat(target: Greeter, propertyKey: string) {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}

class Greeter {
  @format('Hello, %s')
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    const formatString = getFormat(this, 'greeting');
    return formatString.replace('%s', this.greeting);
  }
}

const greeter = new Greeter('world');

console.log(greeter.greet());

console.log('xj', utils);

type Xj = {
  name: string;
  age: number;
  sayHello: () => void;
};

export const xj: Xj = {
  name: 'xj',
  age: 18,
  sayHello: () => {
    console.log('Hello, I am xj');
  },
};

export default function createXJ(dom: HTMLDivElement) {
  dom.innerHTML = 'XJ hello';
}
