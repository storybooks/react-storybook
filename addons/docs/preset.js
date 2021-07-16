const getFrameworkPresets = (framework) => {
  try {
    return [require.resolve(`./dist/cjs/frameworks/${framework}/preset`)];
  } catch (err) {
    // there is no custom config for the user's framework, do nothing
    return [];
  }
};

module.exports = (storybookOptions, presetOptions) => [
  { name: require.resolve('./common-preset'), options: presetOptions },
  { name: require.resolve('./dist/cjs/frameworks/common/preset'), options: presetOptions },
  ...getFrameworkPresets(storybookOptions.framework),
];
