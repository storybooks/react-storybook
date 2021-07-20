import global from 'global';
import { logger } from '@storybook/client-logger';
import {
  FORCE_RE_RENDER,
  STORY_RENDERED,
  DOCS_RENDERED,
  UPDATE_STORY_ARGS,
  RESET_STORY_ARGS,
  UPDATE_GLOBALS,
} from '@storybook/core-events';
import { addons } from './index';
import { StoryGetter, StoryContext, Args } from './types';

const { window: globalWindow } = global;

interface Hook {
  name: string;
  memoizedState?: any;
  deps?: any[] | undefined;
}

interface Effect {
  create: () => (() => void) | void;
  destroy?: (() => void) | void;
}

type Decorator = (getStory: StoryGetter, context: StoryContext) => any;
type AbstractFunction = (...args: any[]) => any;

const RenderEvents = [STORY_RENDERED, DOCS_RENDERED];

export class HooksContext {
  hookListsMap: WeakMap<AbstractFunction, Hook[]>;

  mountedDecorators: Set<AbstractFunction>;

  prevMountedDecorators: Set<AbstractFunction>;

  currentHooks: Hook[];

  nextHookIndex: number;

  currentPhase: 'MOUNT' | 'UPDATE' | 'NONE';

  currentEffects: Effect[];

  prevEffects: Effect[];

  currentDecoratorName: string | null;

  hasUpdates: boolean;

  currentContext: StoryContext | null;

  renderListener = () => {
    this.triggerEffects();
    this.currentContext = null;
    this.removeRenderListeners();
  };

  constructor() {
    this.init();
  }

  init() {
    this.hookListsMap = new WeakMap();
    this.mountedDecorators = new Set();
    this.prevMountedDecorators = this.mountedDecorators;
    this.currentHooks = [];
    this.nextHookIndex = 0;
    this.currentPhase = 'NONE';
    this.currentEffects = [];
    this.prevEffects = [];
    this.currentDecoratorName = null;
    this.hasUpdates = false;
    this.currentContext = null;
  }

  clean() {
    this.prevEffects.forEach((effect) => {
      if (effect.destroy) {
        effect.destroy();
      }
    });
    this.init();
    this.removeRenderListeners();
  }

  getNextHook() {
    const hook = this.currentHooks[this.nextHookIndex];
    this.nextHookIndex += 1;
    return hook;
  }

  triggerEffects() {
    // destroy removed effects
    this.prevEffects.forEach((effect) => {
      if (!this.currentEffects.includes(effect) && effect.destroy) {
        effect.destroy();
      }
    });
    // trigger added effects
    this.currentEffects.forEach((effect) => {
      if (!this.prevEffects.includes(effect)) {
        // eslint-disable-next-line no-param-reassign
        effect.destroy = effect.create();
      }
    });
    this.prevEffects = this.currentEffects;
    this.currentEffects = [];
  }

  addRenderListeners() {
    this.removeRenderListeners();
    const channel = addons.getChannel();
    RenderEvents.forEach((e) => channel.on(e, this.renderListener));
  }

  removeRenderListeners() {
    const channel = addons.getChannel();
    RenderEvents.forEach((e) => channel.removeListener(e, this.renderListener));
  }
}

const hookify = (fn: AbstractFunction) => (...args: any[]) => {
  const { hooks }: StoryContext = typeof args[0] === 'function' ? args[1] : args[0];

  const prevPhase = hooks.currentPhase;
  const prevHooks = hooks.currentHooks;
  const prevNextHookIndex = hooks.nextHookIndex;
  const prevDecoratorName = hooks.currentDecoratorName;

  hooks.currentDecoratorName = fn.name;
  if (hooks.prevMountedDecorators.has(fn)) {
    hooks.currentPhase = 'UPDATE';
    hooks.currentHooks = hooks.hookListsMap.get(fn) || [];
  } else {
    hooks.currentPhase = 'MOUNT';
    hooks.currentHooks = [];
    hooks.hookListsMap.set(fn, hooks.currentHooks);
    hooks.prevMountedDecorators.add(fn);
  }
  hooks.nextHookIndex = 0;

  const prevContext = globalWindow.STORYBOOK_HOOKS_CONTEXT;
  globalWindow.STORYBOOK_HOOKS_CONTEXT = hooks;
  const result = fn(...args);
  globalWindow.STORYBOOK_HOOKS_CONTEXT = prevContext;

  if (hooks.currentPhase === 'UPDATE' && hooks.getNextHook() != null) {
    throw new Error(
      'Rendered fewer hooks than expected. This may be caused by an accidental early return statement.'
    );
  }

  hooks.currentPhase = prevPhase;
  hooks.currentHooks = prevHooks;
  hooks.nextHookIndex = prevNextHookIndex;
  hooks.currentDecoratorName = prevDecoratorName;
  return result;
};

// Counter to prevent infinite loops.
let numberOfRenders = 0;
const RENDER_LIMIT = 25;
export const applyHooks = (
  applyDecorators: (getStory: StoryGetter, decorators: Decorator[]) => StoryGetter
) => (getStory: StoryGetter, decorators: Decorator[]) => {
  const decorated = applyDecorators(hookify(getStory), decorators.map(hookify));
  return (context: StoryContext) => {
    const { hooks } = context;
    hooks.prevMountedDecorators = hooks.mountedDecorators;
    hooks.mountedDecorators = new Set([getStory, ...decorators]);
    hooks.currentContext = context;
    hooks.hasUpdates = false;
    let result = decorated(context);
    numberOfRenders = 1;
    while (hooks.hasUpdates) {
      hooks.hasUpdates = false;
      hooks.currentEffects = [];
      result = decorated(context);
      numberOfRenders += 1;
      if (numberOfRenders > RENDER_LIMIT) {
        throw new Error(
          'Too many re-renders. Storybook limits the number of renders to prevent an infinite loop.'
        );
      }
    }
    hooks.addRenderListeners();
    return result;
  };
};

const areDepsEqual = (deps: any[], nextDeps: any[]) =>
  deps.length === nextDeps.length && deps.every((dep, i) => dep === nextDeps[i]);

const invalidHooksError = () =>
  new Error('Storybook preview hooks can only be called inside decorators and story functions.');

function getHooksContextOrNull(): HooksContext | null {
  return globalWindow.STORYBOOK_HOOKS_CONTEXT || null;
}

function getHooksContextOrThrow(): HooksContext {
  const hooks = getHooksContextOrNull();
  if (hooks == null) {
    throw invalidHooksError();
  }
  return hooks;
}

function useHook(name: string, callback: (hook: Hook) => void, deps?: any[] | undefined): Hook {
  const hooks = getHooksContextOrThrow();
  if (hooks.currentPhase === 'MOUNT') {
    if (deps != null && !Array.isArray(deps)) {
      logger.warn(
        `${name} received a final argument that is not an array (instead, received ${deps}). When specified, the final argument must be an array.`
      );
    }
    const hook: Hook = { name, deps };
    hooks.currentHooks.push(hook);
    callback(hook);
    return hook;
  }

  if (hooks.currentPhase === 'UPDATE') {
    const hook = hooks.getNextHook();
    if (hook == null) {
      throw new Error('Rendered more hooks than during the previous render.');
    }

    if (hook.name !== name) {
      logger.warn(
        `Storybook has detected a change in the order of Hooks${
          hooks.currentDecoratorName ? ` called by ${hooks.currentDecoratorName}` : ''
        }. This will lead to bugs and errors if not fixed.`
      );
    }

    if (deps != null && hook.deps == null) {
      logger.warn(
        `${name} received a final argument during this render, but not during the previous render. Even though the final argument is optional, its type cannot change between renders.`
      );
    }

    if (deps != null && hook.deps != null && deps.length !== hook.deps.length) {
      logger.warn(`The final argument passed to ${name} changed size between renders. The order and size of this array must remain constant.
Previous: ${hook.deps}
Incoming: ${deps}`);
    }

    if (deps == null || hook.deps == null || !areDepsEqual(deps, hook.deps)) {
      callback(hook);
      hook.deps = deps;
    }
    return hook;
  }

  throw invalidHooksError();
}

function useMemoLike<T>(name: string, nextCreate: () => T, deps: any[] | undefined): T {
  const { memoizedState } = useHook(
    name,
    (hook) => {
      // eslint-disable-next-line no-param-reassign
      hook.memoizedState = nextCreate();
    },
    deps
  );
  return memoizedState;
}

/* Returns a memoized value, see https://reactjs.org/docs/hooks-reference.html#usememo */
export function useMemo<T>(nextCreate: () => T, deps?: any[]): T {
  return useMemoLike('useMemo', nextCreate, deps);
}

/* Returns a memoized callback, see https://reactjs.org/docs/hooks-reference.html#usecallback */
export function useCallback<T>(callback: T, deps?: any[]): T {
  return useMemoLike('useCallback', () => callback, deps);
}

function useRefLike<T>(name: string, initialValue: T): { current: T } {
  return useMemoLike(name, () => ({ current: initialValue }), []);
}

/* Returns a mutable ref object, see https://reactjs.org/docs/hooks-reference.html#useref */
export function useRef<T>(initialValue: T): { current: T } {
  return useRefLike('useRef', initialValue);
}

function triggerUpdate() {
  const hooks = getHooksContextOrNull();
  // Rerun getStory if updates were triggered synchronously, force rerender otherwise
  if (hooks != null && hooks.currentPhase !== 'NONE') {
    hooks.hasUpdates = true;
  } else {
    try {
      addons.getChannel().emit(FORCE_RE_RENDER);
    } catch (e) {
      logger.warn('State updates of Storybook preview hooks work only in browser');
    }
  }
}

function useStateLike<S>(
  name: string,
  initialState: (() => S) | S
): [S, (update: ((prevState: S) => S) | S) => void] {
  const stateRef = useRefLike(
    name,
    // @ts-ignore S type should never be function, but there's no way to tell that to TypeScript
    typeof initialState === 'function' ? initialState() : initialState
  );
  const setState = (update: ((prevState: S) => S) | S) => {
    // @ts-ignore S type should never be function, but there's no way to tell that to TypeScript
    stateRef.current = typeof update === 'function' ? update(stateRef.current) : update;
    triggerUpdate();
  };
  return [stateRef.current, setState];
}

/* Returns a stateful value, and a function to update it, see https://reactjs.org/docs/hooks-reference.html#usestate */
export function useState<S>(
  initialState: (() => S) | S
): [S, (update: ((prevState: S) => S) | S) => void] {
  return useStateLike('useState', initialState);
}

/* A redux-like alternative to useState, see https://reactjs.org/docs/hooks-reference.html#usereducer */
export function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
): [S, (action: A) => void];
export function useReducer<S, I, A>(
  reducer: (state: S, action: A) => S,
  initialArg: I,
  init: (initialArg: I) => S
): [S, (action: A) => void];
export function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialArg: any,
  init?: any
): [S, (action: A) => void] {
  const initialState: (() => S) | S = init != null ? () => init(initialArg) : initialArg;
  const [state, setState] = useStateLike('useReducer', initialState);
  const dispatch = (action: A) => setState((prevState) => reducer(prevState, action));
  return [state, dispatch];
}

/*
  Triggers a side effect, see https://reactjs.org/docs/hooks-reference.html#usestate
  Effects are triggered synchronously after rendering the story
*/
export function useEffect(create: () => (() => void) | void, deps?: any[]): void {
  const hooks = getHooksContextOrThrow();
  const effect = useMemoLike('useEffect', () => ({ create }), deps);
  if (!hooks.currentEffects.includes(effect)) {
    hooks.currentEffects.push(effect);
  }
}

export interface Listener {
  (...args: any[]): void;
}

export interface EventMap {
  [eventId: string]: Listener;
}

/* Accepts a map of Storybook channel event listeners, returns an emit function */
export function useChannel(eventMap: EventMap, deps: any[] = []) {
  const channel = addons.getChannel();

  useEffect(() => {
    Object.entries(eventMap).forEach(([type, listener]) => channel.on(type, listener));
    return () => {
      Object.entries(eventMap).forEach(([type, listener]) =>
        channel.removeListener(type, listener)
      );
    };
  }, [...Object.keys(eventMap), ...deps]);

  return useCallback(channel.emit.bind(channel), [channel]);
}

/* Returns current story context */
export function useStoryContext(): StoryContext {
  const { currentContext } = getHooksContextOrThrow();
  if (currentContext == null) {
    throw invalidHooksError();
  }

  return currentContext;
}

/* Returns current value of a story parameter */
export function useParameter<S>(parameterKey: string, defaultValue?: S): S | undefined {
  const { parameters } = useStoryContext();
  if (parameterKey) {
    return parameters[parameterKey] || (defaultValue as S);
  }
  return undefined;
}

/* Returns current value of story args */
export function useArgs(): [Args, (newArgs: Args) => void, (argNames?: [string]) => void] {
  const channel = addons.getChannel();
  const { id: storyId, args } = useStoryContext();

  const updateArgs = useCallback(
    (updatedArgs: Args) => channel.emit(UPDATE_STORY_ARGS, { storyId, updatedArgs }),
    [channel, storyId]
  );

  const resetArgs = useCallback(
    (argNames?: [string]) => channel.emit(RESET_STORY_ARGS, { storyId, argNames }),
    [channel, storyId]
  );

  return [args, updateArgs, resetArgs];
}

/* Returns current value of global args */
export function useGlobals(): [Args, (newGlobals: Args) => void] {
  const channel = addons.getChannel();
  const { globals } = useStoryContext();

  const updateGlobals = useCallback(
    (newGlobals: Args) => channel.emit(UPDATE_GLOBALS, { globals: newGlobals }),
    [channel]
  );

  return [globals, updateGlobals];
}

export { useDOMRect } from './hooks/use-dom-rect/useDOMRect';
