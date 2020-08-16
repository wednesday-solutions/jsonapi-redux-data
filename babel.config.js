module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false
      }
    ]
  ],
  plugins: ['@babel/plugin-syntax-dynamic-import'],
  env: {
    production: {
      only: ['app'],
      plugins: ['@babel/plugin-transform-react-inline-elements', '@babel/plugin-transform-react-constant-elements']
    },
    test: {
      plugins: ['@babel/plugin-transform-modules-commonjs', 'dynamic-import-node']
    }
  }
};
