module.exports = {
  stories: [{ directory: '../stories/', files: '**/*.stories.@(json|yaml|yml)' }],
  logLevel: 'debug',
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-actions',
    '@storybook/addon-backgrounds',
    '@storybook/addon-links',
    '@storybook/addon-controls',
  ],
  features: {
    previewCsfV3: true,
  },
};
