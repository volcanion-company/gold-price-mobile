module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/hooks': './src/hooks',
            '@/services': './src/services',
            '@/stores': './src/stores',
            '@/types': './src/types',
            '@/utils': './src/utils',
            '@/i18n': './src/i18n',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
