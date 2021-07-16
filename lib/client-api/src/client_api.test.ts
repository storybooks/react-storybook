/* eslint-disable @typescript-eslint/naming-convention */
import { logger } from '@storybook/client-logger';
import { addons, mockChannel } from '@storybook/addons';
import Events from '@storybook/core-events';
import ClientApi from './client_api';
import ConfigApi from './config_api';
import { StoryStore } from './story_store';

const getContext = (clientApiOptions = {}) => {
  const channel = mockChannel();
  addons.setChannel(channel);
  const storyStore = new StoryStore({ channel });
  const clientApi = new ClientApi({ storyStore, ...clientApiOptions });
  const configApi = new ConfigApi({ storyStore });

  return {
    configApi,
    storyStore,
    channel,
    clientApi,
  };
};

jest.mock('@storybook/client-logger', () => ({
  logger: { warn: jest.fn(), log: jest.fn() },
}));

describe('preview.client_api', () => {
  describe('setAddon', () => {
    it('should register addons', () => {
      const { clientApi } = getContext();
      let data;

      clientApi.setAddon({
        aa() {
          data = 'foo';
        },
      });

      clientApi.storiesOf('none', module).aa();
      expect(data).toBe('foo');
    });

    it('should not remove previous addons', () => {
      const { clientApi } = getContext();
      const data = [];

      clientApi.setAddon({
        aa() {
          data.push('foo');
        },
      });

      clientApi.setAddon({
        bb() {
          data.push('bar');
        },
      });

      clientApi.storiesOf('none', module).aa().bb();
      expect(data).toEqual(['foo', 'bar']);
    });

    it('should call with the clientApi context', () => {
      const { clientApi } = getContext();
      let data;

      clientApi.setAddon({
        aa() {
          data = typeof this.add;
        },
      });

      clientApi.storiesOf('none', module).aa();
      expect(data).toBe('function');
    });

    it('should be able to access addons added previously', () => {
      const { clientApi } = getContext();
      let data;

      clientApi.setAddon({
        aa() {
          data = 'foo';
        },
      });

      clientApi.setAddon({
        bb() {
          this.aa();
        },
      });

      clientApi.storiesOf('none', module).bb();
      expect(data).toBe('foo');
    });

    it('should be able to access the current kind', () => {
      const { clientApi } = getContext();
      const kind = 'dfdwf3e3';
      let data;

      clientApi.setAddon({
        aa() {
          data = this.kind;
        },
      });

      clientApi.storiesOf(kind, module).aa();
      expect(data).toBe(kind);
    });
  });

  describe('addParameters', () => {
    it('should add parameters', () => {
      const { clientApi, storyStore } = getContext();
      const { storiesOf } = clientApi;

      clientApi.addParameters({ a: 1 });
      storiesOf('kind', module).add('name', (_args, { parameters }) => parameters);

      const result = storyStore.fromId('kind--name').storyFn();
      // @ts-ignore
      const { docs, fileName, options, argTypes, __isArgsStory, ...rest } = result;

      expect(rest).toEqual({ a: 1 });
    });

    it('should merge options', () => {
      const { clientApi, storyStore } = getContext();
      const { storiesOf } = clientApi;

      clientApi.addParameters({ options: { a: '1' } });
      clientApi.addParameters({ options: { b: '2' } });
      storiesOf('kind', module).add('name', (_args, { parameters }) => parameters);

      // @ts-ignore
      const {
        options: { hierarchyRootSeparator, hierarchySeparator, ...rest },
      } = storyStore.fromId('kind--name').storyFn();

      expect(rest).toEqual({ a: '1', b: '2' });
    });

    it('should override specific properties in options', () => {
      const { clientApi, storyStore } = getContext();
      const { storiesOf } = clientApi;

      clientApi.addParameters({ backgrounds: ['value'], options: { a: '1', b: '3' } });
      clientApi.addParameters({ options: { a: '2' } });
      storiesOf('kind', module).add('name', (_args, { parameters }) => parameters);

      // @ts-ignore
      const {
        options: { hierarchyRootSeparator, hierarchySeparator, ...rest },
        backgrounds,
      } = storyStore.fromId('kind--name').storyFn();

      expect(backgrounds).toEqual(['value']);
      expect(rest).toEqual({ a: '2', b: '3' });
    });

    it('should replace top level properties and override specific properties in options', () => {
      const { clientApi, storyStore } = getContext();
      const { storiesOf } = clientApi;

      clientApi.addParameters({ backgrounds: ['value'], options: { a: '1', b: '3' } });
      clientApi.addParameters({ backgrounds: [], options: { a: '2' } });
      storiesOf('kind', module).add('name', (_args, { parameters }) => parameters);

      // @ts-ignore
      const {
        options: { hierarchyRootSeparator, hierarchySeparator, ...rest },
        backgrounds,
      } = storyStore.fromId('kind--name').storyFn();

      expect(backgrounds).toEqual([]);
      expect(rest).toEqual({ a: '2', b: '3' });
    });

    it('should deep merge in options', () => {
      const { clientApi, storyStore } = getContext();
      const { storiesOf } = clientApi;

      clientApi.addParameters({ options: { a: '1', b: '2', theming: { c: '3' } } });
      clientApi.addParameters({ options: { theming: { c: '4', d: '5' } } });
      storiesOf('kind', module).add('name', (_args, { parameters }) => parameters);

      // @ts-ignore
      const {
        options: { hierarchyRootSeparator, hierarchySeparator, ...rest },
      } = storyStore.fromId('kind--name').storyFn();

      expect(rest).toEqual({ a: '1', b: '2', theming: { c: '4', d: '5' } });
    });
  });

  describe('addDecorator', () => {
    it('should add local decorators', () => {
      const {
        clientApi: { storiesOf },
        storyStore,
      } = getContext();

      storiesOf('kind', module)
        .addDecorator((fn) => `aa-${fn()}`)
        .add('name', () => 'Hello');

      expect(storyStore.fromId('kind--name').storyFn()).toBe('aa-Hello');
    });

    it('should add global decorators', () => {
      const {
        clientApi: { addDecorator, storiesOf },
        storyStore,
      } = getContext();

      addDecorator((fn) => `bb-${fn()}`);

      storiesOf('kind', module).add('name', () => 'Hello');
      const f = storyStore.fromId('x');

      expect(storyStore.fromId('kind--name').storyFn()).toBe('bb-Hello');
    });

    it('should not add global decorators twice', () => {
      const {
        clientApi: { addDecorator, storiesOf },
        storyStore,
      } = getContext();

      const decorator = (fn) => `bb-${fn()}`;
      addDecorator(decorator);
      addDecorator(decorator); // this one is ignored

      storiesOf('kind', module).add('name', () => 'Hello');
      const f = storyStore.fromId('x');

      expect(storyStore.fromId('kind--name').storyFn()).toBe('bb-Hello');
    });

    it('should utilize both decorators at once', () => {
      const {
        clientApi: { addDecorator, storiesOf },
        storyStore,
      } = getContext();

      addDecorator((fn) => `aa-${fn()}`);

      storiesOf('kind', module)
        .addDecorator((fn) => `bb-${fn()}`)
        .add('name', () => 'Hello');

      expect(storyStore.fromId('kind--name').storyFn()).toBe('aa-bb-Hello');
    });

    it('should pass the context', () => {
      const {
        clientApi: { storiesOf },
        storyStore,
      } = getContext();

      storiesOf('kind', module)
        .addDecorator((fn) => `aa-${fn()}`)
        .add('name', (_args, c) => `${c.kind}-${c.name}`);

      const result = storyStore.fromId('kind--name').storyFn();
      expect(result).toBe(`aa-kind-name`);
    });

    it('should have access to the context', () => {
      const {
        clientApi: { storiesOf },
        storyStore,
      } = getContext();

      storiesOf('kind', module)
        .addDecorator((fn, { kind, name }) => `${kind}-${name}-${fn()}`)
        .add('name', () => 'Hello');

      const result = storyStore.fromId('kind--name').storyFn();
      expect(result).toBe(`kind-name-Hello`);
    });
  });

  describe('clearDecorators', () => {
    it('should remove all global decorators', () => {
      const { clientApi, storyStore } = getContext();
      const { storiesOf } = clientApi;

      clientApi.addDecorator(() => 'foo');
      clientApi.clearDecorators();

      storiesOf('kind', module).add('name', () => 'bar');

      const result = storyStore.fromId('kind--name').storyFn();
      expect(result).toBe(`bar`);
    });
  });

  describe('getStorybook', () => {
    it('should transform the storybook to an array with filenames', () => {
      const {
        clientApi: { getStorybook, storiesOf },
      } = getContext();

      let book;

      book = getStorybook();
      expect(book).toEqual([]);

      storiesOf('kind 1', module)
        .add('name 1', () => '1')
        .add('name 2', () => '2');

      storiesOf('kind 2', module)
        .add('name 1', () => '1')
        .add('name 2', () => '2');

      book = getStorybook();

      expect(book).toEqual([
        expect.objectContaining({
          fileName: expect.any(String),
          kind: 'kind 1',
          stories: [
            {
              name: 'name 1',
              render: expect.any(Function),
            },
            {
              name: 'name 2',
              render: expect.any(Function),
            },
          ],
        }),
        expect.objectContaining({
          fileName: expect.any(String),
          kind: 'kind 2',
          stories: [
            {
              name: 'name 1',
              render: expect.any(Function),
            },
            {
              name: 'name 2',
              render: expect.any(Function),
            },
          ],
        }),
      ]);
    });

    it('reads filename from module', () => {
      const {
        clientApi: { getStorybook, storiesOf },
      } = getContext();

      const fn = jest.fn();
      storiesOf('kind', { id: 'foo.js' } as NodeModule).add('name', fn);

      const storybook = getStorybook();

      expect(storybook).toEqual([
        {
          kind: 'kind',
          fileName: 'foo.js',
          stories: [
            {
              name: 'name',
              render: expect.any(Function),
            },
          ],
        },
      ]);
    });

    it('should stringify ids from module', () => {
      const {
        clientApi: { getStorybook, storiesOf },
      } = getContext();

      const fn = jest.fn();
      storiesOf('kind', { id: 1211 } as NodeModule).add('name', fn);

      const storybook = getStorybook();

      expect(storybook).toEqual([
        {
          kind: 'kind',
          fileName: '1211',
          stories: [
            {
              name: 'name',
              render: expect.any(Function),
            },
          ],
        },
      ]);
    });
  });

  describe('hot module loading', () => {
    class MockModule {
      id = 'mock-module-id';

      hot = {
        callbacks: [],
        dispose(fn) {
          this.callbacks.push(fn);
        },
        reload() {
          this.callbacks.forEach((fn) => fn());
        },
      };
    }

    it('should replace a kind when the module reloads', () => {
      const {
        clientApi: { storiesOf, getStorybook },
      } = getContext();
      const mod = new MockModule();

      const stories = [jest.fn(), jest.fn()];

      expect(getStorybook()).toEqual([]);

      storiesOf('kind', (mod as unknown) as NodeModule).add('story', stories[0]);

      const firstStorybook = getStorybook();
      expect(firstStorybook).toEqual([
        {
          fileName: expect.any(String),
          kind: 'kind',
          stories: [{ name: 'story', render: expect.anything() }],
        },
      ]);

      firstStorybook[0].stories[0].render();
      expect(stories[0]).toHaveBeenCalled();

      mod.hot.reload();
      expect(getStorybook()).toEqual([]);

      storiesOf('kind', module).add('story', stories[1]);

      const secondStorybook = getStorybook();
      expect(secondStorybook).toEqual([
        {
          fileName: expect.any(String),
          kind: 'kind',
          stories: [{ name: 'story', render: expect.anything() }],
        },
      ]);
      secondStorybook[0].stories[0].render();
      expect(stories[1]).toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should maintain kind order when the module reloads', async () => {
      const {
        clientApi: { storiesOf, getStorybook },
        storyStore,
        channel,
      } = getContext();
      const module0 = new MockModule();
      const module1 = new MockModule();
      const module2 = new MockModule();

      const mockChannelEmit = jest.fn();
      channel.emit = mockChannelEmit;

      expect(getStorybook()).toEqual([]);

      storyStore.startConfiguring();
      storiesOf('kind0', (module0 as unknown) as NodeModule).add('story0-docs-only', jest.fn(), {
        docsOnly: true,
      });
      storiesOf('kind1', (module1 as unknown) as NodeModule).add('story1', jest.fn());
      storiesOf('kind2', (module2 as unknown) as NodeModule).add('story2', jest.fn());
      storyStore.finishConfiguring();

      let [event, args] = mockChannelEmit.mock.calls[1];
      expect(event).toEqual(Events.SET_STORIES);
      expect(Object.values(args.stories as [{ kind: string }]).map((v) => v.kind)).toEqual([
        'kind0',
        'kind1',
        'kind2',
      ]);
      expect(getStorybook().map((story) => story.kind)).toEqual(['kind1', 'kind2']);

      mockChannelEmit.mockClear();

      // simulate an HMR of kind1, which would cause it to go to the end
      // if the original order is not maintained
      module1.hot.reload();
      storyStore.startConfiguring();
      storiesOf('kind1', (module1 as unknown) as NodeModule).add('story1', jest.fn());
      storyStore.finishConfiguring();

      // eslint-disable-next-line prefer-destructuring
      [event, args] = mockChannelEmit.mock.calls[1];

      expect(event).toEqual(Events.SET_STORIES);
      expect(Object.values(args.stories as [{ kind: string }]).map((v) => v.kind)).toEqual([
        'kind0',
        'kind1',
        'kind2',
      ]);
      expect(getStorybook().map((story) => story.kind)).toEqual(['kind1', 'kind2']);
    });

    it('should call `module.hot.dispose` inside add and storiesOf by default', () => {
      const mod = (new MockModule() as unknown) as NodeModule;
      const mockHotDispose = jest.fn();
      mod.hot.dispose = mockHotDispose;

      const {
        clientApi: { storiesOf, getStorybook },
      } = getContext();

      storiesOf('kind', mod).add('story', jest.fn());

      expect(mockHotDispose.mock.calls.length).toEqual(2);
    });

    it('should not call `module.hot.dispose` inside add when noStoryModuleAddMethodHotDispose is true', () => {
      const mod = (new MockModule() as unknown) as NodeModule;
      const mockHotDispose = jest.fn();
      mod.hot.dispose = mockHotDispose;

      const {
        clientApi: { storiesOf, getStorybook },
      } = getContext({ noStoryModuleAddMethodHotDispose: true });

      storiesOf('kind', mod).add('story', jest.fn());

      expect(mockHotDispose.mock.calls.length).toEqual(1);
    });
  });

  describe('parameters', () => {
    it('collects parameters across different modalities', () => {
      const {
        storyStore,
        clientApi: { storiesOf, addParameters },
      } = getContext();

      addParameters({ a: 'global', b: 'global', c: 'global' });

      const kind = storiesOf('kind', module);
      kind.addParameters({ b: 'kind', c: 'kind' });

      kind.add('name', jest.fn(), { c: 'story' });

      expect(storyStore.fromId('kind--name').parameters).toEqual({
        a: 'global',
        b: 'kind',
        c: 'story',
        __isArgsStory: false,
        fileName: expect.any(String),
        argTypes: {},
      });
    });

    it('combines object parameters per-key', () => {
      const {
        storyStore,
        clientApi: { storiesOf, addParameters },
      } = getContext();

      addParameters({
        addon1: 'global string value',
        addon2: ['global array value'],
        addon3: {
          global: true,
          sub: { global: true },
        },
      });

      storiesOf('kind', module)
        .addParameters({
          addon1: 'local string value',
          addon2: ['local array value'],
          addon3: {
            local: true,
            sub: {
              local: true,
            },
          },
        })
        .add('name', jest.fn(), {
          addon1: 'local string value',
          addon2: ['local array value'],
          addon3: {
            local: true,
            sub: {
              local: true,
            },
          },
        });

      expect(storyStore.fromId('kind--name').parameters).toEqual({
        addon1: 'local string value',
        addon2: ['local array value'],
        addon3: {
          global: true,
          local: true,
          sub: {
            global: true,
            local: true,
          },
        },
        __isArgsStory: false,
        fileName: expect.any(String),
        argTypes: {},
      });
    });
  });

  describe('storiesOf', () => {
    describe('add', () => {
      it('should replace stories when adding the same story', () => {
        const stories = [jest.fn().mockReturnValue('story1'), jest.fn().mockReturnValue('story2')];

        const {
          clientApi: { storiesOf, getStorybook },
        } = getContext();

        expect(getStorybook()).toEqual([]);

        storiesOf('kind', module).add('story', stories[0]);
        {
          const book = getStorybook();
          expect(book).toHaveLength(1);

          const entry = book[0];
          expect(entry.kind).toMatch('kind');
          expect(entry.stories).toHaveLength(1);
          expect(entry.stories[0].name).toBe('story');

          expect(entry.stories[0].render()).toBe('story1');
        }

        storiesOf('kind', module).add('story', stories[1]);
        // @ts-ignore
        expect(logger.warn.mock.calls[0][0]).toMatch(
          /Story with id kind--story already exists in the store/
        );
        {
          const book = getStorybook();
          expect(book).toHaveLength(1);

          const entry = book[0];
          expect(entry.kind).toMatch('kind');
          expect(entry.stories).toHaveLength(1);
          expect(entry.stories[0].name).toBe('story');

          expect(entry.stories[0].render()).toBe('story2');
        }
      });

      it('should throw an error if story is in wrong format', () => {
        const {
          clientApi: { storiesOf },
        } = getContext();

        expect(() => {
          storiesOf('kind', module).add('test', 'String that should be a function instead' as any);
        }).toThrow(
          'Cannot load story "test" in "kind" due to invalid format. Storybook expected a function/object but received string instead.'
        );
      });
    });
  });
});
