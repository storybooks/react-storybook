/* eslint-disable no-underscore-dangle */
import createChannel from '@storybook/channel-postmessage';
import { toId } from '@storybook/csf';
import { addons, mockChannel } from '@storybook/addons';
import Events from '@storybook/core-events';

import { StoryStore } from './story_store';
import { defaultDecorateStory } from './decorators';

jest.mock('@storybook/node-logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

let channel;
beforeEach(() => {
  channel = createChannel({ page: 'preview' });
});

function addReverseSorting(store) {
  store.addGlobalMetadata({
    decorators: [],
    parameters: {
      options: {
        // Test function does reverse alphabetical ordering.
        storySort: (a: any, b: any): number =>
          a[1].kind === b[1].kind
            ? 0
            : -1 * a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
      },
    },
  });
}

// make a story and add it to the store
const addStoryToStore = (store, kind, name, storyFn, parameters = {}) =>
  store.addStory(
    {
      kind,
      name,
      storyFn,
      parameters,
      id: toId(kind, name),
    },
    {
      // FIXME: need applyHooks, but this breaks the current tests
      applyDecorators: defaultDecorateStory,
    }
  );

describe('preview.story_store', () => {
  describe('extract', () => {
    it('produces stories objects with inherited (denormalized) metadata', () => {
      const store = new StoryStore({ channel });

      store.addGlobalMetadata({ parameters: { global: 'global' }, decorators: [] });

      store.addKindMetadata('a', { parameters: { kind: 'kind' }, decorators: [] });

      addStoryToStore(store, 'a', '1', () => 0, { story: 'story' });
      addStoryToStore(store, 'a', '2', () => 0);
      addStoryToStore(store, 'b', '1', () => 0);

      const extracted = store.extract();

      // We need exact key ordering, even if in theory JS doesn't guarantee it
      expect(Object.keys(extracted)).toEqual(['a--1', 'a--2', 'b--1']);

      // content of item should be correct
      expect(extracted['a--1']).toMatchObject({
        id: 'a--1',
        kind: 'a',
        name: '1',
        parameters: { global: 'global', kind: 'kind', story: 'story' },
      });
    });
  });

  describe('getDataForManager', () => {
    it('produces stories objects with normalized metadata', () => {
      const store = new StoryStore({ channel });

      store.addGlobalMetadata({ parameters: { global: 'global' }, decorators: [] });

      store.addKindMetadata('a', { parameters: { kind: 'kind' }, decorators: [] });

      addStoryToStore(store, 'a', '1', () => 0, { story: 'story' });

      const { v, globalParameters, kindParameters, stories } = store.getDataForManager();

      expect(v).toBe(2);
      expect(globalParameters).toEqual({ global: 'global' });
      expect(Object.keys(kindParameters)).toEqual(['a']);
      expect(kindParameters.a).toEqual({ kind: 'kind' });

      expect(Object.keys(stories)).toEqual(['a--1']);
      expect(stories['a--1']).toMatchObject({
        id: 'a--1',
        kind: 'a',
        name: '1',
        parameters: { story: 'story' },
      });
    });
  });

  describe('getStoriesJsonData', () => {
    it('produces stories objects with normalized metadata', () => {
      const store = new StoryStore({ channel });

      store.addGlobalMetadata({ parameters: { global: 'global' }, decorators: [] });

      store.addKindMetadata('a', { parameters: { kind: 'kind' }, decorators: [] });

      addStoryToStore(store, 'a', '1', () => 0, { story: 'story' });

      const { v, globalParameters, kindParameters, stories } = store.getStoriesJsonData();

      expect(v).toBe(2);
      expect(globalParameters).toEqual({});
      expect(kindParameters).toEqual({ a: {} });
      expect(kindParameters.a).toEqual({});

      expect(Object.keys(stories)).toEqual(['a--1']);
      expect(stories['a--1']).toMatchObject({
        id: 'a--1',
        kind: 'a',
        name: '1',
        parameters: { __isArgsStory: false },
      });
    });
  });

  describe('getRawStory', () => {
    it('produces a story with inherited decorators applied', () => {
      const store = new StoryStore({ channel });

      const globalDecorator = jest.fn().mockImplementation((s) => s());
      store.addGlobalMetadata({ parameters: {}, decorators: [globalDecorator] });

      const kindDecorator = jest.fn().mockImplementation((s) => s());
      store.addKindMetadata('a', { parameters: {}, decorators: [kindDecorator] });

      const story = jest.fn();
      addStoryToStore(store, 'a', '1', story);

      const context = store.getRawStory('a', '1');
      context.getDecorated()(context);

      expect(globalDecorator).toHaveBeenCalled();
      expect(kindDecorator).toHaveBeenCalled();
      expect(story).toHaveBeenCalled();
    });
  });

  describe('args', () => {
    it('composes component-level and story-level args, favoring story-level', () => {
      const store = new StoryStore({ channel });
      store.addKindMetadata('a', {
        parameters: { args: { arg1: 1, arg2: 2, arg3: 3, arg4: { complex: 'object' } } },
      });
      addStoryToStore(store, 'a', '1', () => 0, {
        args: {
          arg1: 4,
          arg2: undefined,
          arg4: { other: 'object ' },
        },
      });
      expect(store.getRawStory('a', '1').args).toEqual({
        arg1: 4,
        arg2: undefined,
        arg3: 3,
        arg4: { other: 'object ' },
      });
    });

    it('is initialized to the value stored in parameters.args[name] || parameters.argType[name].defaultValue', () => {
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'a', '1', () => 0, {
        argTypes: {
          arg1: { defaultValue: 'arg1' },
          arg2: { defaultValue: 2 },
          arg3: { defaultValue: { complex: { object: ['type'] } } },
          arg4: {},
          arg5: {},
          arg6: { defaultValue: 0 }, // See https://github.com/storybookjs/storybook/issues/12767
        },
        args: {
          arg2: 3,
          arg4: 'foo',
          arg7: false,
        },
      });
      expect(store.getRawStory('a', '1').args).toEqual({
        arg1: 'arg1',
        arg2: 3,
        arg3: { complex: { object: ['type'] } },
        arg4: 'foo',
        arg6: 0,
        arg7: false,
      });
    });

    it('automatically infers argTypes based on args', () => {
      const store = new StoryStore({ channel });
      store.startConfiguring();
      addStoryToStore(store, 'a', '1', () => 0, {
        args: {
          arg1: 3,
          arg2: 'foo',
          arg3: false,
        },
      });
      expect(store.getRawStory('a', '1').argTypes).toEqual({
        arg1: { name: 'arg1', type: { name: 'number' } },
        arg2: { name: 'arg2', type: { name: 'string' } },
        arg3: { name: 'arg3', type: { name: 'boolean' } },
      });
    });

    it('updateStoryArgs changes the args of a story, per-key', () => {
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'a', '1', () => 0);
      expect(store.getRawStory('a', '1').args).toEqual({});

      store.updateStoryArgs('a--1', { foo: 'bar' });
      expect(store.getRawStory('a', '1').args).toEqual({ foo: 'bar' });

      store.updateStoryArgs('a--1', { baz: 'bing' });
      expect(store.getRawStory('a', '1').args).toEqual({ foo: 'bar', baz: 'bing' });
    });

    it('is passed to the story in the context', () => {
      const storyFn = jest.fn();
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'a', '1', storyFn, { passArgsFirst: false });
      store.updateStoryArgs('a--1', { foo: 'bar' });
      store.getRawStory('a', '1').storyFn();

      expect(storyFn).toHaveBeenCalledWith(
        expect.objectContaining({
          args: { foo: 'bar' },
        })
      );
    });

    it('mapping changes arg values that are passed to the story in the context', () => {
      const storyFn = jest.fn();
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'a', '1', storyFn, {
        argTypes: {
          one: { mapping: { 1: 'mapped' } },
          two: { mapping: { 1: 'no match' } },
        },
        args: { one: 1, two: 2, three: 3 },
      });
      store.getRawStory('a', '1').storyFn();

      expect(storyFn).toHaveBeenCalledWith(
        { one: 'mapped', two: 2, three: 3 },
        expect.objectContaining({ args: { one: 'mapped', two: 2, three: 3 } })
      );
    });

    it('updateStoryArgs emits STORY_ARGS_UPDATED', () => {
      const onArgsChangedChannel = jest.fn();
      const testChannel = mockChannel();
      testChannel.on(Events.STORY_ARGS_UPDATED, onArgsChangedChannel);

      const store = new StoryStore({ channel: testChannel });
      addStoryToStore(store, 'a', '1', () => 0);

      store.updateStoryArgs('a--1', { foo: 'bar' });
      expect(onArgsChangedChannel).toHaveBeenCalledWith({ storyId: 'a--1', args: { foo: 'bar' } });

      store.updateStoryArgs('a--1', { baz: 'bing' });
      expect(onArgsChangedChannel).toHaveBeenCalledWith({
        storyId: 'a--1',
        args: { foo: 'bar', baz: 'bing' },
      });
    });

    it('should update if the UPDATE_STORY_ARGS event is received', () => {
      const testChannel = mockChannel();
      const store = new StoryStore({ channel: testChannel });
      addStoryToStore(store, 'a', '1', () => 0);

      testChannel.emit(Events.UPDATE_STORY_ARGS, { storyId: 'a--1', updatedArgs: { foo: 'bar' } });

      expect(store.getRawStory('a', '1').args).toEqual({ foo: 'bar' });
    });

    it('passes args as the first argument to the story if `parameters.passArgsFirst` is true', () => {
      const store = new StoryStore({ channel });

      store.addKindMetadata('a', {
        parameters: {
          argTypes: {
            a: { defaultValue: 1 },
          },
        },
        decorators: [],
      });

      const storyOne = jest.fn();
      addStoryToStore(store, 'a', '1', storyOne, { passArgsFirst: false });

      store.getRawStory('a', '1').storyFn();
      expect(storyOne).toHaveBeenCalledWith(
        expect.objectContaining({
          args: { a: 1 },
          parameters: expect.objectContaining({}),
        })
      );

      const storyTwo = jest.fn();
      addStoryToStore(store, 'a', '2', storyTwo, { passArgsFirst: true });
      store.getRawStory('a', '2').storyFn();
      expect(storyTwo).toHaveBeenCalledWith(
        { a: 1 },
        expect.objectContaining({
          args: { a: 1 },
          parameters: expect.objectContaining({}),
        })
      );
    });

    it('resetStoryArgs resets a single arg', () => {
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'a', '1', () => 0);
      expect(store.getRawStory('a', '1').args).toEqual({});

      store.updateStoryArgs('a--1', { foo: 'bar', bar: 'baz' });
      expect(store.getRawStory('a', '1').args).toEqual({ foo: 'bar', bar: 'baz' });

      store.resetStoryArgs('a--1', ['foo']);
      expect(store.getRawStory('a', '1').args).toEqual({ bar: 'baz' });
    });

    it('resetStoryArgs resets all args', () => {
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'a', '1', () => 0);
      expect(store.getRawStory('a', '1').args).toEqual({});

      store.updateStoryArgs('a--1', { foo: 'bar', bar: 'baz' });
      expect(store.getRawStory('a', '1').args).toEqual({ foo: 'bar', bar: 'baz' });

      store.resetStoryArgs('a--1');
      expect(store.getRawStory('a', '1').args).toEqual({});
    });

    it('resetStoryArgs emits STORY_ARGS_UPDATED', () => {
      const onArgsChangedChannel = jest.fn();
      const testChannel = mockChannel();
      testChannel.on(Events.STORY_ARGS_UPDATED, onArgsChangedChannel);

      const store = new StoryStore({ channel: testChannel });
      addStoryToStore(store, 'a', '1', () => 0);

      store.updateStoryArgs('a--1', { foo: 'bar' });
      expect(onArgsChangedChannel).toHaveBeenCalledWith({ storyId: 'a--1', args: { foo: 'bar' } });

      store.resetStoryArgs('a--1');
      expect(onArgsChangedChannel).toHaveBeenCalledWith({
        storyId: 'a--1',
        args: {},
      });
    });

    it('should reset if the RESET_STORY_ARGS event is received', () => {
      const testChannel = mockChannel();
      const store = new StoryStore({ channel: testChannel });
      addStoryToStore(store, 'a', '1', () => 0);

      store.updateStoryArgs('a--1', { foo: 'bar', bar: 'baz' });

      testChannel.emit(Events.RESET_STORY_ARGS, { storyId: 'a--1', argNames: ['foo'] });
      expect(store.getRawStory('a', '1').args).toEqual({ bar: 'baz' });

      testChannel.emit(Events.RESET_STORY_ARGS, { storyId: 'a--1' });
      expect(store.getRawStory('a', '1').args).toEqual({});
    });
  });

  describe('globals', () => {
    it('is initialized to the value stored in parameters.globals on the first story', () => {
      const store = new StoryStore({ channel });
      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          globals: {
            arg1: 'arg1',
            arg2: 2,
            arg3: { complex: { object: ['type'] } },
          },
        },
      });
      addStoryToStore(store, 'a', '1', () => 0);
      store.finishConfiguring();
      expect(store.getRawStory('a', '1').globals).toEqual({
        arg1: 'arg1',
        arg2: 2,
        arg3: { complex: { object: ['type'] } },
      });
    });

    it('is initialized to the default values stored in parameters.globalsTypes on the first story', () => {
      const store = new StoryStore({ channel });
      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          globals: {
            arg1: 'arg1',
            arg2: 2,
          },
          globalTypes: {
            arg2: { defaultValue: 'arg2' },
            arg3: { defaultValue: { complex: { object: ['type'] } } },
          },
        },
      });
      addStoryToStore(store, 'a', '1', () => 0);
      store.finishConfiguring();
      expect(store.getRawStory('a', '1').globals).toEqual({
        // NOTE: we keep arg1, even though it doesn't have a globalArgType
        arg1: 'arg1',
        arg2: 2,
        arg3: { complex: { object: ['type'] } },
      });
    });

    it('on HMR it sensibly re-initializes with memory', () => {
      const store = new StoryStore({ channel });
      addons.setChannel(channel);
      store.startConfiguring();
      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          globals: {
            arg1: 'arg1',
            arg2: 2,
            arg4: 4,
          },
          globalTypes: {
            arg2: { defaultValue: 'arg2' },
            arg3: { defaultValue: { complex: { object: ['type'] } } },
            arg4: {},
          },
        },
      });
      addStoryToStore(store, 'a', '1', () => 0);
      store.finishConfiguring();

      expect(store.getRawStory('a', '1').globals).toEqual({
        // We keep arg1, even though it doesn't have a globalArgType, as it is set in globals
        arg1: 'arg1',
        // We use the value of arg2 that was set in globals
        arg2: 2,
        arg3: { complex: { object: ['type'] } },
        arg4: 4,
      });
      expect(store._argTypesEnhancers.length).toBe(3);

      // HMR
      store.startConfiguring();
      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          globals: {
            arg2: 3,
          },
          globalTypes: {
            arg2: { defaultValue: 'arg2' },
            arg3: { defaultValue: { complex: { object: ['changed'] } } },
            // XXX: note this currently wouldn't fail because parameters.globals.arg4 isn't cleared
            // due to #10005, see below
            arg4: {}, // has no default value set but we need to make sure we don't lose it
            arg5: { defaultValue: 'new' },
          },
        },
      });
      store.finishConfiguring();
      expect(store._argTypesEnhancers.length).toBe(3);

      expect(store.getRawStory('a', '1').globals).toEqual({
        // You cannot remove a global arg in HMR currently, because you cannot remove the
        // parameter (see https://github.com/storybookjs/storybook/issues/10005)
        arg1: 'arg1',
        // We should keep the previous values because we cannot tell if the user changed it or not in the UI
        // and we don't want to revert to the defaults every HMR
        arg2: 2,
        arg3: { complex: { object: ['type'] } },
        arg4: 4,
        // We take the new value here as it wasn't defined before
        arg5: 'new',
      });
    });

    it('sensibly re-initializes with memory based on session storage', () => {
      const store = new StoryStore({ channel });
      store.setSelectionSpecifier({
        storySpecifier: '*',
        viewMode: 'story',
        globals: {
          arg1: 'arg1',
          arg2: 2,
          arg3: { complex: { object: ['type'] } },
          arg4: 4,
        },
      });
      addons.setChannel(channel);

      addStoryToStore(store, 'a', '1', () => 0);
      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          globals: {
            arg2: 3,
          },
          globalTypes: {
            arg2: { defaultValue: 'arg2' },
            arg3: { defaultValue: { complex: { object: ['changed'] } } },
            arg4: {}, // has no default value set but we need to make sure we don't lose it
            arg5: { defaultValue: 'new' },
          },
        },
      });
      store.finishConfiguring();

      expect(store.getRawStory('a', '1').globals).toEqual({
        // We should keep the previous values because we cannot tell if the user changed it or not in the UI
        // and we don't want to revert to the defaults every HMR
        // arg1 is missing because it's not one of allowedGlobals
        arg2: 2,
        arg3: { complex: { object: ['type'] } },
        arg4: 4,
        // We take the new value here as it wasn't defined before
        arg5: 'new',
      });
    });

    it('updateGlobals changes the global args', () => {
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'a', '1', () => 0);
      expect(store.getRawStory('a', '1').globals).toEqual({});

      store.updateGlobals({ foo: 'bar' });
      expect(store.getRawStory('a', '1').globals).toEqual({ foo: 'bar' });

      store.updateGlobals({ baz: 'bing' });
      expect(store.getRawStory('a', '1').globals).toEqual({ foo: 'bar', baz: 'bing' });
    });

    it('is passed to the story in the context', () => {
      const storyFn = jest.fn();
      const store = new StoryStore({ channel });

      store.updateGlobals({ foo: 'bar' });
      addStoryToStore(store, 'a', '1', storyFn, { passArgsFirst: false });
      store.getRawStory('a', '1').storyFn();

      expect(storyFn).toHaveBeenCalledWith(
        expect.objectContaining({
          globals: { foo: 'bar' },
        })
      );

      store.updateGlobals({ baz: 'bing' });
      store.getRawStory('a', '1').storyFn();

      expect(storyFn).toHaveBeenCalledWith(
        expect.objectContaining({
          globals: { foo: 'bar', baz: 'bing' },
        })
      );
    });

    it('updateGlobals emits GLOBALS_UPDATED', () => {
      const onGlobalsChangedChannel = jest.fn();
      const testChannel = mockChannel();
      testChannel.on(Events.GLOBALS_UPDATED, onGlobalsChangedChannel);

      const store = new StoryStore({ channel: testChannel });
      addStoryToStore(store, 'a', '1', () => 0);
      store.addGlobalMetadata({
        parameters: {
          globalTypes: {
            foo: { defaultValue: 'Foo' },
            bar: { defaultValue: 'Bar' },
          },
          globals: { baz: 'Baz', qux: 'Qux' },
        },
      });
      store.finishConfiguring();

      store.updateGlobals({ foo: 'FUD' });
      expect(onGlobalsChangedChannel).toHaveBeenCalledWith({
        globals: { foo: 'FUD', bar: 'Bar', baz: 'Baz', qux: 'Qux' },
        initialGlobals: { foo: 'Foo', bar: 'Bar', baz: 'Baz', qux: 'Qux' },
      });

      store.updateGlobals({ baz: 'BING' });
      expect(onGlobalsChangedChannel).toHaveBeenCalledWith({
        globals: { foo: 'FUD', bar: 'Bar', baz: 'BING', qux: 'Qux' },
        initialGlobals: { foo: 'Foo', bar: 'Bar', baz: 'Baz', qux: 'Qux' },
      });
    });

    it('should update if the UPDATE_GLOBALS event is received', () => {
      const testChannel = mockChannel();
      const store = new StoryStore({ channel: testChannel });
      addStoryToStore(store, 'a', '1', () => 0);

      testChannel.emit(Events.UPDATE_GLOBALS, { globals: { foo: 'bar' } });

      expect(store.getRawStory('a', '1').globals).toEqual({ foo: 'bar' });
    });

    it('DOES NOT pass globals as the first argument to the story if `parameters.passArgsFirst` is true', () => {
      const store = new StoryStore({ channel });

      const storyOne = jest.fn();
      addStoryToStore(store, 'a', '1', storyOne, { passArgsFirst: false });

      store.updateGlobals({ foo: 'bar' });

      store.getRawStory('a', '1').storyFn();
      expect(storyOne).toHaveBeenCalledWith(
        expect.objectContaining({
          globals: { foo: 'bar' },
        })
      );

      const storyTwo = jest.fn();
      addStoryToStore(store, 'a', '2', storyTwo, { passArgsFirst: true });
      store.getRawStory('a', '2').storyFn();
      expect(storyTwo).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          globals: { foo: 'bar' },
        })
      );
    });
  });

  describe('argsEnhancer', () => {
    it('allows you to add args', () => {
      const store = new StoryStore({ channel });

      const enhancer = jest.fn((context) => ({ c: 'd' }));
      store.addArgsEnhancer(enhancer);

      addStoryToStore(store, 'a', '1', (args: any) => 0, { args: { a: 'b' } });

      expect(enhancer).toHaveBeenCalledWith(expect.objectContaining({ args: { a: 'b' } }));
      expect(store.getRawStory('a', '1').args).toEqual({ a: 'b', c: 'd' });
    });

    it('does not pass result of earlier enhancers into subsequent ones, but composes their output', () => {
      const store = new StoryStore({ channel });

      const enhancerOne = jest.fn((context) => ({ c: 'd' }));
      store.addArgsEnhancer(enhancerOne);

      const enhancerTwo = jest.fn((context) => ({ e: 'f' }));
      store.addArgsEnhancer(enhancerTwo);

      addStoryToStore(store, 'a', '1', (args: any) => 0, { args: { a: 'b' } });

      expect(enhancerOne).toHaveBeenCalledWith(expect.objectContaining({ args: { a: 'b' } }));
      expect(enhancerTwo).toHaveBeenCalledWith(expect.objectContaining({ args: { a: 'b' } }));
      expect(store.getRawStory('a', '1').args).toEqual({ a: 'b', c: 'd', e: 'f' });
    });
  });

  describe('argTypesEnhancer', () => {
    it('records when the given story processes args', () => {
      const store = new StoryStore({ channel });

      const enhancer = jest.fn((context) => ({ ...context.parameters.argTypes, c: 'd' }));
      store.addArgTypesEnhancer(enhancer);

      addStoryToStore(store, 'a', '1', (args: any) => 0, { argTypes: { a: 'b' } });

      expect(enhancer).toHaveBeenCalledWith(
        expect.objectContaining({ parameters: { __isArgsStory: true, argTypes: { a: 'b' } } })
      );
      expect(store.getRawStory('a', '1').parameters.argTypes).toEqual({ a: 'b', c: 'd' });
    });

    it('allows you to alter argTypes when stories are added', () => {
      const store = new StoryStore({ channel });

      const enhancer = jest.fn((context) => ({ ...context.parameters.argTypes, c: 'd' }));
      store.addArgTypesEnhancer(enhancer);

      addStoryToStore(store, 'a', '1', () => 0, { argTypes: { a: 'b' } });

      expect(enhancer).toHaveBeenCalledWith(
        expect.objectContaining({ parameters: { __isArgsStory: false, argTypes: { a: 'b' } } })
      );
      expect(store.getRawStory('a', '1').parameters.argTypes).toEqual({ a: 'b', c: 'd' });
    });

    it('recursively passes argTypes to successive enhancers', () => {
      const store = new StoryStore({ channel });

      const firstEnhancer = jest.fn((context) => ({ ...context.parameters.argTypes, c: 'd' }));
      store.addArgTypesEnhancer(firstEnhancer);
      const secondEnhancer = jest.fn((context) => ({ ...context.parameters.argTypes, e: 'f' }));
      store.addArgTypesEnhancer(secondEnhancer);

      addStoryToStore(store, 'a', '1', () => 0, { argTypes: { a: 'b' } });

      expect(firstEnhancer).toHaveBeenCalledWith(
        expect.objectContaining({ parameters: { __isArgsStory: false, argTypes: { a: 'b' } } })
      );
      expect(secondEnhancer).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: { __isArgsStory: false, argTypes: { a: 'b', c: 'd' } },
        })
      );
      expect(store.getRawStory('a', '1').parameters.argTypes).toEqual({ a: 'b', c: 'd', e: 'f' });
    });

    it('does not merge argType enhancer results', () => {
      const store = new StoryStore({ channel });

      const enhancer = jest.fn().mockReturnValue({ c: 'd' });
      store.addArgTypesEnhancer(enhancer);

      addStoryToStore(store, 'a', '1', () => 0, { argTypes: { a: 'b' } });

      expect(enhancer).toHaveBeenCalledWith(
        expect.objectContaining({ parameters: { __isArgsStory: false, argTypes: { a: 'b' } } })
      );
      expect(store.getRawStory('a', '1').parameters.argTypes).toEqual({ c: 'd' });
    });

    it('allows you to alter argTypes when stories are re-added', () => {
      const store = new StoryStore({ channel });
      addons.setChannel(channel);

      const enhancer = jest.fn((context) => ({ ...context.parameters.argTypes, c: 'd' }));
      store.addArgTypesEnhancer(enhancer);

      addStoryToStore(store, 'a', '1', () => 0, { argTypes: { a: 'b' } });

      enhancer.mockClear();
      store.removeStoryKind('a');

      addStoryToStore(store, 'a', '1', () => 0, { argTypes: { e: 'f' } });
      expect(enhancer).toHaveBeenCalledWith(
        expect.objectContaining({ parameters: { __isArgsStory: false, argTypes: { e: 'f' } } })
      );
      expect(store.getRawStory('a', '1').parameters.argTypes).toEqual({ e: 'f', c: 'd' });
    });

    it('automatically infers argTypes from args', () => {
      const store = new StoryStore({ channel });
      store.startConfiguring();
      addStoryToStore(store, 'a', '1', () => 0, { args: { a: null, b: 'hello', c: 9 } });
      expect(store.getRawStory('a', '1').parameters.argTypes).toMatchInlineSnapshot(`
        Object {
          "a": Object {
            "name": "a",
            "type": Object {
              "name": "object",
              "value": Object {},
            },
          },
          "b": Object {
            "name": "b",
            "type": Object {
              "name": "string",
            },
          },
          "c": Object {
            "name": "c",
            "type": Object {
              "name": "number",
            },
          },
        }
      `);
    });

    it('adds user and default enhancers', () => {
      const store = new StoryStore({ channel });
      expect(store._argTypesEnhancers.length).toBe(1);

      const enhancer = () => ({});
      store.addArgTypesEnhancer(enhancer);
      expect(store._argTypesEnhancers.length).toBe(2);

      store.startConfiguring();
      expect(store._argTypesEnhancers.length).toBe(4);

      addStoryToStore(store, 'a', '1', () => 0);
      addStoryToStore(store, 'a', '2', () => 0);
      store.finishConfiguring();
      expect(store._argTypesEnhancers.length).toBe(4);
    });
  });

  describe('selection specifiers', () => {
    describe('if you use *', () => {
      it('selects the first story in the store', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({ storySpecifier: '*', viewMode: 'story' });

        addStoryToStore(store, 'a', '1', () => 0);
        addStoryToStore(store, 'a', '2', () => 0);
        addStoryToStore(store, 'b', '1', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual({ storyId: 'a--1', viewMode: 'story' });
      });

      it('takes into account sorting', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({ storySpecifier: '*', viewMode: 'story' });
        addReverseSorting(store);

        addStoryToStore(store, 'a', '1', () => 0);
        addStoryToStore(store, 'a', '2', () => 0);
        addStoryToStore(store, 'b', '1', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual({ storyId: 'b--1', viewMode: 'story' });
      });

      it('selects nothing if there are no stories', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({ storySpecifier: '*', viewMode: 'story' });
        store.finishConfiguring();

        expect(store.getSelection()).toEqual(undefined);
      });
    });

    describe('if you use a component or group id', () => {
      it('selects the first story for the component', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({ storySpecifier: 'b', viewMode: 'story' });

        addStoryToStore(store, 'a', '1', () => 0);
        addStoryToStore(store, 'a', '2', () => 0);
        addStoryToStore(store, 'b', '1', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual({ storyId: 'b--1', viewMode: 'story' });
      });

      it('selects the first story for the group', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({ storySpecifier: 'g2', viewMode: 'story' });

        addStoryToStore(store, 'g1/a', '1', () => 0);
        addStoryToStore(store, 'g2/a', '1', () => 0);
        addStoryToStore(store, 'g2/b', '1', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual({ storyId: 'g2-a--1', viewMode: 'story' });
      });

      // Making sure the fix #11571 doesn't break this
      it('selects the first story if there are two stories in the group of different lengths', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({ storySpecifier: 'a', viewMode: 'story' });
        addStoryToStore(store, 'a', 'long-long-long', () => 0);
        addStoryToStore(store, 'a', 'short', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual({ storyId: 'a--long-long-long', viewMode: 'story' });
      });

      it('selects nothing if the component or group does not exist', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({ storySpecifier: 'c', viewMode: 'story' });

        addStoryToStore(store, 'a', '1', () => 0);
        addStoryToStore(store, 'a', '2', () => 0);
        addStoryToStore(store, 'b', '1', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual(undefined);
      });
    });

    describe('if you use a storyId', () => {
      it('selects a specific story', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({ storySpecifier: 'a--2', viewMode: 'story' });
        addStoryToStore(store, 'a', '1', () => 0);
        addStoryToStore(store, 'a', '2', () => 0);
        addStoryToStore(store, 'b', '1', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual({ storyId: 'a--2', viewMode: 'story' });
      });

      it('selects nothing if you the story does not exist', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({ storySpecifier: 'a--3', viewMode: 'story' });
        addStoryToStore(store, 'a', '1', () => 0);
        addStoryToStore(store, 'a', '2', () => 0);
        addStoryToStore(store, 'b', '1', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual(undefined);
      });

      // See #11571
      it('does NOT select an earlier story that this story id is a prefix of', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({ storySpecifier: 'a--3', viewMode: 'story' });
        addStoryToStore(store, 'a', '31', () => 0);
        addStoryToStore(store, 'a', '3', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual({ storyId: 'a--3', viewMode: 'story' });
      });
    });

    describe('with args', () => {
      it('overrides args on the story', () => {
        const store = new StoryStore({ channel });
        const argTypes = {
          a: { type: { name: 'number' }, defaultValue: 1 },
          b: { type: { name: 'number' }, defaultValue: 2 },
          c: { type: { name: 'boolean' } },
        };
        store.setSelectionSpecifier({
          storySpecifier: 'a--1',
          viewMode: 'story',
          args: {
            a: 2,
            b: 'two',
            c: 'true',
          },
        });
        addStoryToStore(store, 'a', '1', () => 0, { argTypes });
        store.finishConfiguring();

        expect(store._stories['a--1'].args).toEqual({ a: 2, b: NaN, c: true });
      });
    });

    describe('if you use no specifier', () => {
      it('selects nothing', () => {
        const store = new StoryStore({ channel });
        addStoryToStore(store, 'a', '1', () => 0);
        addStoryToStore(store, 'a', '2', () => 0);
        addStoryToStore(store, 'b', '1', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual(undefined);
      });
    });

    describe('HMR behaviour', () => {
      it('retains successful selection', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({ storySpecifier: 'a--1', viewMode: 'story' });
        addStoryToStore(store, 'a', '1', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual({ storyId: 'a--1', viewMode: 'story' });

        store.startConfiguring();
        store.removeStoryKind('a');
        addStoryToStore(store, 'a', '1', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual({ storyId: 'a--1', viewMode: 'story' });
      });

      it('tries again with a specifier if it failed the first time', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({ storySpecifier: 'a--2', viewMode: 'story' });
        addStoryToStore(store, 'a', '1', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual(undefined);

        store.startConfiguring();
        store.removeStoryKind('a');
        addStoryToStore(store, 'a', '1', () => 0);
        addStoryToStore(store, 'a', '2', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual({ storyId: 'a--2', viewMode: 'story' });
      });

      it('DOES NOT try again if the selection changed in the meantime', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({ storySpecifier: 'a--2', viewMode: 'story' });
        addStoryToStore(store, 'a', '1', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual(undefined);
        store.setSelection({ storyId: 'a--1', viewMode: 'story' });
        expect(store.getSelection()).toEqual({ storyId: 'a--1', viewMode: 'story' });

        store.startConfiguring();
        store.removeStoryKind('a');
        addStoryToStore(store, 'a', '1', () => 0);
        addStoryToStore(store, 'a', '2', () => 0);
        store.finishConfiguring();

        expect(store.getSelection()).toEqual({ storyId: 'a--1', viewMode: 'story' });
      });
    });
  });

  describe('storySort', () => {
    it('sorts stories using given function', () => {
      const store = new StoryStore({ channel });
      addReverseSorting(store);
      addStoryToStore(store, 'a/a', '1', () => 0);
      addStoryToStore(store, 'a/a', '2', () => 0);
      addStoryToStore(store, 'a/b', '1', () => 0);
      addStoryToStore(store, 'b/b1', '1', () => 0);
      addStoryToStore(store, 'b/b10', '1', () => 0);
      addStoryToStore(store, 'b/b9', '1', () => 0);
      addStoryToStore(store, 'c', '1', () => 0);

      const extracted = store.extract();

      expect(Object.keys(extracted)).toEqual([
        'c--1',
        'b-b10--1',
        'b-b9--1',
        'b-b1--1',
        'a-b--1',
        'a-a--1',
        'a-a--2',
      ]);
    });

    it('sorts stories alphabetically', () => {
      const store = new StoryStore({ channel });
      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          options: {
            storySort: {
              method: 'alphabetical',
            },
          },
        },
      });
      addStoryToStore(store, 'a/b', '1', () => 0);
      addStoryToStore(store, 'a/a', '2', () => 0);
      addStoryToStore(store, 'a/a', '1', () => 0);
      addStoryToStore(store, 'c', '1', () => 0);
      addStoryToStore(store, 'b/b10', '1', () => 0);
      addStoryToStore(store, 'b/b9', '1', () => 0);
      addStoryToStore(store, 'b/b1', '1', () => 0);

      const extracted = store.extract();

      expect(Object.keys(extracted)).toEqual([
        'a-a--2',
        'a-a--1',
        'a-b--1',
        'b-b1--1',
        'b-b9--1',
        'b-b10--1',
        'c--1',
      ]);
    });

    it('sorts stories in specified order or alphabetically', () => {
      const store = new StoryStore({ channel });
      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          options: {
            storySort: {
              method: 'alphabetical',
              order: ['b', ['bc', 'ba', 'bb'], 'a', 'c'],
            },
          },
        },
      });
      addStoryToStore(store, 'a/b', '1', () => 0);
      addStoryToStore(store, 'a', '1', () => 0);
      addStoryToStore(store, 'c', '1', () => 0);
      addStoryToStore(store, 'b/bd', '1', () => 0);
      addStoryToStore(store, 'b/bb', '1', () => 0);
      addStoryToStore(store, 'b/ba', '1', () => 0);
      addStoryToStore(store, 'b/bc', '1', () => 0);
      addStoryToStore(store, 'b', '1', () => 0);

      const extracted = store.extract();

      expect(Object.keys(extracted)).toEqual([
        'b--1',
        'b-bc--1',
        'b-ba--1',
        'b-bb--1',
        'b-bd--1',
        'a--1',
        'a-b--1',
        'c--1',
      ]);
    });

    it('sorts stories in specified order or alphabetically with wildcards', () => {
      const store = new StoryStore({ channel });
      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          options: {
            storySort: {
              method: 'alphabetical',
              order: ['b', ['bc', '*', 'bb'], '*', 'c'],
            },
          },
        },
      });
      addStoryToStore(store, 'a/b', '1', () => 0);
      addStoryToStore(store, 'a', '1', () => 0);
      addStoryToStore(store, 'c', '1', () => 0);
      addStoryToStore(store, 'b/bd', '1', () => 0);
      addStoryToStore(store, 'b/bb', '1', () => 0);
      addStoryToStore(store, 'b/ba', '1', () => 0);
      addStoryToStore(store, 'b/bc', '1', () => 0);
      addStoryToStore(store, 'b', '1', () => 0);

      const extracted = store.extract();

      expect(Object.keys(extracted)).toEqual([
        'b--1',
        'b-bc--1',
        'b-ba--1',
        'b-bd--1',
        'b-bb--1',
        'a--1',
        'a-b--1',
        'c--1',
      ]);
    });

    it('sorts stories in specified order or by configure order', () => {
      const store = new StoryStore({ channel });
      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          options: {
            storySort: {
              method: 'configure',
              order: ['b', 'a', 'c'],
            },
          },
        },
      });
      addStoryToStore(store, 'a/b', '1', () => 0);
      addStoryToStore(store, 'a', '1', () => 0);
      addStoryToStore(store, 'c', '1', () => 0);
      addStoryToStore(store, 'b/bd', '1', () => 0);
      addStoryToStore(store, 'b/bb', '1', () => 0);
      addStoryToStore(store, 'b/ba', '1', () => 0);
      addStoryToStore(store, 'b/bc', '1', () => 0);
      addStoryToStore(store, 'b', '1', () => 0);

      const extracted = store.extract();

      expect(Object.keys(extracted)).toEqual([
        'b--1',
        'b-bd--1',
        'b-bb--1',
        'b-ba--1',
        'b-bc--1',
        'a--1',
        'a-b--1',
        'c--1',
      ]);
    });

    it('sorts stories in specified order or by configure order with wildcard', () => {
      const store = new StoryStore({ channel });
      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          options: {
            storySort: {
              method: 'configure',
              order: ['b', '*', 'c'],
            },
          },
        },
      });
      addStoryToStore(store, 'a/b', '1', () => 0);
      addStoryToStore(store, 'a', '1', () => 0);
      addStoryToStore(store, 'c', '1', () => 0);
      addStoryToStore(store, 'b/bd', '1', () => 0);
      addStoryToStore(store, 'b/bb', '1', () => 0);
      addStoryToStore(store, 'b/ba', '1', () => 0);
      addStoryToStore(store, 'b/bc', '1', () => 0);
      addStoryToStore(store, 'b', '1', () => 0);
      addStoryToStore(store, 'e', '1', () => 0);
      addStoryToStore(store, 'd', '1', () => 0);

      const extracted = store.extract();

      expect(Object.keys(extracted)).toEqual([
        'b--1',
        'b-bd--1',
        'b-bb--1',
        'b-ba--1',
        'b-bc--1',
        'a--1',
        'a-b--1',
        'e--1',
        'd--1',
        'c--1',
      ]);
    });

    it('sorts stories in specified order including story names or configure', () => {
      const store = new StoryStore({ channel });
      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          options: {
            storySort: {
              method: 'configure',
              order: ['b', ['bc', 'ba', 'bb'], 'a', 'c'],
              includeNames: true,
            },
          },
        },
      });
      addStoryToStore(store, 'a/b', '1', () => 0);
      addStoryToStore(store, 'a', '2', () => 0);
      addStoryToStore(store, 'a', '1', () => 0);
      addStoryToStore(store, 'c', '1', () => 0);
      addStoryToStore(store, 'b/bd', '1', () => 0);
      addStoryToStore(store, 'b/bb', '1', () => 0);
      addStoryToStore(store, 'b/ba', '1', () => 0);
      addStoryToStore(store, 'b/bc', '1', () => 0);
      addStoryToStore(store, 'b', '1', () => 0);

      const extracted = store.extract();

      expect(Object.keys(extracted)).toEqual([
        'b-bc--1',
        'b-ba--1',
        'b-bb--1',
        'b-bd--1',
        'b--1',
        'a-b--1',
        'a--2',
        'a--1',
        'c--1',
      ]);
    });

    it('sorts stories in specified order including story names or alphabetically', () => {
      const store = new StoryStore({ channel });
      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          options: {
            storySort: {
              method: 'alphabetical',
              order: ['b', ['bc', 'ba', 'bb'], 'a', 'c'],
              includeNames: true,
            },
          },
        },
      });
      addStoryToStore(store, 'a/b', '1', () => 0);
      addStoryToStore(store, 'a', '2', () => 0);
      addStoryToStore(store, 'a', '1', () => 0);
      addStoryToStore(store, 'c', '1', () => 0);
      addStoryToStore(store, 'b/bd', '1', () => 0);
      addStoryToStore(store, 'b/bb', '1', () => 0);
      addStoryToStore(store, 'b/ba', '1', () => 0);
      addStoryToStore(store, 'b/bc', '1', () => 0);
      addStoryToStore(store, 'b', '1', () => 0);

      const extracted = store.extract();

      expect(Object.keys(extracted)).toEqual([
        'b-bc--1',
        'b-ba--1',
        'b-bb--1',
        'b--1',
        'b-bd--1',
        'a--1',
        'a--2',
        'a-b--1',
        'c--1',
      ]);
    });

    it('passes kind and global parameters to sort', () => {
      const store = new StoryStore({ channel });
      const storySort = jest.fn();
      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          options: {
            storySort,
          },
          global: 'global',
        },
      });
      store.addKindMetadata('a', { parameters: { kind: 'kind' }, decorators: [] });
      addStoryToStore(store, 'a', '1', () => 0, { story: '1' });
      addStoryToStore(store, 'a', '2', () => 0, { story: '2' });
      const extracted = store.extract();

      expect(storySort).toHaveBeenCalledWith(
        [
          'a--1',
          expect.objectContaining({
            parameters: expect.objectContaining({ story: '1' }),
          }),
          { kind: 'kind' },
          expect.objectContaining({ global: 'global' }),
        ],
        [
          'a--2',
          expect.objectContaining({
            parameters: expect.objectContaining({ story: '2' }),
          }),
          { kind: 'kind' },
          expect.objectContaining({ global: 'global' }),
        ]
      );
    });
  });

  describe('configuration', () => {
    it('does not allow addStory if not configuring, unless allowUsafe=true', () => {
      const store = new StoryStore({ channel });
      store.finishConfiguring();

      expect(() => addStoryToStore(store, 'a', '1', () => 0)).toThrow(
        'Cannot add a story when not configuring'
      );

      expect(() =>
        store.addStory(
          {
            kind: 'a',
            name: '1',
            storyFn: () => 0,
            parameters: {},
            id: 'a--1',
          },
          {
            applyDecorators: defaultDecorateStory,
            allowUnsafe: true,
          }
        )
      ).not.toThrow();
    });

    it('does not allow remove if not configuring, unless allowUsafe=true', () => {
      const store = new StoryStore({ channel });
      addons.setChannel(channel);
      addStoryToStore(store, 'a', '1', () => 0);
      store.finishConfiguring();

      expect(() => store.remove('a--1')).toThrow('Cannot remove a story when not configuring');
      expect(() => store.remove('a--1', { allowUnsafe: true })).not.toThrow();
    });

    it('does not allow removeStoryKind if not configuring, unless allowUsafe=true', () => {
      const store = new StoryStore({ channel });
      addons.setChannel(channel);
      addStoryToStore(store, 'a', '1', () => 0);
      store.finishConfiguring();

      expect(() => store.removeStoryKind('a')).toThrow('Cannot remove a kind when not configuring');
      expect(() => store.removeStoryKind('a', { allowUnsafe: true })).not.toThrow();
    });

    it('waits for configuration to be over before emitting SET_STORIES', () => {
      const onSetStories = jest.fn();
      channel.on(Events.SET_STORIES, onSetStories);
      const store = new StoryStore({ channel });

      addStoryToStore(store, 'a', '1', () => 0);
      expect(onSetStories).not.toHaveBeenCalled();

      store.finishConfiguring();
      expect(onSetStories).toHaveBeenCalledWith({
        v: 2,
        globals: {},
        globalParameters: {},
        kindParameters: { a: {} },
        stories: {
          'a--1': expect.objectContaining({
            id: 'a--1',
          }),
        },
      });
    });

    it('correctly emits globals with SET_STORIES', () => {
      const onSetStories = jest.fn();
      channel.on(Events.SET_STORIES, onSetStories);
      const store = new StoryStore({ channel });

      store.addGlobalMetadata({
        decorators: [],
        parameters: {
          globalTypes: {
            arg1: { defaultValue: 'arg1' },
          },
        },
      });

      addStoryToStore(store, 'a', '1', () => 0);
      expect(onSetStories).not.toHaveBeenCalled();

      store.finishConfiguring();
      expect(onSetStories).toHaveBeenCalledWith({
        v: 2,
        globals: { arg1: 'arg1' },
        globalParameters: {
          // NOTE: Currently globalArg[Types] are emitted as parameters but this may not remain
          globalTypes: {
            arg1: { defaultValue: 'arg1' },
          },
        },
        kindParameters: { a: {} },
        stories: {
          'a--1': expect.objectContaining({
            id: 'a--1',
          }),
        },
      });
    });

    it('emits an empty SET_STORIES if no stories were added during configuration', () => {
      const onSetStories = jest.fn();
      channel.on(Events.SET_STORIES, onSetStories);
      const store = new StoryStore({ channel });

      store.finishConfiguring();
      expect(onSetStories).toHaveBeenCalledWith({
        v: 2,
        globals: {},
        globalParameters: {},
        kindParameters: {},
        stories: {},
      });
    });

    it('allows configuration as second time (HMR)', () => {
      const onSetStories = jest.fn();
      channel.on(Events.SET_STORIES, onSetStories);
      const store = new StoryStore({ channel });
      store.finishConfiguring();

      onSetStories.mockClear();
      store.startConfiguring();
      addStoryToStore(store, 'a', '1', () => 0);
      store.finishConfiguring();

      expect(onSetStories).toHaveBeenCalledWith({
        v: 2,
        globals: {},
        globalParameters: {},
        kindParameters: { a: {} },
        stories: {
          'a--1': expect.objectContaining({
            id: 'a--1',
          }),
        },
      });
    });
  });

  describe('HMR behaviour', () => {
    it('emits the right things after removing a story', () => {
      const onSetStories = jest.fn();
      channel.on(Events.SET_STORIES, onSetStories);
      const store = new StoryStore({ channel });

      // For hooks
      addons.setChannel(channel);

      store.startConfiguring();
      addStoryToStore(store, 'kind-1', 'story-1.1', () => 0);
      addStoryToStore(store, 'kind-1', 'story-1.2', () => 0);
      store.finishConfiguring();

      onSetStories.mockClear();
      store.startConfiguring();
      store.remove(toId('kind-1', 'story-1.1'));
      store.finishConfiguring();

      expect(onSetStories).toHaveBeenCalledWith({
        v: 2,
        globals: {},
        globalParameters: {},
        kindParameters: { 'kind-1': {} },
        stories: {
          'kind-1--story-1-2': expect.objectContaining({
            id: 'kind-1--story-1-2',
          }),
        },
      });

      expect(store.fromId(toId('kind-1', 'story-1.1'))).toBeFalsy();
      expect(store.fromId(toId('kind-1', 'story-1.2'))).toBeTruthy();
    });

    it('emits the right things after removing a kind', () => {
      const onSetStories = jest.fn();
      channel.on(Events.SET_STORIES, onSetStories);
      const store = new StoryStore({ channel });

      // For hooks
      addons.setChannel(channel);

      store.startConfiguring();
      addStoryToStore(store, 'kind-1', 'story-1.1', () => 0);
      addStoryToStore(store, 'kind-1', 'story-1.2', () => 0);
      addStoryToStore(store, 'kind-2', 'story-2.1', () => 0);
      addStoryToStore(store, 'kind-2', 'story-2.2', () => 0);
      store.finishConfiguring();

      onSetStories.mockClear();
      store.startConfiguring();
      store.removeStoryKind('kind-1');
      store.finishConfiguring();

      expect(onSetStories).toHaveBeenCalledWith({
        v: 2,
        globals: {},
        globalParameters: {},
        kindParameters: { 'kind-1': {}, 'kind-2': {} },
        stories: {
          'kind-2--story-2-1': expect.objectContaining({
            id: 'kind-2--story-2-1',
          }),
          'kind-2--story-2-2': expect.objectContaining({
            id: 'kind-2--story-2-2',
          }),
        },
      });

      expect(store.fromId(toId('kind-1', 'story-1.1'))).toBeFalsy();
      expect(store.fromId(toId('kind-2', 'story-2.1'))).toBeTruthy();
    });

    // eslint-disable-next-line jest/expect-expect
    it('should not error even if you remove a kind that does not exist', () => {
      const store = new StoryStore({ channel });
      store.removeStoryKind('kind');
    });
  });

  describe('CURRENT_STORY_WAS_SET', () => {
    it('is emitted when configuration ends', () => {
      const onCurrentStoryWasSet = jest.fn();
      channel.on(Events.CURRENT_STORY_WAS_SET, onCurrentStoryWasSet);
      const store = new StoryStore({ channel });

      store.finishConfiguring();
      expect(onCurrentStoryWasSet).toHaveBeenCalled();
    });

    it('is emitted when setSelection is called', () => {
      const onCurrentStoryWasSet = jest.fn();
      channel.on(Events.CURRENT_STORY_WAS_SET, onCurrentStoryWasSet);
      const store = new StoryStore({ channel });
      store.finishConfiguring();

      onCurrentStoryWasSet.mockClear();
      store.setSelection({ storyId: 'a--1', viewMode: 'story' });
      expect(onCurrentStoryWasSet).toHaveBeenCalled();
    });
  });

  describe('STORY_SPECIFIED', () => {
    it('is emitted when configuration ends if a specifier was set', () => {
      const onStorySpecified = jest.fn();
      channel.on(Events.STORY_SPECIFIED, onStorySpecified);
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'kind-1', 'story-1.1', () => 0);
      store.setSelectionSpecifier({ storySpecifier: '*', viewMode: 'story' });

      store.finishConfiguring();
      expect(onStorySpecified).toHaveBeenCalled();
    });

    it('is NOT emitted when setSelection is called', () => {
      const onStorySpecified = jest.fn();
      channel.on(Events.STORY_SPECIFIED, onStorySpecified);
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'kind-1', 'story-1.1', () => 0);
      store.setSelectionSpecifier({ storySpecifier: '*', viewMode: 'story' });
      store.finishConfiguring();

      onStorySpecified.mockClear();
      store.setSelection({ storyId: 'a--1', viewMode: 'story' });
      expect(onStorySpecified).not.toHaveBeenCalled();
    });
  });

  describe('In Single Story mode', () => {
    describe('when storySpecifier is story id', () => {
      it('adds only one story specified in selection specifier when addStory is called', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({
          storySpecifier: toId('kind-1', 'story-1.1'),
          viewMode: 'story',
          singleStory: true,
        });

        store.startConfiguring();
        addStoryToStore(store, 'kind-1', 'story-1.1', () => 0);
        addStoryToStore(store, 'kind-1', 'story-1.2', () => 0);
        store.finishConfiguring();

        expect(store.fromId(toId('kind-1', 'story-1.1'))).toBeTruthy();
        expect(store.fromId(toId('kind-1', 'story-1.2'))).toBeFalsy();
      });

      it('adds only kind metadata specified in selection specifier when addKindMetadata is called', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({
          storySpecifier: toId('kind-1', 'story-1.1'),
          viewMode: 'story',
          singleStory: true,
        });

        store.startConfiguring();
        store.addKindMetadata('kind-1', {});
        store.addKindMetadata('kind-2', {});
        store.finishConfiguring();

        expect(store._kinds['kind-1']).toBeDefined();
        expect(store._kinds['kind-2']).not.toBeDefined();
      });
    });

    describe('when storySpecifier is object', () => {
      it('adds only one story specified in selection specifier when addStory is called', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({
          storySpecifier: { kind: 'kind-1', name: 'story-1.1' },
          viewMode: 'story',
          singleStory: true,
        });

        store.startConfiguring();
        addStoryToStore(store, 'kind-1', 'story-1.1', () => 0);
        addStoryToStore(store, 'kind-1', 'story-1.2', () => 0);
        store.finishConfiguring();

        expect(store.fromId(toId('kind-1', 'story-1.1'))).toBeTruthy();
        expect(store.fromId(toId('kind-1', 'story-1.2'))).toBeFalsy();
      });

      it('adds only kind metadata specified in selection specifier when addKindMetadata is called', () => {
        const store = new StoryStore({ channel });
        store.setSelectionSpecifier({
          storySpecifier: { kind: 'kind-1', name: 'story-1.1' },
          viewMode: 'story',
          singleStory: true,
        });

        store.startConfiguring();
        store.addKindMetadata('kind-1', {});
        store.addKindMetadata('kind-2', {});
        store.finishConfiguring();

        expect(store._kinds['kind-1']).toBeDefined();
        expect(store._kinds['kind-2']).not.toBeDefined();
      });
    });
  });
});
