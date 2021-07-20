module.exports = {
  root: true,
  extends: ['@storybook/eslint-config-storybook'],
  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 'warn',
  },
  ignorePatterns: ['.eslintrc', 'package.json'],
  overrides: [
    {
      files: ['**/*.json', '**/*.html'],
      parserOptions: {
        project: null,
        sourceType: 'module',
      },
      rules: {
        // these rules require typechecking, which is obviously not happening on json & html files
        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
        '@typescript-eslint/dot-notation': 'off',
        '@typescript-eslint/no-implied-eval': 'off',
        '@typescript-eslint/no-throw-literal': 'off',
        '@typescript-eslint/return-await': 'off',
        '@typescript-eslint/require-await': 'off',
      },
    },
    {
      files: [
        '**/__tests__/**',
        'scripts/**',
        '**/__testfixtures__/**',
        '**/*.test.*',
        '**/*.stories.*',
        '**/storyshots/**/stories/**',
      ],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['**/__testfixtures__/**'],
      rules: {
        'react/forbid-prop-types': 'off',
        'react/no-unused-prop-types': 'off',
        'react/require-default-props': 'off',
      },
    },
    { files: '**/.storybook/config.js', rules: { 'global-require': 'off' } },
    { files: 'cypress/**', rules: { 'jest/expect-expect': 'off' } },
    {
      files: ['**/*.stories.*'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['**/mithril/**/*'],
      rules: {
        'react/no-unknown-property': 'off', // Need to deactivate otherwise eslint replaces some unknown properties with React ones
      },
    },
    {
      files: ['examples/**', 'app/**'],
      rules: {
        'react-hooks/rules-of-hooks': 'off',
      },
    },
  ],
};
