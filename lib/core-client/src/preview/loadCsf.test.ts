import { ConfigApi, ClientApi, StoryStore } from '@storybook/client-api';
import { logger } from '@storybook/client-logger';
import { RequireContext } from './types';

import { loadCsf } from './loadCsf';

jest.mock('@storybook/client-logger', () => ({
  logger: { warn: jest.fn(), debug: jest.fn() },
}));

let cbs: ((data: any) => void)[];
let mod: NodeModule;
beforeEach(() => {
  cbs = [];
  mod = ({
    hot: {
      data: {},
      dispose: (cb: (data: any) => void) => cbs.push(cb),
      accept: jest.fn(),
    },
  } as unknown) as NodeModule;
});

function doHMRDispose() {
  cbs.forEach((cb) => cb(mod.hot.data));
  cbs = [];
}

afterEach(() => {
  doHMRDispose();
});

function makeMocks() {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const configApi = ({ configure: (x: Function) => x() } as unknown) as ConfigApi;
  const storyStore = ({
    removeStoryKind: jest.fn(),
  } as unknown) as StoryStore;
  const clientApi = ({
    storiesOf: jest.fn().mockImplementation(() => ({
      addParameters: jest.fn(),
      addDecorator: jest.fn(),
      add: jest.fn(),
    })),
  } as unknown) as ClientApi;

  const context = { configApi, storyStore, clientApi };
  const configure = loadCsf(context);
  return { ...context, configure };
}

function makeRequireContext(map: Record<string, any>): RequireContext {
  const context = (key: string) => map[key];

  return Object.assign(context, {
    keys: () => Object.keys(map),
    resolve: (key: string) => key,
  });
}

describe('core.preview.loadCsf', () => {
  it('calls storiesOf and add correctly from CSF exports', () => {
    const { configure, clientApi } = makeMocks();

    const input = {
      a: {
        default: {
          title: 'a',
        },
        1: () => 0,
        2: () => 0,
      },
      b: {
        default: {
          title: 'b',
        },
        1: () => 0,
        2: Object.assign(() => 0, { storyName: 'two' }),
      },
    };
    configure('react', makeRequireContext(input), mod);

    const mockedStoriesOf = clientApi.storiesOf as jest.Mock;
    expect(mockedStoriesOf).toHaveBeenCalledWith('a', true);
    const aApi = mockedStoriesOf.mock.results[0].value;
    const extras: any = { decorators: [], args: {}, argTypes: {}, loaders: [] };
    expect(aApi.add).toHaveBeenCalledWith('1', input.a[1], { __id: 'a--1', ...extras });
    expect(aApi.add).toHaveBeenCalledWith('2', input.a[2], { __id: 'a--2', ...extras });

    expect(mockedStoriesOf).toHaveBeenCalledWith('b', true);
    const bApi = mockedStoriesOf.mock.results[1].value;
    expect(bApi.add).toHaveBeenCalledWith('1', input.b[1], { __id: 'b--1', ...extras });
    expect(bApi.add).toHaveBeenCalledWith('two', input.b[2], { __id: 'b--2', ...extras });
  });

  it('adds stories in the right order if __namedExportsOrder is supplied', () => {
    const { configure, clientApi } = makeMocks();

    const input = {
      a: {
        default: {
          title: 'a',
        },
        // Note the export order doesn't work if the exports are numbers
        x: () => 0,
        y: () => 0,
        z: () => 0,
        w: () => 0,
        __namedExportsOrder: ['w', 'x', 'z', 'y'],
      },
    };
    configure('react', makeRequireContext(input), mod);

    const mockedStoriesOf = clientApi.storiesOf as jest.Mock;
    const aApi = mockedStoriesOf.mock.results[0].value;
    expect(aApi.add.mock.calls.map((c: string[]) => c[0])).toEqual(['W', 'X', 'Z', 'Y']);
  });

  it('filters exports using includeStories', () => {
    const { configure, clientApi } = makeMocks();

    const input = {
      a: {
        default: {
          title: 'a',
          includeStories: ['x', 'z'],
        },
        // Note the export order doesn't work if the exports are numbers
        x: () => 0,
        y: () => 0,
        z: () => 0,
        w: () => 0,
      },
    };
    configure('react', makeRequireContext(input), mod);

    const mockedStoriesOf = clientApi.storiesOf as jest.Mock;
    const aApi = mockedStoriesOf.mock.results[0].value;
    expect(aApi.add.mock.calls.map((c: string[]) => c[0])).toEqual(['X', 'Z']);
  });

  it('filters exports using excludeStories', () => {
    const { configure, clientApi } = makeMocks();

    const input = {
      a: {
        default: {
          title: 'a',
          excludeStories: ['x', 'z'],
        },
        x: () => 0,
        y: () => 0,
        z: () => 0,
        w: () => 0,
      },
    };
    configure('react', makeRequireContext(input), mod);

    const mockedStoriesOf = clientApi.storiesOf as jest.Mock;
    const aApi = mockedStoriesOf.mock.results[0].value;
    expect(aApi.add.mock.calls.map((c: string[]) => c[0])).toEqual(['Y', 'W']);
  });

  it('allows setting componentId', () => {
    const { configure, clientApi } = makeMocks();

    const input = {
      a: {
        default: {
          title: 'a',
          id: 'random',
        },
        x: () => 0,
      },
    };
    configure('react', makeRequireContext(input), mod);

    const mockedStoriesOf = clientApi.storiesOf as jest.Mock;
    const aApi = mockedStoriesOf.mock.results[0].value;
    expect(aApi.add).toHaveBeenCalledWith('X', input.a.x, {
      __id: 'random--x',
      decorators: [],
      args: {},
      argTypes: {},
      loaders: [],
    });
  });

  it('sets various parameters on components', () => {
    const { configure, clientApi } = makeMocks();

    const input = {
      a: {
        default: {
          title: 'a',
          component: 'c',
          subcomponents: 'scs',
        },
      },
    };
    configure('react', makeRequireContext(input), mod);

    const mockedStoriesOf = clientApi.storiesOf as jest.Mock;
    const aApi = mockedStoriesOf.mock.results[0].value;
    expect(aApi.addParameters).toHaveBeenCalledWith({
      framework: 'react',
      component: 'c',
      subcomponents: 'scs',
      fileName: 'a',
    });
  });

  it('allows setting component parameters, decorators, and args/argTypes', () => {
    const { configure, clientApi } = makeMocks();

    const decorator = jest.fn();
    const input = {
      a: {
        default: {
          title: 'a',
          parameters: { x: 'y' },
          decorators: [decorator],
          args: { b: 1 },
          argTypes: { b: 'string' },
        },
        x: () => 0,
      },
    };
    configure('react', makeRequireContext(input), mod);

    const mockedStoriesOf = clientApi.storiesOf as jest.Mock;
    const aApi = mockedStoriesOf.mock.results[0].value;
    expect(aApi.addParameters).toHaveBeenCalledWith(
      expect.objectContaining({ x: 'y', args: { b: 1 }, argTypes: { b: 'string' } })
    );
    expect(aApi.addDecorator).toHaveBeenCalledWith(decorator);
  });

  it('deprecates setting story parameters and decorators, and args/argTypes with story object', () => {
    const { configure, clientApi } = makeMocks();

    const decorator = jest.fn();
    const input = {
      a: {
        default: {
          title: 'a',
        },
        x: Object.assign(() => 0, {
          story: {
            name: 'CustomName',
            parameters: { x: 'y' },
            decorators: [decorator],
            args: { b: 1 },
            argTypes: { b: 'string' },
          },
        }),
      },
    };
    configure('react', makeRequireContext(input), mod);

    const mockedStoriesOf = clientApi.storiesOf as jest.Mock;
    const aApi = mockedStoriesOf.mock.results[0].value;
    expect(aApi.add).toHaveBeenCalledWith('CustomName', input.a.x, {
      x: 'y',
      decorators: [decorator],
      __id: 'a--x',
      args: { b: 1 },
      argTypes: { b: 'string' },
      loaders: [],
    });
    expect(logger.debug).toHaveBeenCalled();
  });

  it('allows setting story parameters and decorators, and args/argTypes', () => {
    const { configure, clientApi } = makeMocks();

    const decorator = jest.fn();
    const input = {
      a: {
        default: {
          title: 'a',
        },
        x: Object.assign(() => 0, {
          parameters: { x: 'y' },
          decorators: [decorator],
          args: { b: 1 },
          argTypes: { b: 'string' },
        }),
      },
    };
    configure('react', makeRequireContext(input), mod);

    const mockedStoriesOf = clientApi.storiesOf as jest.Mock;
    const aApi = mockedStoriesOf.mock.results[0].value;
    expect(aApi.add).toHaveBeenCalledWith('X', input.a.x, {
      x: 'y',
      decorators: [decorator],
      __id: 'a--x',
      args: { b: 1 },
      argTypes: { b: 'string' },
      loaders: [],
    });
    expect(logger.debug).not.toHaveBeenCalled();
  });

  it('allows mixing story parameters and decorators, and args/argTypes and deprecated story params', () => {
    const { configure, clientApi } = makeMocks();

    const decoratorOld = jest.fn();
    const decoratorNew = jest.fn();
    const input = {
      a: {
        default: {
          title: 'a',
        },
        x: Object.assign(() => 0, {
          parameters: { x: 'y' },
          decorators: [decoratorNew],
          args: { b: 1 },
          argTypes: { b: 'string' },
          story: {
            parameters: { x: 'z', y: 'z' },
            decorators: [decoratorOld],
            args: { b: 2, c: 2 },
            argTypes: { b: 'number', c: 'number' },
          },
        }),
      },
    };
    configure('react', makeRequireContext(input), mod);

    const mockedStoriesOf = clientApi.storiesOf as jest.Mock;
    const aApi = mockedStoriesOf.mock.results[0].value;
    expect(aApi.add).toHaveBeenCalledWith('X', input.a.x, {
      x: 'y',
      y: 'z',
      decorators: [decoratorNew, decoratorOld],
      __id: 'a--x',
      args: { b: 1, c: 2 },
      argTypes: { b: 'string', c: 'number' },
      loaders: [],
    });
    expect(logger.debug).toHaveBeenCalled();
  });

  it('handles HMR correctly when adding stories', () => {
    const { configure, clientApi, storyStore } = makeMocks();

    const firstInput = {
      a: {
        default: {
          title: 'a',
        },
        x: () => 0,
      },
    };
    configure('react', makeRequireContext(firstInput), mod);

    // HMR dispose callbacks
    doHMRDispose();

    const mockedStoriesOf = clientApi.storiesOf as jest.Mock;
    mockedStoriesOf.mockClear();
    const secondInput = {
      ...firstInput,
      b: {
        default: {
          title: 'b',
        },
        x: () => 0,
      },
    };
    configure('react', makeRequireContext(secondInput), mod);

    expect(storyStore.removeStoryKind).not.toHaveBeenCalled();
    expect(mockedStoriesOf).toHaveBeenCalledWith('b', true);
  });

  it('handles HMR correctly when removing stories', () => {
    const { configure, clientApi, storyStore } = makeMocks();

    const firstInput = {
      a: {
        default: {
          title: 'a',
        },
        x: () => 0,
      },
      b: {
        default: {
          title: 'b',
        },
        x: () => 0,
      },
    };
    configure('react', makeRequireContext(firstInput), mod);

    // HMR dispose callbacks
    doHMRDispose();

    const mockedStoriesOf = clientApi.storiesOf as jest.Mock;
    mockedStoriesOf.mockClear();
    const secondInput = {
      a: firstInput.a,
    };
    configure('react', makeRequireContext(secondInput), mod);

    expect(storyStore.removeStoryKind).toHaveBeenCalledWith('b');
    expect(mockedStoriesOf).not.toHaveBeenCalled();
  });

  it('handles HMR correctly when changing stories', () => {
    const { configure, clientApi, storyStore } = makeMocks();

    const firstInput = {
      a: {
        default: {
          title: 'a',
        },
        x: () => 0,
      },

      b: {
        default: {
          title: 'b',
        },
        x: () => 0,
      },
    };
    configure('react', makeRequireContext(firstInput), mod);

    // HMR dispose callbacks
    doHMRDispose();

    const mockedStoriesOf = clientApi.storiesOf as jest.Mock;
    mockedStoriesOf.mockClear();
    const secondInput = {
      ...firstInput,
      a: {
        default: {
          title: 'a',
        },
        x: () => 0,
        y: () => 0,
      },
    };
    configure('react', makeRequireContext(secondInput), mod);

    expect(storyStore.removeStoryKind).toHaveBeenCalledTimes(1);
    expect(storyStore.removeStoryKind).toHaveBeenCalledWith('a');
    expect(mockedStoriesOf).toHaveBeenCalledWith('a', true);
  });

  it('gives a warning if there are no exported stories', () => {
    const { configure } = makeMocks();

    const input = {
      a: {
        default: {
          title: 'MissingExportsComponent',
        },
        // no named exports, will not present a story
      },
    };
    configure('react', makeRequireContext(input), mod);
    expect(logger.warn).toHaveBeenCalled();
  });

  it('does not give a warning if there are exported stories', () => {
    const { configure } = makeMocks();

    const input = {
      a: {
        default: {
          title: 'MissingExportsComponent',
        },
        x: () => 0,
      },
    };
    configure('react', makeRequireContext(input), mod);
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
