/* eslint-disable import/extensions */
const base = require('./jest.config.js');

module.exports = {
  ...base,
  testPathIgnorePatterns: ['/node_modules/', '/storybook-static/', 'angularshots.test.js', 'dist'],
};
