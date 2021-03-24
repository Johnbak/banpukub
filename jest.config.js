module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    presets: [
      ['@babel/preset-env', {targets: {node: 'current'}}],
      +    '@babel/preset-typescript',
    ],
  },
};