import dedent from 'ts-dedent';
import { join } from 'path';
import { logger } from '@storybook/node-logger';
import resolveFrom from 'resolve-from';
import {
  CLIOptions,
  LoadedPreset,
  LoadOptions,
  PresetConfig,
  Presets,
  BuilderOptions,
} from './types';
import { loadCustomPresets } from './utils/load-custom-presets';

const isObject = (val: unknown): val is Record<string, any> =>
  val != null && typeof val === 'object' && Array.isArray(val) === false;
// eslint-disable-next-line @typescript-eslint/ban-types
const isFunction = (val: unknown): val is Function => typeof val === 'function';

export function filterPresetsConfig(presetsConfig: PresetConfig[]): PresetConfig[] {
  return presetsConfig.filter((preset) => {
    const presetName = typeof preset === 'string' ? preset : preset.name;
    return !/@storybook[\\\\/]preset-typescript/.test(presetName);
  });
}

function resolvePresetFunction<T = any>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  input: T[] | Function,
  presetOptions: any,
  storybookOptions: InterPresetOptions
): T[] {
  if (isFunction(input)) {
    return input({ ...storybookOptions, ...presetOptions });
  }
  if (Array.isArray(input)) {
    return input;
  }

  return [];
}

/**
 * Parse an addon into either a managerEntries or a preset. Throw on invalid input.
 *
 * Valid inputs:
 * - '@storybook/addon-actions/register'
 *   =>  { type: 'managerEntries', item }
 *
 * - '@storybook/addon-docs/preset'
 *   =>  { type: 'presets', item }
 *
 * - '@storybook/addon-docs'
 *   =>  { type: 'presets', item: '@storybook/addon-docs/preset' }
 *
 * - { name: '@storybook/addon-docs(/preset)?', options: { ... } }
 *   =>  { type: 'presets', item: { name: '@storybook/addon-docs/preset', options } }
 */
export const resolveAddonName = (configDir: string, name: string) => {
  let path;

  if (name.startsWith('.')) {
    path = resolveFrom(configDir, name);
  } else if (name.startsWith('/')) {
    path = name;
  } else if (name.match(/\/(preset|register(-panel)?)(\.(js|ts|tsx|jsx))?$/)) {
    path = name;
  }

  // when user provides full path, we don't need to do anything
  if (path) {
    return {
      name: path,
      // Accept `register`, `register.js`, `require.resolve('foo/register'), `register-panel`
      type: path.match(/register(-panel)?(\.(js|ts|tsx|jsx))?$/) ? 'managerEntries' : 'presets',
    };
  }

  try {
    return {
      name: resolveFrom(configDir, join(name, 'preset')),
      type: 'presets',
    };
    // eslint-disable-next-line no-empty
  } catch (err) {}

  try {
    return {
      name: resolveFrom(configDir, join(name, 'register')),
      type: 'managerEntries',
    };
    // eslint-disable-next-line no-empty
  } catch (err) {}

  return {
    name: resolveFrom(configDir, name),
    type: 'presets',
  };
};

const map = ({ configDir }: InterPresetOptions) => (item: any) => {
  try {
    if (isObject(item)) {
      const { name } = resolveAddonName(configDir, item.name);
      return { ...item, name };
    }
    const { name, type } = resolveAddonName(configDir, item);
    if (type === 'managerEntries') {
      return {
        name: `${name}_additionalManagerEntries`,
        type,
        managerEntries: [name],
      };
    }
    return resolveAddonName(configDir, name);
  } catch (err) {
    logger.error(
      `Addon value should end in /register OR it should be a valid preset https://storybook.js.org/docs/react/addons/writing-presets/\n${item}`
    );
  }
  return undefined;
};

function interopRequireDefault(filePath: string) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const result = require(filePath);

  const isES6DefaultExported =
    typeof result === 'object' && result !== null && typeof result.default !== 'undefined';

  return isES6DefaultExported ? result.default : result;
}

function getContent(input: any) {
  if (input.type === 'managerEntries') {
    const { type, name, ...rest } = input;
    return rest;
  }
  const name = input.name ? input.name : input;

  return interopRequireDefault(name);
}

export function loadPreset(
  input: PresetConfig,
  level: number,
  storybookOptions: InterPresetOptions
): LoadedPreset[] {
  try {
    // @ts-ignores
    const name: string = input.name ? input.name : input;
    // @ts-ignore
    const presetOptions = input.options ? input.options : {};

    let contents = getContent(input);

    if (typeof contents === 'function') {
      // allow the export of a preset to be a function, that gets storybookOptions
      contents = contents(storybookOptions, presetOptions);
    }

    if (Array.isArray(contents)) {
      const subPresets = contents;
      return loadPresets(subPresets, level + 1, storybookOptions);
    }

    if (isObject(contents)) {
      const { addons: addonsInput, presets: presetsInput, ...rest } = contents;

      const subPresets = resolvePresetFunction(presetsInput, presetOptions, storybookOptions);
      const subAddons = resolvePresetFunction(addonsInput, presetOptions, storybookOptions);

      return [
        ...loadPresets([...subPresets], level + 1, storybookOptions),
        ...loadPresets(
          [...subAddons.map(map(storybookOptions))].filter(Boolean),
          level + 1,
          storybookOptions
        ),
        {
          name,
          preset: rest,
          options: presetOptions,
        },
      ];
    }

    throw new Error(dedent`
      ${input} is not a valid preset
    `);
  } catch (e) {
    const warning =
      level > 0
        ? `  Failed to load preset: ${JSON.stringify(input)} on level ${level}`
        : `  Failed to load preset: ${JSON.stringify(input)}`;

    logger.warn(warning);
    logger.error(e);

    return [];
  }
}

function loadPresets(
  presets: PresetConfig[],
  level: number,
  storybookOptions: InterPresetOptions
): LoadedPreset[] {
  if (!presets || !Array.isArray(presets) || !presets.length) {
    return [];
  }

  if (!level) {
    logger.info('=> Loading presets');
  }

  return presets.reduce((acc, preset) => {
    const loaded = loadPreset(preset, level, storybookOptions);
    return acc.concat(loaded);
  }, []);
}

function applyPresets(
  presets: LoadedPreset[],
  extension: string,
  config: any,
  args: any,
  storybookOptions: InterPresetOptions
): Promise<any> {
  const presetResult = new Promise((resolve) => resolve(config));

  if (!presets.length) {
    return presetResult;
  }

  return presets.reduce((accumulationPromise: Promise<unknown>, { preset, options }) => {
    const change = preset[extension];

    if (!change) {
      return accumulationPromise;
    }

    if (typeof change === 'function') {
      const extensionFn = change;
      const context = {
        preset,
        combinedOptions: {
          ...storybookOptions,
          ...args,
          ...options,
          presetsList: presets,
          presets: {
            apply: async (ext: string, c: any, a = {}) =>
              applyPresets(presets, ext, c, a, storybookOptions),
          },
        },
      };

      return accumulationPromise.then((newConfig) =>
        extensionFn.call(context.preset, newConfig, context.combinedOptions)
      );
    }

    return accumulationPromise.then((newConfig) => {
      if (Array.isArray(newConfig) && Array.isArray(change)) {
        return [...newConfig, ...change];
      }
      if (isObject(newConfig) && isObject(change)) {
        return { ...newConfig, ...change };
      }
      return change;
    });
  }, presetResult);
}

type InterPresetOptions = Omit<CLIOptions & LoadOptions & BuilderOptions, 'frameworkPresets'>;

export function getPresets(presets: PresetConfig[], storybookOptions: InterPresetOptions): Presets {
  const loadedPresets: LoadedPreset[] = loadPresets(presets, 0, storybookOptions);

  return {
    apply: async (extension: string, config: any, args = {}) =>
      applyPresets(loadedPresets, extension, config, args, storybookOptions),
  };
}

export function loadAllPresets(
  options: CLIOptions &
    LoadOptions &
    BuilderOptions & {
      corePresets: string[];
      overridePresets: string[];
      frameworkPresets: string[];
    }
) {
  const { corePresets = [], frameworkPresets = [], overridePresets = [], ...restOptions } = options;

  const presetsConfig: PresetConfig[] = [
    ...corePresets,
    ...frameworkPresets,
    ...loadCustomPresets(options),
    ...overridePresets,
  ];

  // Remove `@storybook/preset-typescript` and add a warning if in use.
  const filteredPresetConfig = filterPresetsConfig(presetsConfig);
  if (filteredPresetConfig.length < presetsConfig.length) {
    logger.warn(
      'Storybook now supports TypeScript natively. You can safely remove `@storybook/preset-typescript`.'
    );
  }

  return getPresets(filteredPresetConfig, restOptions);
}
