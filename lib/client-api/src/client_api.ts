/* eslint-disable @typescript-eslint/naming-convention */
/* eslint no-underscore-dangle: 0 */
import deprecate from 'util-deprecate';
import dedent from 'ts-dedent';
import { logger } from '@storybook/client-logger';
import { StoryFn, Parameters, LoaderFunction, DecorateStoryFunction } from '@storybook/addons';
import { toId } from '@storybook/csf';

import {
  ClientApiParams,
  DecoratorFunction,
  ClientApiAddons,
  StoryApi,
  ArgsEnhancer,
  ArgTypesEnhancer,
} from './types';
import { applyHooks } from './hooks';
import { StoryStore } from './story_store';
import { defaultDecorateStory } from './decorators';

// ClientApi (and StoreStore) are really singletons. However they are not created until the
// relevant framework instanciates them via `start.js`. The good news is this happens right away.
let singleton: ClientApi;

const addDecoratorDeprecationWarning = deprecate(
  () => {},
  `\`addDecorator\` is deprecated, and will be removed in Storybook 7.0.
Instead, use \`export const decorators = [];\` in your \`preview.js\`.
Read more at https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-addparameters-and-adddecorator).`
);
export const addDecorator = (decorator: DecoratorFunction, deprecationWarning = true) => {
  if (!singleton)
    throw new Error(`Singleton client API not yet initialized, cannot call addDecorator`);

  if (deprecationWarning) addDecoratorDeprecationWarning();

  singleton.addDecorator(decorator);
};

const addParametersDeprecationWarning = deprecate(
  () => {},
  `\`addParameters\` is deprecated, and will be removed in Storybook 7.0.
Instead, use \`export const parameters = {};\` in your \`preview.js\`.
Read more at https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-addparameters-and-adddecorator).`
);
export const addParameters = (parameters: Parameters, deprecationWarning = true) => {
  if (!singleton)
    throw new Error(`Singleton client API not yet initialized, cannot call addParameters`);

  if (deprecationWarning) addParametersDeprecationWarning();

  singleton.addParameters(parameters);
};

const addLoaderDeprecationWarning = deprecate(
  () => {},
  `\`addLoader\` is deprecated, and will be removed in Storybook 7.0.
Instead, use \`export const loaders = [];\` in your \`preview.js\`.
Read more at https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-addparameters-and-adddecorator).`
);
export const addLoader = (loader: LoaderFunction, deprecationWarning = true) => {
  if (!singleton)
    throw new Error(`Singleton client API not yet initialized, cannot call addParameters`);

  if (deprecationWarning) addLoaderDeprecationWarning();

  singleton.addLoader(loader);
};

export const addArgsEnhancer = (enhancer: ArgsEnhancer) => {
  if (!singleton)
    throw new Error(`Singleton client API not yet initialized, cannot call addArgsEnhancer`);

  singleton.addArgsEnhancer(enhancer);
};

export const addArgTypesEnhancer = (enhancer: ArgTypesEnhancer) => {
  if (!singleton)
    throw new Error(`Singleton client API not yet initialized, cannot call addArgTypesEnhancer`);

  singleton.addArgTypesEnhancer(enhancer);
};

export const getGlobalRender = () => {
  if (!singleton)
    throw new Error(`Singleton client API not yet initialized, cannot call getGlobalRender`);

  return singleton.globalRender;
};

export const setGlobalRender = (render: StoryFn) => {
  if (!singleton)
    throw new Error(`Singleton client API not yet initialized, cannot call setGobalRender`);
  singleton.globalRender = render;
};

const invalidStoryTypes = new Set(['string', 'number', 'boolean', 'symbol']);
export default class ClientApi {
  private _storyStore: StoryStore;

  private _addons: ClientApiAddons<unknown>;

  private _decorateStory: DecorateStoryFunction;

  private _globalRender: StoryFn<any>;

  // React Native Fast refresh doesn't allow multiple dispose calls
  private _noStoryModuleAddMethodHotDispose: boolean;

  constructor({
    storyStore,
    decorateStory = defaultDecorateStory,
    noStoryModuleAddMethodHotDispose,
  }: ClientApiParams) {
    this._storyStore = storyStore;
    this._addons = {};

    this._noStoryModuleAddMethodHotDispose = noStoryModuleAddMethodHotDispose || false;

    this._decorateStory = decorateStory;

    if (!storyStore) throw new Error('storyStore is required');

    singleton = this;
  }

  setAddon = deprecate(
    (addon: any) => {
      this._addons = {
        ...this._addons,
        ...addon,
      };
    },
    dedent`
      \`setAddon\` is deprecated and will be removed in Storybook 7.0.

      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-setaddon
    `
  );

  addDecorator = (decorator: DecoratorFunction) => {
    this._storyStore.addGlobalMetadata({ decorators: [decorator] });
  };

  clearDecorators = deprecate(
    () => {
      this._storyStore.clearGlobalDecorators();
    },
    dedent`
      \`clearDecorators\` is deprecated and will be removed in Storybook 7.0.

      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-cleardecorators
    `
  );

  addParameters = (parameters: Parameters) => {
    this._storyStore.addGlobalMetadata({ parameters });
  };

  addLoader = (loader: LoaderFunction) => {
    this._storyStore.addGlobalMetadata({ loaders: [loader] });
  };

  addArgsEnhancer = (enhancer: ArgsEnhancer) => {
    this._storyStore.addArgsEnhancer(enhancer);
  };

  addArgTypesEnhancer = (enhancer: ArgTypesEnhancer) => {
    this._storyStore.addArgTypesEnhancer(enhancer);
  };

  get globalRender(): StoryFn {
    return this._globalRender;
  }

  set globalRender(render: StoryFn) {
    this._globalRender = render;
  }

  // what are the occasions that "m" is a boolean vs an obj
  storiesOf = <StoryFnReturnType = unknown>(
    kind: string,
    m: NodeModule
  ): StoryApi<StoryFnReturnType> => {
    if (!kind && typeof kind !== 'string') {
      throw new Error('Invalid or missing kind provided for stories, should be a string');
    }

    if (!m) {
      logger.warn(
        `Missing 'module' parameter for story with a kind of '${kind}'. It will break your HMR`
      );
    }

    if (m) {
      const proto = Object.getPrototypeOf(m);
      if (proto.exports && proto.exports.default) {
        // FIXME: throw an error in SB6.0
        logger.error(
          `Illegal mix of CSF default export and storiesOf calls in a single file: ${proto.i}`
        );
      }
    }

    if (m && m.hot && m.hot.dispose) {
      m.hot.dispose(() => {
        const { _storyStore } = this;
        // If HMR dispose happens in a story file, we know that HMR will pass up to the configuration file (preview.js)
        // and be handled by the HMR.allow in config_api, leading to a re-run of configuration.
        // So configuration is about to happen--we can skip the safety check.
        _storyStore.removeStoryKind(kind, { allowUnsafe: true });
      });
    }

    let hasAdded = false;
    const api: StoryApi<StoryFnReturnType> = {
      kind: kind.toString(),
      add: () => api,
      addDecorator: () => api,
      addLoader: () => api,
      addParameters: () => api,
    };

    // apply addons
    Object.keys(this._addons).forEach((name) => {
      const addon = this._addons[name];
      api[name] = (...args: any[]) => {
        addon.apply(api, args);
        return api;
      };
    });

    api.add = (
      storyName: string,
      storyFn: StoryFn<StoryFnReturnType>,
      parameters: Parameters = {}
    ) => {
      hasAdded = true;

      const id = parameters.__id || toId(kind, storyName);

      if (typeof storyName !== 'string') {
        throw new Error(`Invalid or missing storyName provided for a "${kind}" story.`);
      }

      if (!storyFn || Array.isArray(storyFn) || invalidStoryTypes.has(typeof storyFn)) {
        throw new Error(
          `Cannot load story "${storyName}" in "${kind}" due to invalid format. Storybook expected a function/object but received ${typeof storyFn} instead.`
        );
      }

      if (!this._noStoryModuleAddMethodHotDispose && m && m.hot && m.hot.dispose) {
        m.hot.dispose(() => {
          const { _storyStore } = this;
          // See note about allowUnsafe above
          _storyStore.remove(id, { allowUnsafe: true });
        });
      }

      const fileName = m && m.id ? `${m.id}` : undefined;

      const { decorators, loaders, ...storyParameters } = parameters;
      this._storyStore.addStory(
        {
          id,
          kind,
          name: storyName,
          storyFn,
          parameters: { fileName, ...storyParameters },
          decorators,
          loaders,
        },
        {
          applyDecorators: applyHooks(this._decorateStory),
        }
      );
      return api;
    };

    api.addDecorator = (decorator: DecoratorFunction<StoryFnReturnType>) => {
      if (hasAdded)
        throw new Error(`You cannot add a decorator after the first story for a kind.
Read more here: https://github.com/storybookjs/storybook/blob/master/MIGRATION.md#can-no-longer-add-decoratorsparameters-after-stories`);

      this._storyStore.addKindMetadata(kind, { decorators: [decorator] });
      return api;
    };

    api.addLoader = (loader: LoaderFunction) => {
      if (hasAdded) throw new Error(`You cannot add a loader after the first story for a kind.`);

      this._storyStore.addKindMetadata(kind, { loaders: [loader] });
      return api;
    };

    api.addParameters = (parameters: Parameters) => {
      if (hasAdded)
        throw new Error(`You cannot add parameters after the first story for a kind.
Read more here: https://github.com/storybookjs/storybook/blob/master/MIGRATION.md#can-no-longer-add-decoratorsparameters-after-stories`);

      this._storyStore.addKindMetadata(kind, { parameters });
      return api;
    };

    return api;
  };

  getStorybook = () => this._storyStore.getStorybook();

  raw = () => this._storyStore.raw();

  // FIXME: temporary expose the store for react-native
  // Longer term react-native should use the Provider/Consumer api
  store = () => this._storyStore;
}
