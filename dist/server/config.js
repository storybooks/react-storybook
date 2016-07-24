'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = function (configType, baseConfig, configDir) {
  var config = baseConfig;

  // Search for a .babelrc in the config directory, then the module root
  // directory. If found, use that to extend webpack configurations.

  var _findBabelConfig$sync = _findBabelConfig2.default.sync(configDir, 0);

  var babelConfig = _findBabelConfig$sync.config;

  var inConfigDir = true;

  if (!babelConfig) {
    var _findBabelConfig$sync2 = _findBabelConfig2.default.sync('./', 0);

    var babelConfigRoot = _findBabelConfig$sync2.config;

    babelConfig = babelConfigRoot;
    inConfigDir = false;
  }

  if (babelConfig) {
    babelConfig = removeIncompatiblePresets(babelConfig);
    // If the custom config uses babel's `extends` clause, then replace it with
    // an absolute path. `extends` will not work unless we do this.
    if (babelConfig.extends) {
      babelConfig.extends = inConfigDir ? _path2.default.resolve(configDir, babelConfig.extends) : _path2.default.resolve(babelConfig.extends);
    }
    config.module.loaders[0].query = babelConfig;
  }

  // Check whether a config.js file exists inside the storybook
  // config directory and throw an error if it's not.
  var storybookConfigPath = _path2.default.resolve(configDir, 'config.js');
  if (!_fs2.default.existsSync(storybookConfigPath)) {
    var err = new Error('=> Create a storybook config file in "' + configDir + '/config.js".');
    throw err;
  }
  config.entry.preview.push(require.resolve(storybookConfigPath));

  // Check whether addons.js file exists inside the storybook.
  // Load the default addons.js file if it's missing.
  var storybookDefaultAddonsPath = _path2.default.resolve(__dirname, 'addons.js');
  var storybookCustomAddonsPath = _path2.default.resolve(configDir, 'addons.js');
  if (_fs2.default.existsSync(storybookCustomAddonsPath)) {
    logger.info('=> Loading custom addons config.');
    config.entry.preview.unshift(storybookCustomAddonsPath);
    config.entry.manager.unshift(storybookCustomAddonsPath);
  } else {
    config.entry.preview.unshift(storybookDefaultAddonsPath);
    config.entry.manager.unshift(storybookDefaultAddonsPath);
  }

  // Check whether user has a custom webpack config file and
  // return the (extended) base configuration if it's not available.
  var customConfigPath = _path2.default.resolve(configDir, 'webpack.config.js');
  if (!_fs2.default.existsSync(customConfigPath)) {
    logger.info('=> Using default webpack setup based on "Create React App".');
    customConfigPath = _path2.default.resolve(__dirname, './config/defaults/webpack.config.js');
  }

  var customConfig = require(customConfigPath);

  if (typeof customConfig === 'function') {
    logger.info('=> Loading custom webpack config (full-control mode).');
    return customConfig(config, configType);
  }

  logger.info('=> Loading custom webpack config.');

  customConfig.module = customConfig.module || {};

  return (0, _extends3.default)({}, customConfig, config, {
    // We need to use our and custom plugins.
    plugins: [].concat((0, _toConsumableArray3.default)(config.plugins), (0, _toConsumableArray3.default)(customConfig.plugins || [])),
    module: (0, _extends3.default)({}, config.module, customConfig.module, {
      loaders: [].concat((0, _toConsumableArray3.default)(config.module.loaders), (0, _toConsumableArray3.default)(customConfig.module.loaders || []))
    })
  });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _findBabelConfig = require('find-babel-config');

var _findBabelConfig2 = _interopRequireDefault(_findBabelConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// avoid ESLint errors
var logger = console;

function removeReactHmre(presets) {
  var index = presets.indexOf('react-hmre');
  if (index > -1) {
    presets.splice(index, 1);
  }
}

// Remove incomaptible babel presets
function removeIncompatiblePresets(config) {
  // Remove react-hmre preset.
  // It causes issues with react-storybook.
  // We don't really need it.
  // Earlier, we fix this by runnign storybook in the production mode.
  // But, that hide some useful debug messages.
  if (config.presets) {
    removeReactHmre(config.presets);
  }

  if (config.env && config.env.development && config.env.development.presets) {
    removeReactHmre(config.env.development.presets);
  }

  return config;
}

// `baseConfig` is a webpack configuration bundled with storybook.
// React Storybook will look in the `configDir` directory
// (inside working directory) if a config path is not provided.