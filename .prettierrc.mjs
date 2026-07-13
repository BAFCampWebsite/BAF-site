export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 120,
  // tabWidth: 2,
  plugins: ['prettier-plugin-astro'],
  singleAttributePerLine: true,
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
