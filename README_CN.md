# XJ

中文 | [English](./README.md)

## 注意

build指令依赖于[`tsc`](https://www.typescriptlang.org/docs/handbook/compiler-options.html)指令，如果构建失败，请检查是否全局安装`tsc`

## 如何使用示例测试你的代码

创建如下文件结构

```
<your workspace root>
└─example
  ├package.json
  ├vite.config.js
  └─src
    ├─index.html
    └─main.jsx
```

文件内添加如下内容

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
  esbuild: {
    jsxFactory: '__jsx.h',
    jsxFragment: '__jsx.Fragment',
    jsxInject: `import { __jsx } from 'xj'`,
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

在**example**目录下安装包

```shell
pnpm install
```

现在回到根目录，运行测试服务器

```shell
pnpm run dev:example
```

**现在你可以愉快的（或不愉快的）测试你的代码了！**
