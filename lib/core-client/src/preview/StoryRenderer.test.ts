// a
import { StoryStore, defaultDecorateStory } from '@storybook/client-api';
import createChannel from '@storybook/channel-postmessage';
import {
  FORCE_RE_RENDER,
  CURRENT_STORY_WAS_SET,
  STORY_ERRORED,
  STORY_THREW_EXCEPTION,
  STORY_MISSING,
  DOCS_RENDERED,
  STORY_CHANGED,
  STORY_UNCHANGED,
  STORY_RENDERED,
} from '@storybook/core-events';
import { toId } from '@storybook/csf';
import {
  addons,
  StoryFn,
  StoryKind,
  StoryName,
  Parameters,
  LoaderFunction,
  applyHooks,
} from '@storybook/addons';
import ReactDOM from 'react-dom';

import { StoryRenderer } from './StoryRenderer';

jest.mock('react-dom');

jest.mock('@storybook/client-logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('global', () => ({
  // @ts-ignore
  ...global,
  FEATURES: { previewCsfV3: true },
}));

function prepareRenderer() {
  const render = jest.fn(({ storyFn }) => storyFn());
  const channel = createChannel({ page: 'preview' });
  addons.setChannel(channel);
  const storyStore = new StoryStore({ channel: null });
  const renderer = new StoryRenderer({ render, channel, storyStore });

  // mock out all the dom-touching functions
  renderer.applyLayout = jest.fn();
  renderer.showErrorDisplay = jest.fn();
  renderer.showNoPreview = jest.fn();
  renderer.showMain = jest.fn();
  renderer.showDocs = jest.fn();
  renderer.showStory = jest.fn();

  return { render, channel, storyStore, renderer };
}

function addStory(
  storyStore: StoryStore,
  kind: StoryKind,
  name: StoryName,
  parameters: Parameters = {},
  loaders: LoaderFunction[] = [],
  storyFn: StoryFn = jest.fn()
) {
  const id = toId(kind, name);
  storyStore.addStory(
    { id, kind, name, storyFn, parameters, loaders },
    {
      applyDecorators: applyHooks(defaultDecorateStory),
    }
  );
  return id;
}

function addAndSelectStory(
  storyStore: StoryStore,
  kind: StoryKind,
  name: StoryName,
  parameters: Parameters = {},
  loaders: LoaderFunction[] = undefined
) {
  const storyFn = jest.fn();
  const id = addStory(storyStore, kind, name, parameters, loaders, storyFn);
  storyStore.setSelection({ storyId: id, viewMode: 'story' });
  return storyFn;
}

describe('core.preview.StoryRenderer', () => {
  it('renders the current story with the correct context', async () => {
    const { render, channel, storyStore, renderer } = prepareRenderer();

    const onStoryRendered = jest.fn();
    channel.on(STORY_RENDERED, onStoryRendered);

    addAndSelectStory(storyStore, 'a', '1', { p: 'q' });

    await renderer.renderCurrentStory(false);
    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'a--1',
        kind: 'a',
        name: '1',
        parameters: { __isArgsStory: false, argTypes: {}, p: 'q' },
        forceRender: false,

        showMain: expect.any(Function),
        showError: expect.any(Function),
        showException: expect.any(Function),
      })
    );

    render.mockClear();
    await renderer.renderCurrentStory(true);
    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({
        forceRender: true,
      })
    );

    // the render function does something async so we need to jump to the end of the promise queue
    await Promise.resolve(null);

    expect(onStoryRendered).toHaveBeenCalledWith('a--1');
  });

  it('calls play functions on render', async () => {
    const { render, channel, storyStore, renderer } = prepareRenderer();

    const onStoryRendered = jest.fn();
    channel.on(STORY_RENDERED, onStoryRendered);

    const play = jest.fn();
    addAndSelectStory(storyStore, 'a', '1', { p: 'q', play });

    await renderer.renderCurrentStory(false);
    expect(render).toHaveBeenCalled();

    render.mockClear();
    await renderer.renderCurrentStory(true);
    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({
        forceRender: true,
      })
    );

    // the render function does something async so we need to jump to the end of the promise queue
    await Promise.resolve(null);

    expect(onStoryRendered).toHaveBeenCalledWith('a--1');
    expect(play).toHaveBeenCalled();
  });

  describe('loaders', () => {
    it('loads data asynchronously and passes to stories', async () => {
      const { channel, storyStore, renderer } = prepareRenderer();

      const onStoryRendered = jest.fn();
      channel.on(STORY_RENDERED, onStoryRendered);

      const loaders = [async () => new Promise((r) => setTimeout(() => r({ foo: 7 }), 100))];
      const storyFn = addAndSelectStory(storyStore, 'a', '1', {}, loaders);

      await renderer.renderCurrentStory(false);
      expect(storyFn).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          id: 'a--1',
          kind: 'a',
          name: '1',
          loaded: { foo: 7 },
        })
      );

      expect(onStoryRendered).toHaveBeenCalledWith('a--1');
    });
    it('later loaders override earlier loaders', async () => {
      const { channel, storyStore, renderer } = prepareRenderer();

      const onStoryRendered = jest.fn();
      channel.on(STORY_RENDERED, onStoryRendered);

      const loaders = [
        async () => new Promise((r) => setTimeout(() => r({ foo: 7 }), 100)),
        async () => new Promise((r) => setTimeout(() => r({ foo: 3 }), 50)),
      ];
      const storyFn = addAndSelectStory(storyStore, 'a', '1', {}, loaders);

      await renderer.renderCurrentStory(false);
      expect(storyFn).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          id: 'a--1',
          kind: 'a',
          name: '1',
          loaded: { foo: 3 },
        })
      );

      expect(onStoryRendered).toHaveBeenCalledWith('a--1');
    });
    it('more specific loaders override more generic loaders', async () => {
      const { channel, storyStore, renderer } = prepareRenderer();

      const onStoryRendered = jest.fn();
      channel.on(STORY_RENDERED, onStoryRendered);

      storyStore.addGlobalMetadata({ loaders: [async () => ({ foo: 1, bar: 1, baz: 1 })] });
      storyStore.addKindMetadata('a', { loaders: [async () => ({ foo: 3, bar: 3 })] });
      const storyFn = addAndSelectStory(storyStore, 'a', '1', {}, [async () => ({ foo: 5 })]);

      await renderer.renderCurrentStory(false);
      expect(storyFn).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          id: 'a--1',
          kind: 'a',
          name: '1',
          loaded: { foo: 5, bar: 3, baz: 1 },
        })
      );

      expect(onStoryRendered).toHaveBeenCalledWith('a--1');
    });
  });
  describe('errors', () => {
    it('renders an error if a config error is set on the store', async () => {
      const { render, storyStore, renderer } = prepareRenderer();
      const err = { message: 'message', stack: 'stack' };
      storyStore.setError(err);
      storyStore.finishConfiguring();
      await renderer.renderCurrentStory(false);

      expect(render).not.toHaveBeenCalled();
      expect(renderer.showErrorDisplay).toHaveBeenCalledWith(err);
    });

    it('renders an error if the story calls renderError', async () => {
      const { render, channel, storyStore, renderer } = prepareRenderer();

      const onStoryErrored = jest.fn();
      channel.on(STORY_ERRORED, onStoryErrored);

      const err = { title: 'title', description: 'description' };
      render.mockImplementation(({ showError }) => showError(err));

      addAndSelectStory(storyStore, 'a', '1');
      await renderer.renderCurrentStory(false);

      expect(renderer.showErrorDisplay).toHaveBeenCalledWith({
        message: 'title',
        stack: 'description',
      });
      expect(onStoryErrored).toHaveBeenCalledWith(err);
    });

    it('renders an exception if the story calls renderException', async () => {
      const { render, channel, storyStore, renderer } = prepareRenderer();

      const onStoryThrewException = jest.fn();
      channel.on(STORY_THREW_EXCEPTION, onStoryThrewException);

      const err = { message: 'message', stack: 'stack' };
      render.mockImplementation(({ showException }) => showException(err));

      addAndSelectStory(storyStore, 'a', '1');
      await renderer.renderCurrentStory(false);

      expect(renderer.showErrorDisplay).toHaveBeenCalledWith(err);
      expect(onStoryThrewException).toHaveBeenCalledWith(err);
    });

    it('renders an exception if the render function throws', async () => {
      const { render, channel, storyStore, renderer } = prepareRenderer();

      const onStoryThrewException = jest.fn();
      channel.on(STORY_THREW_EXCEPTION, onStoryThrewException);

      const err = { message: 'message', stack: 'stack' };
      render.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw err;
      });

      addAndSelectStory(storyStore, 'a', '1');
      await renderer.renderCurrentStory(false);

      expect(renderer.showErrorDisplay).toHaveBeenCalledWith(err);
      expect(onStoryThrewException).toHaveBeenCalledWith(err);
    });

    it('renders an error if the story is missing', async () => {
      const { render, channel, storyStore, renderer } = prepareRenderer();

      const onStoryMissing = jest.fn();
      channel.on(STORY_MISSING, onStoryMissing);

      addStory(storyStore, 'a', '1');
      storyStore.setSelection({ storyId: 'b--2', viewMode: 'story' });
      await renderer.renderCurrentStory(false);

      expect(render).not.toHaveBeenCalled();

      expect(renderer.showNoPreview).toHaveBeenCalled();
      expect(onStoryMissing).toHaveBeenCalledWith('b--2');
    });
  });

  describe('docs mode', () => {
    it('renders docs and emits when rendering a docs story', async () => {
      const { render, channel, storyStore, renderer } = prepareRenderer();

      const onDocsRendered = jest.fn();
      channel.on(DOCS_RENDERED, onDocsRendered);
      ((ReactDOM.render as unknown) as jest.Mock<ReactDOM.Renderer>).mockImplementationOnce(
        (element, node, callback) => callback()
      );

      addStory(storyStore, 'a', '1');
      storyStore.setSelection({ storyId: 'a--1', viewMode: 'docs' });
      await renderer.renderCurrentStory(false);

      // Although the docs React component may ultimately render the story we are mocking out
      // `react-dom` and just check that *something* is being rendered by react at this point
      expect(render).not.toHaveBeenCalled();
      expect(onDocsRendered).toHaveBeenCalledWith('a');
    });

    it('hides the root and shows the docs root as well as main when rendering a docs story', async () => {
      const { storyStore, renderer } = prepareRenderer();
      addStory(storyStore, 'a', '1');
      storyStore.setSelection({ storyId: 'a--1', viewMode: 'docs' });
      await renderer.renderCurrentStory(false);

      expect(renderer.showDocs).toHaveBeenCalled();
      expect(renderer.showMain).toHaveBeenCalled();
    });

    it('hides the docs root and shows the root, but does not show main when rendering a normal story', () => {
      const { render, storyStore, renderer } = prepareRenderer();
      addStory(storyStore, 'a', '1');

      storyStore.setSelection({ storyId: 'a--1', viewMode: 'docs' });

      render.mockImplementationOnce(({ showMain }) => {
        // showMain has not yet been called
        expect(renderer.showStory).toHaveBeenCalled();
        expect(renderer.showMain).not.toHaveBeenCalled();

        // now the render function implementation calls showMain
        showMain();
        expect(renderer.showMain).toHaveBeenCalled();
      });

      (renderer.showStory as jest.Mock<any>).mockClear();
      (renderer.showMain as jest.Mock<any>).mockClear();
      storyStore.setSelection({ storyId: 'a--1', viewMode: 'story' });
    });
  });

  describe('re-rendering behaviour', () => {
    it('does not re-render if nothing changed', async () => {
      const { render, channel, storyStore, renderer } = prepareRenderer();
      addAndSelectStory(storyStore, 'a', '1');
      await renderer.renderCurrentStory(false);

      const onStoryUnchanged = jest.fn();
      channel.on(STORY_UNCHANGED, onStoryUnchanged);

      render.mockClear();
      await renderer.renderCurrentStory(false);
      expect(render).not.toHaveBeenCalled();
      // Not sure why STORY_UNCHANGED is called with all this stuff
      expect(onStoryUnchanged).toHaveBeenCalledWith({
        id: 'a--1',
        kind: 'a',
        name: '1',
        viewMode: 'story',
        getDecorated: expect.any(Function),
      });
    });
    it('does re-render the current story if it has not changed if forceRender is true', async () => {
      const { render, channel, storyStore, renderer } = prepareRenderer();
      addAndSelectStory(storyStore, 'a', '1');
      await renderer.renderCurrentStory(false);

      const onStoryChanged = jest.fn();
      channel.on(STORY_CHANGED, onStoryChanged);

      render.mockClear();
      await renderer.renderCurrentStory(true);
      expect(render).toHaveBeenCalled();

      expect(onStoryChanged).not.toHaveBeenCalled();
    });
    it('does re-render if the selected story changes', async () => {
      const { render, channel, storyStore, renderer } = prepareRenderer();
      addStory(storyStore, 'a', '1');
      addAndSelectStory(storyStore, 'a', '2');
      await renderer.renderCurrentStory(false);

      const onStoryChanged = jest.fn();
      channel.on(STORY_CHANGED, onStoryChanged);

      render.mockClear();
      storyStore.setSelection({ storyId: 'a--1', viewMode: 'story' });
      await renderer.renderCurrentStory(false);
      expect(render).toHaveBeenCalled();

      expect(onStoryChanged).toHaveBeenCalledWith('a--1');
    });
    it('does re-render if the story implementation changes', async () => {
      const { render, channel, storyStore, renderer } = prepareRenderer();
      addAndSelectStory(storyStore, 'a', '1');
      await renderer.renderCurrentStory(false);

      const onStoryChanged = jest.fn();
      channel.on(STORY_CHANGED, onStoryChanged);

      render.mockClear();
      storyStore.removeStoryKind('a');
      addAndSelectStory(storyStore, 'a', '1');
      await renderer.renderCurrentStory(false);

      expect(render).toHaveBeenCalled();
      expect(onStoryChanged).not.toHaveBeenCalled();
    });
    it('does re-render if the view mode changes', async () => {
      const { render, channel, storyStore, renderer } = prepareRenderer();
      addAndSelectStory(storyStore, 'a', '1');
      storyStore.setSelection({ storyId: 'a--1', viewMode: 'docs' });
      await renderer.renderCurrentStory(false);

      const onStoryChanged = jest.fn();
      channel.on(STORY_CHANGED, onStoryChanged);

      render.mockClear();
      storyStore.setSelection({ storyId: 'a--1', viewMode: 'story' });
      await renderer.renderCurrentStory(false);

      expect(render).toHaveBeenCalled();
      expect(onStoryChanged).toHaveBeenCalledWith('a--1');
    });
  });

  describe('hooks', () => {
    it('cleans up kind hooks when changing kind in docs mode', async () => {
      const { storyStore, renderer } = prepareRenderer();
      addAndSelectStory(storyStore, 'a', '1');
      addAndSelectStory(storyStore, 'b', '1');
      storyStore.setSelection({ storyId: 'a--1', viewMode: 'docs' });
      await renderer.renderCurrentStory(false);

      storyStore.cleanHooksForKind = jest.fn();

      storyStore.setSelection({ storyId: 'b--1', viewMode: 'docs' });
      await renderer.renderCurrentStory(false);

      expect(storyStore.cleanHooksForKind).toHaveBeenCalledWith('a');
    });
    it('does not clean up hooks when changing story but not kind in docs mode', async () => {
      const { storyStore, renderer } = prepareRenderer();
      addAndSelectStory(storyStore, 'a', '1');
      addAndSelectStory(storyStore, 'a', '2');
      storyStore.setSelection({ storyId: 'a--1', viewMode: 'docs' });
      await renderer.renderCurrentStory(false);

      storyStore.cleanHooksForKind = jest.fn();

      storyStore.setSelection({ storyId: 'a--2', viewMode: 'docs' });
      await renderer.renderCurrentStory(false);

      expect(storyStore.cleanHooksForKind).not.toHaveBeenCalled();
    });
    it('cleans up kind hooks when changing view mode from docs', async () => {
      const { storyStore, renderer } = prepareRenderer();
      addAndSelectStory(storyStore, 'a', '1');
      storyStore.setSelection({ storyId: 'a--1', viewMode: 'docs' });
      await renderer.renderCurrentStory(false);

      storyStore.cleanHooksForKind = jest.fn();

      storyStore.setSelection({ storyId: 'a--1', viewMode: 'story' });
      await renderer.renderCurrentStory(false);

      expect(storyStore.cleanHooksForKind).toHaveBeenCalledWith('a');
    });
    it('cleans up story hooks when changing story in story mode', async () => {
      const { storyStore, renderer } = prepareRenderer();
      addStory(storyStore, 'a', '1');
      addAndSelectStory(storyStore, 'a', '2');
      await renderer.renderCurrentStory(false);

      storyStore.cleanHooks = jest.fn();

      storyStore.setSelection({ storyId: 'a--1', viewMode: 'story' });
      await renderer.renderCurrentStory(false);

      expect(storyStore.cleanHooks).toHaveBeenCalledWith('a--2');
    });
    it('cleans up story hooks when changing view mode from story', async () => {
      const { storyStore, renderer } = prepareRenderer();
      addAndSelectStory(storyStore, 'a', '1');
      await renderer.renderCurrentStory(false);

      storyStore.cleanHooks = jest.fn();

      storyStore.setSelection({ storyId: 'a--1', viewMode: 'docs' });
      await renderer.renderCurrentStory(false);

      expect(storyStore.cleanHooks).toHaveBeenCalledWith('a--1');
    });
  });

  describe('event handling', () => {
    it('renders on CURRENT_STORY_WAS_SET', () => {
      const { channel, renderer } = prepareRenderer();
      renderer.renderCurrentStory = jest.fn();

      channel.emit(CURRENT_STORY_WAS_SET);
      expect(renderer.renderCurrentStory).toHaveBeenCalledWith(false);
    });

    it('force renders on FORCE_RE_RENDER', () => {
      const { channel, renderer } = prepareRenderer();
      renderer.renderCurrentStory = jest.fn();

      channel.emit(FORCE_RE_RENDER);
      expect(renderer.renderCurrentStory).toHaveBeenCalledWith(true);
    });
  });
});
