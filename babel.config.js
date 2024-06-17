export default {
  presets: [
    [
      'env',
      {
        modules: false,
        targets: {
          node: 'current', // 根据当前节点版本进行编译
        },
      },
    ],
  ],
  plugins: [
    '@babel/plugin-transform-class-properties',
    [
      '@babel/plugin-transform-react-jsx',
      {
        pragma: 'Xj.h', // default pragma is React.createElement
        pragmaFrag: 'Xj.Fragment', // default is React.Fragment
        throwIfNamespace: false, // defaults to true
      },
    ],
  ],
}
