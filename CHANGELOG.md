## [0.0.7](https://github.com/XunJiJiang/XJ/compare/v0.0.6...v0.0.7) (2024-12-23)

### Bug Fixes

- dom: 修复 onMounted 内无法获取 dom 的问题

### Features

- xj: 删除 useId
- types: 暴露 interface BaseElement
- types: 添加基础 jsx 类型声明
- types: 暴露 type Reactive 和 type Ref
- shared: 添加 createId 和 createIdGenerator 用于替代 useId
- xj: defineCustomElement 现在返回一个函数, 可以作为这个函数有类似react函数式组件的使用方式, 可以直接作为jsx标签
- xj: 自定义组件实现不严格的类型推导. 为什么是不严格的？当一个属性为必填时, ts类型不会强制要求填写；当以填入不存在的属性时, 也不会禁止；但如果键入存在的属性, 则会进行类型提示
- xj: name不再是必填项. 如果希望使用自定义元素标签来创建自定义元素实例, 可以使用name. 但如果仅使用返回的函数作为标签, 则不需要填写name. 同时, 也不建议使用自定义元素标签名, 应为这样不会有任何类型检查
- xj: 支持 $for 标签用于循环
- build: 不进行代码压缩和混淆
- build: 添加map文件
- build: 区分cjs开发环境和生产环境
- build: 修改文件命名
- build: 输出结果添加版权注释
- git: 添加husky检查

### Performance Improvements

- watch: 添加新值和旧值的对比, 跳过不必要更新
