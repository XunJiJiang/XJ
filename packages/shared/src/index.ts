type Shared = {
  name: string;
  age: number;
  sayHello: () => void;
};

export const shared: Shared = {
  name: 'shared',
  age: 18,
  sayHello: () => {
    console.log('Hello, I am shared');
  },
};
