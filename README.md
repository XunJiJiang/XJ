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
       └─main.jsx
```

Add the following content to the file.

**package.json**

```json
{
  "name": "example",
  "version": "0.0.1",
  "description": "A example about xj",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "xj": "workspace:^"
  }
}
```

**vite.config.js**

```js
import { defineConfig } from 'vite'

export default defineConfig({
  root: './src/',
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
})
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
    <script type="module" src="./main.jsx"></script>
  </body>
</html>
```

**main.jsx**

```jsx
import { createRoot, expose } from 'xj'

const app = createRoot(document.getElementById('main')).render(
  <h1>hello XJ</h1>,
)
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
