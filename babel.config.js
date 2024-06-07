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
  plugins: ['@babel/plugin-transform-class-properties'],
};
