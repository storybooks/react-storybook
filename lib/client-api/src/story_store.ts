/* eslint-disable @typescript-eslint/naming-convention */
/* eslint no-underscore-dangle: 0 */
import memoize from 'memoizerific';
import dedent from 'ts-dedent';
import stable from 'stable';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import deprecate from 'util-deprecate';

import { Channel } from '@storybook/channels';
import Events from '@storybook/core-events';
import { logger } from '@storybook/client-logger';
import { sanitize, toId } from '@storybook/csf';
import {
  Comparator,
  Parameters,
  Args,
  LegacyStoryFn,
  ArgsStoryFn,
  StoryContext,
  StoryKind,
  StoryId,
} from '@storybook/addons';
import type {
  DecoratorFunction,
  StoryMetadata,
  StoreData,
  AddStoryArgs,
  StoreItem,
  PublishedStoreItem,
  ErrorLike,
  GetStorybookKind,
  ArgsEnhancer,
  ArgTypesEnhancer,
  StoreSelectionSpecifier,
  StoreSelection,
  StorySpecifier,
} from './types';
import { combineArgs, mapArgsToTypes, validateOptions } from './args';
import { HooksContext } from './hooks';
import { storySort } from './storySort';
import { combineParameters } from './parameters';
import { ensureArgTypes } from './ensureArgTypes';
import { inferArgTypes } from './inferArgTypes';
import { inferControls } from './inferControls';

interface StoryOptions {
  includeDocsOnly?: boolean;
}

type KindMetadata = StoryMetadata & { order: number };

function extractSanitizedKindNameFromStorySpecifier(storySpecifier: StorySpecifier): string {
  if (typeof storySpecifier === 'string') {
    return storySpecifier.split('--').shift();
  }

  return sanitize(storySpecifier.kind);
}

function extractIdFromStorySpecifier(storySpecifier: StorySpecifier): string {
  if (typeof storySpecifier === 'string') {
    return storySpecifier;
  }

  return toId(storySpecifier.kind, storySpecifier.name);
}

const isStoryDocsOnly = (parameters?: Parameters) => parameters && parameters.docsOnly;

const includeStory = (story: StoreItem, options: StoryOptions = { includeDocsOnly: false }) => {
  if (options.includeDocsOnly) {
    return true;
  }
  return !isStoryDocsOnly(story.parameters);
};

const checkGlobals = (parameters: Parameters) => {
  const { globals, globalTypes } = parameters;
  if (globals || globalTypes) {
    logger.error(
      'Global args/argTypes can only be set globally',
      JSON.stringify({
        globals,
        globalTypes,
      })
    );
  }
};

const checkStorySort = (parameters: Parameters) => {
  const { options } = parameters;
  if (options?.storySort) logger.error('The storySort option parameter can only be set globally');
};

const storyFnWarning = deprecate(
  () => {},
  dedent`
  \`storyFn\` is deprecated and will be removed in Storybook 7.0.

  https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-storyfn`
);

const argTypeDefaultValueWarning = deprecate(
  () => {},
  dedent`
  \`argType.defaultValue\` is deprecated and will be removed in Storybook 7.0.

  https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-argtype-defaultValue`
);

interface AllowUnsafeOption {
  allowUnsafe?: boolean;
}

const toExtracted = <T>(obj: T) =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    if (typeof value === 'function') {
      return acc;
    }
    // NOTE: We're serializing argTypes twice, at the top-level and also in parameters.
    // We currently rely on useParameters in the manager, so strip out the top-level argTypes
    // instead for performance.
    if (['hooks', 'argTypes'].includes(key)) {
      return acc;
    }
    if (Array.isArray(value)) {
      return Object.assign(acc, { [key]: value.slice().sort() });
    }
    return Object.assign(acc, { [key]: value });
  }, {});

export class StoryStore {
  _error?: ErrorLike;

  _channel: Channel;

  _configuring: boolean;

  _globals: Args;

  _initialGlobals: Args;

  _defaultGlobals: Args;

  _globalMetadata: StoryMetadata;

  // Keyed on kind name
  _kinds: Record<string, KindMetadata>;

  // Keyed on storyId
  _stories: StoreData;

  _argsEnhancers: ArgsEnhancer[];

  _argTypesEnhancers: ArgTypesEnhancer[];

  _selectionSpecifier?: StoreSelectionSpecifier;

  _selection?: StoreSelection;

  constructor(params: { channel: Channel }) {
    // Assume we are configuring until we hear otherwise
    this._configuring = true;
    this._globals = {};
    this._defaultGlobals = {};
    this._initialGlobals = {};
    this._globalMetadata = { parameters: {}, decorators: [], loaders: [] };
    this._kinds = {};
    this._stories = {};
    this._argsEnhancers = [];
    this._argTypesEnhancers = [ensureArgTypes];
    this._error = undefined;
    this._channel = params.channel;

    this.setupListeners();
  }

  setupListeners() {
    // Channel can be null in StoryShots
    if (!this._channel) return;

    this._channel.on(Events.SET_CURRENT_STORY, ({ storyId, viewMode }) =>
      this.setSelection({ storyId, viewMode })
    );

    this._channel.on(
      Events.UPDATE_STORY_ARGS,
      ({ storyId, updatedArgs }: { storyId: string; updatedArgs: Args }) =>
        this.updateStoryArgs(storyId, updatedArgs)
    );

    this._channel.on(
      Events.RESET_STORY_ARGS,
      ({ storyId, argNames }: { storyId: string; argNames?: string[] }) =>
        this.resetStoryArgs(storyId, argNames)
    );

    this._channel.on(Events.UPDATE_GLOBALS, ({ globals }: { globals: Args }) =>
      this.updateGlobals(globals)
    );
  }

  startConfiguring() {
    this._configuring = true;

    const safePush = (enhancer: ArgTypesEnhancer, enhancers: ArgTypesEnhancer[]) => {
      if (!enhancers.includes(enhancer)) enhancers.push(enhancer);
    };
    // run these at the end
    safePush(inferArgTypes, this._argTypesEnhancers);
    safePush(inferControls, this._argTypesEnhancers);
  }

  finishConfiguring() {
    this._configuring = false;

    const { globals = {}, globalTypes = {} } = this._globalMetadata.parameters;
    const allowedGlobals = new Set([...Object.keys(globals), ...Object.keys(globalTypes)]);
    const defaultGlobals = Object.entries(
      globalTypes as Record<string, { defaultValue: any }>
    ).reduce((acc, [arg, { defaultValue }]) => {
      if (defaultValue) acc[arg] = defaultValue;
      return acc;
    }, {} as Args);

    this._initialGlobals = { ...defaultGlobals, ...globals };

    // To deal with HMR & persistence, we consider the previous value of global args, and:
    //   1. Remove any keys that are not in the new parameter
    //   2. Preference any keys that were already set
    //   3. Use any new keys from the new parameter
    this._globals = Object.entries(this._globals || {}).reduce(
      (acc, [key, previousValue]) => {
        if (allowedGlobals.has(key)) acc[key] = previousValue;

        return acc;
      },
      { ...this._initialGlobals }
    );

    // Set the current selection based on the current selection specifier, if selection is not yet set
    const stories = this.sortedStories();
    let foundStory;
    if (this._selectionSpecifier && !this._selection) {
      const {
        storySpecifier,
        viewMode,
        args: urlArgs,
        globals: urlGlobals,
      } = this._selectionSpecifier;

      if (urlGlobals) {
        const allowedUrlGlobals = Object.entries(urlGlobals).reduce((acc, [key, value]) => {
          if (allowedGlobals.has(key)) acc[key] = value;
          return acc;
        }, {} as Args);
        this._globals = combineParameters(this._globals, allowedUrlGlobals);
      }

      if (storySpecifier === '*') {
        // '*' means select the first story. If there is none, we have no selection.
        [foundStory] = stories;
      } else if (typeof storySpecifier === 'string') {
        // Find the story with the exact id that matches the specifier (see #11571)
        foundStory = Object.values(stories).find((s) => s.id === storySpecifier);
        if (!foundStory) {
          // Fallback to the first story that starts with the specifier
          foundStory = Object.values(stories).find((s) => s.id.startsWith(storySpecifier));
        }
      } else {
        // Try and find a story matching the name/kind, setting no selection if they don't exist.
        const { name, kind } = storySpecifier;
        foundStory = this.getRawStory(kind, name);
      }

      if (foundStory) {
        if (urlArgs) {
          const mappedUrlArgs = mapArgsToTypes(urlArgs, foundStory.argTypes);
          foundStory.args = combineArgs(foundStory.args, mappedUrlArgs);
        }
        foundStory.args = validateOptions(foundStory.args, foundStory.argTypes);
        this.setSelection({ storyId: foundStory.id, viewMode });
        this._channel.emit(Events.STORY_SPECIFIED, { storyId: foundStory.id, viewMode });
      }
    }

    // If we didn't find a story matching the specifier, we always want to emit CURRENT_STORY_WAS_SET anyway
    // in order to tell the StoryRenderer to render something (a "missing story" view)
    if (!foundStory && this._channel) {
      this._channel.emit(Events.CURRENT_STORY_WAS_SET, this._selection);
    }

    this.pushToManager();
  }

  addGlobalMetadata({ parameters = {}, decorators = [], loaders = [] }: StoryMetadata) {
    if (parameters) {
      const { args, argTypes } = parameters;
      if (args || argTypes)
        logger.warn(
          'Found args/argTypes in global parameters.',
          JSON.stringify({ args, argTypes })
        );
    }
    const globalParameters = this._globalMetadata.parameters;

    this._globalMetadata.parameters = combineParameters(globalParameters, parameters);

    function _safeAdd(items: any[], collection: any[], caption: string) {
      items.forEach((item) => {
        if (collection.includes(item)) {
          logger.warn(`You tried to add a duplicate ${caption}, this is not expected`, item);
        } else {
          collection.push(item);
        }
      });
    }

    _safeAdd(decorators, this._globalMetadata.decorators, 'decorator');
    _safeAdd(loaders, this._globalMetadata.loaders, 'loader');
  }

  clearGlobalDecorators() {
    this._globalMetadata.decorators = [];
  }

  ensureKind(kind: string) {
    if (!this._kinds[kind]) {
      this._kinds[kind] = {
        order: Object.keys(this._kinds).length,
        parameters: {},
        decorators: [],
        loaders: [],
      };
    }
  }

  addKindMetadata(kind: string, { parameters = {}, decorators = [], loaders = [] }: StoryMetadata) {
    if (this.shouldBlockAddingKindMetadata(kind)) {
      return;
    }

    this.ensureKind(kind);
    if (parameters) {
      checkGlobals(parameters);
      checkStorySort(parameters);
    }
    this._kinds[kind].parameters = combineParameters(this._kinds[kind].parameters, parameters);

    this._kinds[kind].decorators.push(...decorators);
    this._kinds[kind].loaders.push(...loaders);
  }

  addArgsEnhancer(argsEnhancer: ArgsEnhancer) {
    if (Object.keys(this._stories).length > 0)
      throw new Error('Cannot add an args enhancer to the store after a story has been added.');

    this._argsEnhancers.push(argsEnhancer);
  }

  addArgTypesEnhancer(argTypesEnhancer: ArgTypesEnhancer) {
    if (Object.keys(this._stories).length > 0)
      throw new Error('Cannot add an argTypes enhancer to the store after a story has been added.');

    this._argTypesEnhancers.push(argTypesEnhancer);
  }

  // Combine the global, kind & story parameters of a story
  combineStoryParameters(parameters: Parameters, kind: StoryKind) {
    return combineParameters(
      this._globalMetadata.parameters,
      this._kinds[kind].parameters,
      parameters
    );
  }

  shouldBlockAddingStory(id: string): boolean {
    return (
      this.isSingleStoryMode() &&
      id !== extractIdFromStorySpecifier(this._selectionSpecifier.storySpecifier)
    );
  }

  shouldBlockAddingKindMetadata(kind: string): boolean {
    return (
      this.isSingleStoryMode() &&
      sanitize(kind) !==
        extractSanitizedKindNameFromStorySpecifier(this._selectionSpecifier.storySpecifier)
    );
  }

  addStory(
    {
      id,
      kind,
      name,
      storyFn: original,
      parameters: storyParameters = {},
      decorators: storyDecorators = [],
      loaders: storyLoaders = [],
    }: AddStoryArgs,
    {
      applyDecorators,
      allowUnsafe = false,
    }: {
      applyDecorators: (fn: LegacyStoryFn, decorators: DecoratorFunction[]) => any;
    } & AllowUnsafeOption
  ) {
    if (!this._configuring && !allowUnsafe)
      throw new Error(
        'Cannot add a story when not configuring, see https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#story-store-immutable-outside-of-configuration'
      );

    if (this.shouldBlockAddingStory(id)) {
      return;
    }

    checkGlobals(storyParameters);
    checkStorySort(storyParameters);

    const { _stories } = this;

    if (_stories[id]) {
      logger.warn(dedent`
        Story with id ${id} already exists in the store!

        Perhaps you added the same story twice, or you have a name collision?
        Story ids need to be unique -- ensure you aren't using the same names modulo url-sanitization.
      `);
    }

    const identification = {
      id,
      kind,
      name,
      story: name, // legacy
    };

    // immutable original storyFn
    const getOriginal = () => original;

    this.ensureKind(kind);
    const kindMetadata: KindMetadata = this._kinds[kind];
    const decorators = [
      ...storyDecorators,
      ...kindMetadata.decorators,
      ...this._globalMetadata.decorators,
    ];
    const loaders = [...this._globalMetadata.loaders, ...kindMetadata.loaders, ...storyLoaders];

    const finalStoryFn = (context: StoryContext) => {
      const { args = {}, argTypes = {}, parameters } = context;
      const { passArgsFirst = true } = parameters;
      const mapped = {
        ...context,
        args: Object.entries(args).reduce((acc, [key, val]) => {
          const { mapping } = argTypes[key] || {};
          acc[key] = mapping && val in mapping ? mapping[val] : val;
          return acc;
        }, {} as Args),
      };
      return passArgsFirst
        ? (original as ArgsStoryFn)(mapped.args, mapped)
        : (original as LegacyStoryFn)(mapped);
    };

    // lazily decorate the story when it's loaded
    const getDecorated: () => LegacyStoryFn = memoize(1)(() =>
      applyDecorators(finalStoryFn, decorators)
    );

    const hooks = new HooksContext();

    // We need the combined parameters now in order to calculate argTypes, but we won't keep them
    const combinedParameters = this.combineStoryParameters(storyParameters, kind);

    // We are going to make various UI changes in both the manager and the preview
    // based on whether it's an "args story", i.e. whether the story accepts a first
    // argument which is an `Args` object. Here we store it as a parameter on every story
    // for convenience, but we preface it with `__` to denote that it's an internal API
    // and that users probably shouldn't look at it.
    const { passArgsFirst = true } = combinedParameters;
    const __isArgsStory = passArgsFirst && original.length > 0;

    const { argTypes = {} } = this._argTypesEnhancers.reduce(
      (accumulatedParameters: Parameters, enhancer) => ({
        ...accumulatedParameters,
        argTypes: enhancer({
          ...identification,
          storyFn: original,
          parameters: accumulatedParameters,
          args: {},
          argTypes: {},
          globals: {},
          originalStoryFn: getOriginal(),
        }),
      }),
      { __isArgsStory, ...combinedParameters }
    );

    const storyParametersWithArgTypes = { ...storyParameters, argTypes, __isArgsStory };

    const storyFn: LegacyStoryFn = (runtimeContext: StoryContext) => {
      storyFnWarning();
      return getDecorated()({
        ...identification,
        ...runtimeContext,
        // Calculate "combined" parameters at render time (NOTE: for perf we could just use combinedParameters from above?)
        parameters: this.combineStoryParameters(storyParametersWithArgTypes, kind),
        hooks,
        args: _stories[id].args,
        argTypes,
        globals: this._globals,
        viewMode: this._selection?.viewMode,
        originalStoryFn: getOriginal(),
      });
    };

    const unboundStoryFn: LegacyStoryFn = (context: StoryContext) => getDecorated()(context);

    const applyLoaders = async () => {
      const context = {
        ...identification,
        // Calculate "combined" parameters at render time (NOTE: for perf we could just use combinedParameters from above?)
        parameters: this.combineStoryParameters(storyParametersWithArgTypes, kind),
        hooks,
        args: _stories[id].args,
        argTypes,
        globals: this._globals,
        viewMode: this._selection?.viewMode,
        originalStoryFn: getOriginal(),
      };
      const loadResults = await Promise.all(loaders.map((loader) => loader(context)));
      const loaded = Object.assign({}, ...loadResults);
      return { ...context, loaded };
    };

    // Pull out parameters.args.$ || .argTypes.$.defaultValue into initialArgs
    const passedArgs: Args = {
      ...this._kinds[kind].parameters.args,
      ...storyParameters.args,
    };
    const defaultArgs: Args = Object.entries(
      argTypes as Record<string, { defaultValue: any }>
    ).reduce((acc, [arg, { defaultValue }]) => {
      if (typeof defaultValue !== 'undefined') {
        acc[arg] = defaultValue;
      }
      return acc;
    }, {} as Args);
    if (Object.keys(defaultArgs).length > 0) {
      argTypeDefaultValueWarning();
    }

    const initialArgsBeforeEnhancers = { ...defaultArgs, ...passedArgs };
    const initialArgs = this._argsEnhancers.reduce(
      (accumulatedArgs: Args, enhancer) => ({
        ...accumulatedArgs,
        ...enhancer({
          ...identification,
          parameters: combinedParameters,
          args: initialArgsBeforeEnhancers,
          argTypes,
          globals: {},
          originalStoryFn: getOriginal(),
        }),
      }),
      initialArgsBeforeEnhancers
    );

    const runPlayFunction = async () => {
      const { play } = combinedParameters as { play?: () => any };
      return play ? play() : undefined;
    };

    _stories[id] = {
      ...identification,

      hooks,
      getDecorated,
      getOriginal,
      applyLoaders,
      runPlayFunction,
      storyFn,
      unboundStoryFn,

      parameters: storyParametersWithArgTypes,
      args: initialArgs,
      argTypes,
      initialArgs,
    };
  }

  remove = (id: string, { allowUnsafe = false }: AllowUnsafeOption = {}): void => {
    if (!this._configuring && !allowUnsafe)
      throw new Error(
        'Cannot remove a story when not configuring, see https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#story-store-immutable-outside-of-configuration'
      );

    const { _stories } = this;
    const story = _stories[id];
    delete _stories[id];

    if (story) story.hooks.clean();
  };

  removeStoryKind(kind: string, { allowUnsafe = false }: AllowUnsafeOption = {}) {
    if (!this._configuring && !allowUnsafe)
      throw new Error(
        'Cannot remove a kind when not configuring, see https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#story-store-immutable-outside-of-configuration'
      );

    if (!this._kinds[kind]) return;

    this._kinds[kind].parameters = {};
    this._kinds[kind].decorators = [];

    this.cleanHooksForKind(kind);
    this._stories = Object.entries(this._stories).reduce((acc: StoreData, [id, story]) => {
      if (story.kind !== kind) acc[id] = story;

      return acc;
    }, {});
  }

  updateGlobals(newGlobals: Args) {
    this._globals = { ...this._globals, ...newGlobals };
    this._channel.emit(Events.GLOBALS_UPDATED, {
      globals: this._globals,
      initialGlobals: this._initialGlobals,
    });
  }

  updateStoryArgs(id: string, newArgs: Args) {
    if (!this._stories[id]) throw new Error(`No story for id ${id}`);
    const { args } = this._stories[id];
    this._stories[id].args = { ...args, ...newArgs };

    this._channel.emit(Events.STORY_ARGS_UPDATED, { storyId: id, args: this._stories[id].args });
  }

  resetStoryArgs(id: string, argNames?: string[]) {
    if (!this._stories[id]) throw new Error(`No story for id ${id}`);
    const { args, initialArgs } = this._stories[id];

    this._stories[id].args = { ...args }; // Make a copy to avoid problems
    (argNames || Object.keys(args)).forEach((name) => {
      // We overwrite like this to ensure we can reset to falsey values
      this._stories[id].args[name] = initialArgs[name];
    });

    this._channel.emit(Events.STORY_ARGS_UPDATED, { storyId: id, args: this._stories[id].args });
  }

  fromId = (id: string): PublishedStoreItem | null => {
    try {
      const data = this._stories[id as string];

      if (!data || !data.getDecorated) {
        return null;
      }

      return this.mergeAdditionalDataToStory(data);
    } catch (e) {
      logger.warn('failed to get story:', this._stories);
      logger.error(e);
      return null;
    }
  };

  raw(options?: StoryOptions): PublishedStoreItem[] {
    return Object.values(this._stories)
      .filter((i) => !!i.getDecorated)
      .filter((i) => includeStory(i, options))
      .map((i) => this.mergeAdditionalDataToStory(i));
  }

  sortedStories(): StoreItem[] {
    // NOTE: when kinds are HMR'ed they get temporarily removed from the `_stories` array
    // and thus lose order. However `_kinds[x].order` preservers the original load order
    const kindOrder = mapValues(this._kinds, ({ order }) => order);
    const storySortParameter = this._globalMetadata.parameters?.options?.storySort;

    const storyEntries = Object.entries(this._stories);
    // Add the kind parameters and global parameters to each entry
    const stories: [
      StoryId,
      StoreItem,
      Parameters,
      Parameters
    ][] = storyEntries.map(([id, story]) => [
      id,
      story,
      this._kinds[story.kind].parameters,
      this._globalMetadata.parameters,
    ]);
    if (storySortParameter) {
      let sortFn: Comparator<any>;
      if (typeof storySortParameter === 'function') {
        sortFn = storySortParameter;
      } else {
        sortFn = storySort(storySortParameter);
      }
      stable.inplace(stories, sortFn);
    } else {
      stable.inplace(stories, (s1, s2) => kindOrder[s1[1].kind] - kindOrder[s2[1].kind]);
    }
    return stories.map(([id, s]) => s);
  }

  extract(options: StoryOptions & { normalizeParameters?: boolean } = {}) {
    const stories = this.sortedStories();

    // removes function values from all stories so they are safe to transport over the channel
    return stories.reduce((acc, story) => {
      if (!includeStory(story, options)) return acc;

      const extracted = toExtracted(story);
      if (options.normalizeParameters) return Object.assign(acc, { [story.id]: extracted });

      const { parameters, kind } = extracted as {
        parameters: Parameters;
        kind: StoryKind;
      };
      return Object.assign(acc, {
        [story.id]: Object.assign(extracted, {
          parameters: this.combineStoryParameters(parameters, kind),
        }),
      });
    }, {});
  }

  clearError() {
    this._error = null;
  }

  setError = (err: ErrorLike) => {
    this._error = err;
  };

  getError = (): ErrorLike | undefined => this._error;

  setSelectionSpecifier(selectionSpecifier: StoreSelectionSpecifier): void {
    this._selectionSpecifier = selectionSpecifier;
  }

  setSelection(selection: StoreSelection): void {
    this._selection = selection;

    if (this._channel) {
      this._channel.emit(Events.CURRENT_STORY_WAS_SET, this._selection);
    }
  }

  isSingleStoryMode(): boolean {
    if (!this._selectionSpecifier) {
      return false;
    }

    const { singleStory, storySpecifier } = this._selectionSpecifier;
    return storySpecifier && storySpecifier !== '*' && singleStory;
  }

  getSelection = (): StoreSelection => this._selection;

  getDataForManager = () => ({
    v: 2,
    globalParameters: this._globalMetadata.parameters,
    globals: this._globals,
    error: this.getError(),
    kindParameters: mapValues(this._kinds, (metadata) => metadata.parameters),
    stories: this.extract({ includeDocsOnly: true, normalizeParameters: true }),
  });

  getStoriesJsonData = () => {
    const value = this.getDataForManager();
    const allowed = ['fileName', 'docsOnly', 'framework', '__id', '__isArgsStory'];

    return {
      v: 2,
      globalParameters: pick(value.globalParameters, allowed),
      kindParameters: mapValues(value.kindParameters, (v) => pick(v, allowed)),
      stories: mapValues(value.stories, (v: any) => ({
        ...pick(v, ['id', 'name', 'kind', 'story']),
        parameters: pick(v.parameters, allowed),
      })),
    };
  };

  pushToManager = () => {
    if (this._channel) {
      // send to the parent frame.
      this._channel.emit(Events.SET_STORIES, this.getDataForManager());
    }
  };

  getStoryKinds() {
    return Array.from(new Set(this.raw().map((s) => s.kind)));
  }

  getStoriesForKind = (kind: string) => this.raw().filter((story) => story.kind === kind);

  getRawStory(kind: string, name: string) {
    return this.getStoriesForKind(kind).find((s) => s.name === name);
  }

  cleanHooks(id: string) {
    if (this._stories[id]) {
      this._stories[id].hooks.clean();
    }
  }

  cleanHooksForKind(kind: string) {
    this.getStoriesForKind(kind).map((story) => this.cleanHooks(story.id));
  }

  // This API is a re-implementation of Storybook's original getStorybook() API.
  // As such it may not behave *exactly* the same, but aims to. Some notes:
  //  - It is *NOT* sorted by the user's sort function, but remains sorted in "insertion order"
  //  - It does not include docs-only stories
  getStorybook(): GetStorybookKind[] {
    return Object.values(
      this.raw().reduce((kinds: { [kind: string]: GetStorybookKind }, story) => {
        if (!includeStory(story)) return kinds;

        const {
          kind,
          name,
          storyFn,
          parameters: { fileName },
        } = story;

        // eslint-disable-next-line no-param-reassign
        if (!kinds[kind]) kinds[kind] = { kind, fileName, stories: [] };

        kinds[kind].stories.push({ name, render: storyFn });

        return kinds;
      }, {})
    ).sort((s1, s2) => this._kinds[s1.kind].order - this._kinds[s2.kind].order);
  }

  private mergeAdditionalDataToStory(story: StoreItem): PublishedStoreItem {
    return {
      ...story,
      parameters: this.combineStoryParameters(story.parameters, story.kind),
      globals: this._globals,
    };
  }
}

export { StoryStore as default };
