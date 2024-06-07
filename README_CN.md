# XJ

中文 | [English](./README.md)

## 如何使用示例测试你的代码

创建如下文件结构

```
<your workspace root>
└─example
		├package.json
		├vite.config.js
		└─src
		   ├─index.html
		   └─main.js
```

文件内添加如下内容

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

在**example**目录下安装包

```shell
pnpm install
```

现在回到根目录，运行测试服务器

```shell
pnpm run dev:example
```

**现在你可以愉快的（或不愉快的）测试你的代码了！**
