type Utils = {
  name: string;
  age: number;
  sayHello: () => void;
};

export const utils: Utils = {
  name: 'utils',
  age: 18,
  sayHello: () => {
    console.log('Hello, I am utils');
  },
};
