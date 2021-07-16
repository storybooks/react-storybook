import React, {
  Component,
  Fragment,
  FunctionComponent,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import {
  STORY_CHANGED,
  SHARED_STATE_CHANGED,
  SHARED_STATE_SET,
  SET_STORIES,
} from '@storybook/core-events';
import { RenderData as RouterData } from '@storybook/router';
import { Listener } from '@storybook/channels';

import { createContext } from './context';
import Store, { Options } from './store';
import getInitialState from './initial-state';
import type { StoriesHash, Story, Root, Group } from './lib/stories';
import { isGroup, isRoot, isStory } from './lib/stories';

import * as provider from './modules/provider';
import * as addons from './modules/addons';
import * as channel from './modules/channel';
import * as notifications from './modules/notifications';
import * as settings from './modules/settings';
import * as releaseNotes from './modules/release-notes';
import * as stories from './modules/stories';
import * as refs from './modules/refs';
import * as layout from './modules/layout';
import * as shortcuts from './modules/shortcuts';
import * as url from './modules/url';
import * as version from './modules/versions';
import * as globals from './modules/globals';
import { combineParameters } from './lib/combineParameters';

const { ActiveTabs } = layout;

export { default as merge } from './lib/merge';
export type { Options as StoreOptions, Listener as ChannelListener };
export { ActiveTabs };

const ManagerContext = createContext({ api: undefined, state: getInitialState({}) });

export type ModuleArgs = RouterData &
  ProviderData & {
    mode?: 'production' | 'development';
    state: State;
    fullAPI: API;
    store: Store;
  };

export type State = layout.SubState &
  stories.SubState &
  refs.SubState &
  notifications.SubState &
  version.SubState &
  url.SubState &
  shortcuts.SubState &
  releaseNotes.SubState &
  settings.SubState &
  globals.SubState &
  RouterData &
  Other;

export type API = addons.SubAPI &
  channel.SubAPI &
  provider.SubAPI &
  stories.SubAPI &
  refs.SubAPI &
  globals.SubAPI &
  layout.SubAPI &
  notifications.SubAPI &
  shortcuts.SubAPI &
  releaseNotes.SubAPI &
  settings.SubAPI &
  version.SubAPI &
  url.SubAPI &
  Other;

interface Other {
  [key: string]: any;
}

export interface Combo {
  api: API;
  state: State;
}

interface ProviderData {
  provider: provider.Provider;
}

export type ManagerProviderProps = RouterData &
  ProviderData & {
    docsMode: boolean;
    children: ReactNode | ((props: Combo) => ReactNode);
  };

// These types are duplicated in addons.
export type StoryId = string;
export type StoryKind = string;

export interface Args {
  [key: string]: any;
}

export interface ArgType {
  name?: string;
  description?: string;
  defaultValue?: any;
  [key: string]: any;
}

export interface ArgTypes {
  [key: string]: ArgType;
}

export interface Parameters {
  [key: string]: any;
}

export type ModuleFn = (m: ModuleArgs) => Module;

interface Module {
  init?: () => void;
  api?: unknown;
  state?: unknown;
}

class ManagerProvider extends Component<ManagerProviderProps, State> {
  api: API = {} as API;

  modules: Module[];

  static displayName = 'Manager';

  constructor(props: ManagerProviderProps) {
    super(props);
    const {
      location,
      path,
      refId,
      viewMode = props.docsMode ? 'docs' : 'story',
      singleStory,
      storyId,
      docsMode,
      navigate,
    } = props;

    const store = new Store({
      getState: () => this.state,
      setState: (stateChange: Partial<State>, callback) => this.setState(stateChange, callback),
    });

    const routeData = { location, path, viewMode, singleStory, storyId, refId };

    // Initialize the state to be the initial (persisted) state of the store.
    // This gives the modules the chance to read the persisted state, apply their defaults
    // and override if necessary
    const docsModeState = {
      layout: { isToolshown: false, showPanel: false },
      ui: { docsMode: true },
    };

    this.state = store.getInitialState(
      getInitialState({
        ...routeData,
        ...(docsMode ? docsModeState : null),
      })
    );

    const apiData = {
      navigate,
      store,
      provider: props.provider,
    };

    this.modules = [
      provider,
      channel,
      addons,
      layout,
      notifications,
      settings,
      releaseNotes,
      shortcuts,
      stories,
      refs,
      globals,
      url,
      version,
    ].map((m) => m.init({ ...routeData, ...apiData, state: this.state, fullAPI: this.api }));

    // Create our initial state by combining the initial state of all modules, then overlaying any saved state
    const state = getInitialState(this.state, ...this.modules.map((m) => m.state));

    // Get our API by combining the APIs exported by each module
    const api: API = Object.assign(this.api, { navigate }, ...this.modules.map((m) => m.api));

    this.state = state;
    this.api = api;
  }

  static getDerivedStateFromProps = (props: ManagerProviderProps, state: State) => {
    if (state.path !== props.path) {
      return {
        ...state,
        location: props.location,
        path: props.path,
        refId: props.refId,
        // if its a docsOnly page, even the 'story' view mode is considered 'docs'
        viewMode: (props.docsMode && props.viewMode) === 'story' ? 'docs' : props.viewMode,
        storyId: props.storyId,
      };
    }
    return null;
  };

  shouldComponentUpdate(nextProps: ManagerProviderProps, nextState: State) {
    const prevState = this.state;
    const prevProps = this.props;

    if (prevState !== nextState) {
      return true;
    }
    if (prevProps.path !== nextProps.path) {
      return true;
    }
    return false;
  }

  initModules = () => {
    // Now every module has had a chance to set its API, call init on each module which gives it
    // a chance to do things that call other modules' APIs.
    this.modules.forEach(({ init }) => {
      if (init) {
        init();
      }
    });
  };

  render() {
    const { children } = this.props;
    const value = {
      state: this.state,
      api: this.api,
    };

    return (
      <EffectOnMount effect={this.initModules}>
        <ManagerContext.Provider value={value}>
          <ManagerConsumer>{children}</ManagerConsumer>
        </ManagerContext.Provider>
      </EffectOnMount>
    );
  }
}

// EffectOnMount exists to work around a bug in Reach Router where calling
// navigate inside of componentDidMount (as could happen when we call init on any
// of our modules) does not cause Reach Router's LocationProvider to update with
// the correct path. Calling navigate inside on an effect does not have the
// same problem. See https://github.com/reach/router/issues/404
const EffectOnMount: FunctionComponent<{
  children: ReactElement;
  effect: () => void;
}> = ({ children, effect }) => {
  React.useEffect(effect, []);
  return children;
};

interface ManagerConsumerProps<P = unknown> {
  filter?: (combo: Combo) => P;
  children: FunctionComponent<P> | ReactNode;
}

const defaultFilter = (c: Combo) => c;

function ManagerConsumer<P = Combo>({
  // @ts-ignore
  filter = defaultFilter,
  children,
}: ManagerConsumerProps<P>): ReactElement {
  const c = useContext(ManagerContext);
  const renderer = useRef(children);
  const filterer = useRef(filter);

  if (typeof renderer.current !== 'function') {
    return <Fragment>{renderer.current}</Fragment>;
  }

  const data = filterer.current(c);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const l = useMemo(
    () => [...Object.entries(data).reduce((acc, keyval) => acc.concat(keyval), [])],
    [data]
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMemo(() => {
    const Child = renderer.current as FunctionComponent<P>;

    return <Child {...data} />;
  }, l);
}

export function useStorybookState(): State {
  const { state } = useContext(ManagerContext);
  return state;
}
export function useStorybookApi(): API {
  const { api } = useContext(ManagerContext);
  return api;
}

export type { StoriesHash, Story, Root, Group };
export { ManagerConsumer as Consumer, ManagerProvider as Provider, isGroup, isRoot, isStory };

export interface EventMap {
  [eventId: string]: Listener;
}

function orDefault<S>(fromStore: S, defaultState: S): S {
  if (typeof fromStore === 'undefined') {
    return defaultState;
  }
  return fromStore;
}

export const useChannel = (eventMap: EventMap, deps: any[] = []) => {
  const api = useStorybookApi();
  useEffect(() => {
    Object.entries(eventMap).forEach(([type, listener]) => api.on(type, listener));
    return () => {
      Object.entries(eventMap).forEach(([type, listener]) => api.off(type, listener));
    };
  }, deps);

  return api.emit;
};

export function useParameter<S>(parameterKey: string, defaultValue?: S) {
  const api = useStorybookApi();

  const result = api.getCurrentParameter<S>(parameterKey);
  return orDefault<S>(result, defaultValue);
}

type StateMerger<S> = (input: S) => S;
// cache for taking care of HMR
const addonStateCache: {
  [key: string]: any;
} = {};

// shared state
export function useSharedState<S>(stateId: string, defaultState?: S) {
  const api = useStorybookApi();
  const existingState = api.getAddonState<S>(stateId);
  const state = orDefault<S>(
    existingState,
    addonStateCache[stateId] ? addonStateCache[stateId] : defaultState
  );
  const setState = (s: S | StateMerger<S>, options?: Options) => {
    // set only after the stories are loaded
    if (addonStateCache[stateId]) {
      addonStateCache[stateId] = s;
    }
    api.setAddonState<S>(stateId, s, options);
  };
  const allListeners = useMemo(() => {
    const stateChangeHandlers = {
      [`${SHARED_STATE_CHANGED}-client-${stateId}`]: (s: S) => setState(s),
      [`${SHARED_STATE_SET}-client-${stateId}`]: (s: S) => setState(s),
    };
    const stateInitializationHandlers = {
      [SET_STORIES]: () => {
        const currentState = api.getAddonState(stateId);
        if (currentState) {
          addonStateCache[stateId] = currentState;
          api.emit(`${SHARED_STATE_SET}-manager-${stateId}`, currentState);
        } else if (addonStateCache[stateId]) {
          // this happens when HMR
          setState(addonStateCache[stateId]);
          api.emit(`${SHARED_STATE_SET}-manager-${stateId}`, addonStateCache[stateId]);
        } else if (defaultState !== undefined) {
          // if not HMR, yet the defaults are from the manager
          setState(defaultState);
          // initialize addonStateCache after first load, so its available for subsequent HMR
          addonStateCache[stateId] = defaultState;
          api.emit(`${SHARED_STATE_SET}-manager-${stateId}`, defaultState);
        }
      },
      [STORY_CHANGED]: () => {
        const currentState = api.getAddonState(stateId);

        if (currentState !== undefined) {
          api.emit(`${SHARED_STATE_SET}-manager-${stateId}`, currentState);
        }
      },
    };

    return {
      ...stateChangeHandlers,
      ...stateInitializationHandlers,
    };
  }, [stateId]);

  const emit = useChannel(allListeners);
  return [
    state,
    (newStateOrMerger: S | StateMerger<S>, options?: Options) => {
      setState(newStateOrMerger, options);
      emit(`${SHARED_STATE_CHANGED}-manager-${stateId}`, newStateOrMerger);
    },
  ] as [S, (newStateOrMerger: S | StateMerger<S>, options?: Options) => void];
}

export function useAddonState<S>(addonId: string, defaultState?: S) {
  return useSharedState<S>(addonId, defaultState);
}

export function useArgs(): [Args, (newArgs: Args) => void, (argNames?: string[]) => void] {
  const { getCurrentStoryData, updateStoryArgs, resetStoryArgs } = useStorybookApi();

  const data = getCurrentStoryData();
  const args = isStory(data) ? data.args : {};
  const updateArgs = useCallback((newArgs: Args) => updateStoryArgs(data as Story, newArgs), [
    data,
    updateStoryArgs,
  ]);
  const resetArgs = useCallback((argNames?: string[]) => resetStoryArgs(data as Story, argNames), [
    data,
    resetStoryArgs,
  ]);

  return [args, updateArgs, resetArgs];
}

export function useGlobals(): [Args, (newGlobals: Args) => void] {
  const {
    state: { globals: oldGlobals },
    api: { updateGlobals },
  } = useContext(ManagerContext);

  return [oldGlobals, updateGlobals];
}

export function useArgTypes(): ArgTypes {
  return useParameter<ArgTypes>('argTypes', {});
}

export function useGlobalTypes(): ArgTypes {
  return useParameter<ArgTypes>('globalTypes', {});
}

export { combineParameters };
