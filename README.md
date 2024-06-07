# XJ

[中文](./README_CN.md) | English

## Notice

The build directive depends on the [`tsc`](https://www.typescriptlang.org/docs/handbook/compiler-options.html) directive. If the build fails, please check whether `tsc` is installed globally.

## How to test your code with examples

Create the following file structure.

```
<your workspace root>
└─example
    ├package.json
    ├vite.config.js
    └─src
       ├─index.html
       └─main.js
```

Add the following content to the file.

**package.json**

```json
{
  "name": "example",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "xj": "workspace:^"
  }
}
```

**vite.config.js**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  root: './src/',
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
});
```

**index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="example" content="width=device-width, initial-scale=1.0" />
    <title>example</title>
  </head>
  <body>
    <div id="main"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

**main.js**

```js
import XJ from 'xj';

XJ(document.getElementById('main'));
```

Install the package in the **example** directory.

```shell
pnpm install
```

Now go back to the root directory and run the test server.

```shell
pnpm run dev:example
```

**Now you can have fun (or not) testing your code! **
