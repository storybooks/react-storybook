// eslint-disable-next-line @typescript-eslint/ban-types
function wrapPreset(basePresets: any): { babel: Function; webpack: Function } {
  return {
    babel: async (config: any, args: any) => basePresets.apply('babel', config, args),
    webpack: async (config: any, args: any) => basePresets.apply('webpack', config, args),
  };
}

function mockPreset(name: string, mockPresetObject: any) {
  jest.mock(name, () => mockPresetObject, { virtual: true });
}

jest.mock('@storybook/node-logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('resolve-from', () => (l: any, name: string) => {
  const KNOWN_FILES = [
    '@storybook/addon-actions/register',
    './local/preset',
    './local/addons',
    '/absolute/preset',
    '/absolute/addons',
    '@storybook/addon-docs/preset',
    '@storybook/addon-essentials',
    '@storybook/addon-knobs/register',
    '@storybook/addon-notes/register-panel',
    '@storybook/preset-create-react-app',
    '@storybook/preset-typescript',
    'addon-bar/preset.js',
    'addon-baz/register.js',
    'addon-foo/register.js',
  ];

  if (KNOWN_FILES.includes(name)) {
    return name;
  }
  throw new Error(`cannot resolve ${name}`);
});

describe('presets', () => {
  it('does not throw when there is no preset file', async () => {
    const { getPresets } = jest.requireActual('./presets');
    let presets;

    async function testPresets() {
      presets = wrapPreset(getPresets());
      await presets.webpack();
      await presets.babel();
    }

    await expect(testPresets()).resolves.toBeUndefined();

    expect(presets).toBeDefined();
  });

  it('does not throw when presets are empty', async () => {
    const { getPresets } = jest.requireActual('./presets');
    const presets = wrapPreset(getPresets([]));

    async function testPresets() {
      await presets.webpack();
      await presets.babel();
    }

    await expect(testPresets()).resolves.toBeUndefined();
  });

  it('does not throw when preset can not be loaded', async () => {
    const { getPresets } = jest.requireActual('./presets');
    const presets = wrapPreset(getPresets(['preset-foo']));

    async function testPresets() {
      await presets.webpack();
      await presets.babel();
    }

    await expect(testPresets()).resolves.toBeUndefined();
  });

  it('loads and applies presets when they are combined in another preset', async () => {
    mockPreset('preset-foo', {
      foo: (exec: string[]) => exec.concat('foo'),
    });

    mockPreset('preset-bar', {
      foo: (exec: string[]) => exec.concat('bar'),
    });

    mockPreset('preset-got', [
      'preset-dracarys',
      { name: 'preset-valar', options: { custom: 'morghulis' } },
    ]);

    mockPreset('preset-dracarys', {
      foo: (exec: string[]) => exec.concat('dracarys'),
    });

    mockPreset('preset-valar', {
      foo: (exec: string[], options: any) => exec.concat(`valar ${options.custom}`),
    });

    const { getPresets } = jest.requireActual('./presets');
    const presets = getPresets(['preset-foo', 'preset-got', 'preset-bar'], {});

    const result = await presets.apply('foo', []);

    expect(result).toEqual(['foo', 'dracarys', 'valar morghulis', 'bar']);
  });

  it('loads and applies presets when they are declared as a string', async () => {
    const mockPresetFooExtendWebpack = jest.fn();
    const mockPresetBarExtendBabel = jest.fn();

    mockPreset('preset-foo', {
      webpack: mockPresetFooExtendWebpack,
    });

    mockPreset('preset-bar', {
      babel: mockPresetBarExtendBabel,
    });

    const { getPresets } = jest.requireActual('./presets');
    const presets = wrapPreset(getPresets(['preset-foo', 'preset-bar'], {}));

    async function testPresets() {
      await presets.webpack();
      await presets.babel();
    }

    await expect(testPresets()).resolves.toBeUndefined();

    expect(mockPresetFooExtendWebpack).toHaveBeenCalled();
    expect(mockPresetBarExtendBabel).toHaveBeenCalled();
  });

  it('loads  and applies presets when they are declared as an object without props', async () => {
    const mockPresetFooExtendWebpack = jest.fn();
    const mockPresetBarExtendBabel = jest.fn();

    mockPreset('preset-foo', {
      webpack: mockPresetFooExtendWebpack,
    });

    mockPreset('preset-bar', {
      babel: mockPresetBarExtendBabel,
    });

    const { getPresets } = jest.requireActual('./presets');
    const presets = wrapPreset(getPresets([{ name: 'preset-foo' }, { name: 'preset-bar' }], {}));

    async function testPresets() {
      await presets.webpack();
      await presets.babel();
    }

    await expect(testPresets()).resolves.toBeUndefined();

    expect(mockPresetFooExtendWebpack).toHaveBeenCalled();
    expect(mockPresetBarExtendBabel).toHaveBeenCalled();
  });

  it('loads and applies presets when they are declared as an object with props', async () => {
    const mockPresetFooExtendWebpack = jest.fn();
    const mockPresetBarExtendBabel = jest.fn();

    mockPreset('preset-foo', {
      webpack: mockPresetFooExtendWebpack,
    });

    mockPreset('preset-bar', {
      babel: mockPresetBarExtendBabel,
    });

    const { getPresets } = jest.requireActual('./presets');
    const presets = wrapPreset(
      getPresets(
        [
          { name: 'preset-foo', options: { foo: 1 } },
          { name: 'preset-bar', options: { bar: 'a' } },
        ],
        {}
      )
    );

    async function testPresets() {
      await presets.webpack({});
      await presets.babel({});
    }

    await expect(testPresets()).resolves.toBeUndefined();

    expect(mockPresetFooExtendWebpack).toHaveBeenCalledWith(expect.anything(), {
      foo: 1,
      presetsList: expect.anything(),
      presets: expect.anything(),
    });
    expect(mockPresetBarExtendBabel).toHaveBeenCalledWith(expect.anything(), {
      bar: 'a',
      presetsList: expect.anything(),
      presets: expect.anything(),
    });
  });

  it('loads and applies presets when they are declared as a string and as an object', async () => {
    const mockPresetFooExtendWebpack = jest.fn();
    const mockPresetBarExtendBabel = jest.fn();

    mockPreset('preset-foo', {
      webpack: mockPresetFooExtendWebpack,
    });

    mockPreset('preset-bar', {
      babel: mockPresetBarExtendBabel,
    });

    const { getPresets } = jest.requireActual('./presets');
    const presets = wrapPreset(
      getPresets(
        [
          'preset-foo',
          {
            name: 'preset-bar',
            options: {
              bar: 'a',
            },
          },
        ],
        {}
      )
    );

    async function testPresets() {
      await presets.webpack({});
      await presets.babel({});
    }

    await expect(testPresets()).resolves.toBeUndefined();

    expect(mockPresetFooExtendWebpack).toHaveBeenCalled();
    expect(mockPresetBarExtendBabel).toHaveBeenCalledWith(expect.anything(), {
      bar: 'a',
      presetsList: expect.arrayContaining([
        expect.objectContaining({ name: 'preset-foo' }),
        expect.objectContaining({ name: 'preset-bar' }),
      ]),
      presets: expect.anything(),
    });
  });

  it('applies presets in chain', async () => {
    const mockPresetFooExtendWebpack = jest.fn((...args: any[]) => ({}));
    const mockPresetBarExtendWebpack = jest.fn((...args: any[]) => ({}));

    mockPreset('preset-foo', {
      webpack: mockPresetFooExtendWebpack,
    });

    mockPreset('preset-bar', {
      webpack: mockPresetBarExtendWebpack,
    });

    const { getPresets } = jest.requireActual('./presets');
    const presets = wrapPreset(
      getPresets(
        [
          'preset-foo',
          {
            name: 'preset-bar',
            options: {
              bar: 'a',
              presetsList: expect.arrayContaining([
                expect.objectContaining({ name: 'preset-foo' }),
                expect.objectContaining({ name: 'preset-bar' }),
              ]),
              presets: expect.anything(),
            },
          },
        ],
        {}
      )
    );

    async function testPresets() {
      await presets.webpack();
      await presets.babel();
    }

    await expect(testPresets()).resolves.toBeUndefined();

    expect(mockPresetFooExtendWebpack).toHaveBeenCalled();
    expect(mockPresetBarExtendWebpack).toHaveBeenCalledWith(expect.anything(), {
      bar: 'a',
      presetsList: expect.arrayContaining([
        expect.objectContaining({ name: 'preset-foo' }),
        expect.objectContaining({ name: 'preset-bar' }),
      ]),
      presets: expect.anything(),
    });
  });

  it('allows for presets to export presets array', async () => {
    const { getPresets } = jest.requireActual('./presets');
    const input = {};
    const mockPresetBar = jest.fn((...args: any[]) => input);

    mockPreset('preset-foo', {
      presets: ['preset-bar'],
    });

    mockPreset('preset-bar', {
      bar: mockPresetBar,
    });

    const presets = getPresets(['preset-foo'], {});

    const output = await presets.apply('bar');

    expect(mockPresetBar).toHaveBeenCalledWith(undefined, expect.any(Object));

    expect(input).toBe(output);
  });

  it('allows for presets to export presets fn', async () => {
    const { getPresets } = jest.requireActual('./presets');
    const input = {};
    const storybookOptions = { a: 1 };
    const presetOptions = { b: 2 };
    const mockPresetBar = jest.fn((...args: any[]) => input);
    const mockPresetFoo = jest.fn((...args: any[]) => ['preset-bar']);

    mockPreset('preset-foo', {
      presets: mockPresetFoo,
    });

    mockPreset('preset-bar', {
      bar: mockPresetBar,
    });

    const presets = getPresets([{ name: 'preset-foo', options: { b: 2 } }], storybookOptions);

    const output = await presets.apply('bar');

    expect(mockPresetFoo).toHaveBeenCalledWith({ ...storybookOptions, ...presetOptions });
    expect(mockPresetBar).toHaveBeenCalledWith(undefined, expect.any(Object));

    expect(input).toBe(output);
  });

  afterEach(() => {
    jest.resetModules();
  });
});

describe('resolveAddonName', () => {
  const { resolveAddonName } = jest.requireActual('./presets');

  it('should resolve packages with metadata (relative path)', () => {
    mockPreset('./local/preset', {
      presets: [],
    });
    expect(resolveAddonName({}, './local/preset')).toEqual({
      name: './local/preset',
      type: 'presets',
    });
  });

  it('should resolve packages with metadata (absolute path)', () => {
    mockPreset('/absolute/preset', {
      presets: [],
    });
    expect(resolveAddonName({}, '/absolute/preset')).toEqual({
      name: '/absolute/preset',
      type: 'presets',
    });
  });

  it('should resolve packages without metadata', () => {
    expect(resolveAddonName({}, '@storybook/preset-create-react-app')).toEqual({
      name: '@storybook/preset-create-react-app',
      type: 'presets',
    });
  });

  it('should resolve managerEntries', () => {
    expect(resolveAddonName({}, '@storybook/addon-actions/register')).toEqual({
      name: '@storybook/addon-actions/register',
      type: 'managerEntries',
    });
  });

  it('should resolve presets', () => {
    expect(resolveAddonName({}, '@storybook/addon-docs')).toEqual({
      name: '@storybook/addon-docs/preset',
      type: 'presets',
    });
  });

  it('should resolve preset packages', () => {
    expect(resolveAddonName({}, '@storybook/addon-essentials')).toEqual({
      name: '@storybook/addon-essentials',
      type: 'presets',
    });
  });

  it('should error on invalid inputs', () => {
    expect(() => resolveAddonName({}, null)).toThrow();
  });
});

describe('loadPreset', () => {
  mockPreset('@storybook/preset-typescript', {});
  mockPreset('@storybook/addon-docs/preset', {});
  mockPreset('@storybook/addon-actions/register', {});
  mockPreset('addon-foo/register.js', {});
  mockPreset('addon-bar/preset', {});
  mockPreset('addon-baz/register.js', {});
  mockPreset('@storybook/addon-notes/register-panel', {});

  const { loadPreset } = jest.requireActual('./presets');

  it('should resolve all addons & presets in correct order', () => {
    const loaded = loadPreset(
      {
        name: '',
        type: 'managerEntries',
        presets: ['@storybook/preset-typescript'],
        addons: [
          '@storybook/addon-docs',
          '@storybook/addon-actions/register',
          'addon-foo/register.js',
          'addon-bar',
          'addon-baz/register.tsx',
          '@storybook/addon-notes/register-panel',
        ],
      },
      0,
      {}
    );
    expect(loaded).toEqual([
      {
        name: '@storybook/preset-typescript',
        options: {},
        preset: {},
      },
      {
        name: '@storybook/addon-docs/preset',
        options: {},
        preset: {},
      },
      {
        name: '@storybook/addon-actions/register_additionalManagerEntries',
        options: {},
        preset: {
          managerEntries: ['@storybook/addon-actions/register'],
        },
      },
      {
        name: 'addon-foo/register.js_additionalManagerEntries',
        options: {},
        preset: {
          managerEntries: ['addon-foo/register.js'],
        },
      },
      // should be there, but some file mocking problem is causing it to not resolve
      // {
      //   name: 'addon-bar',
      //   options: {},
      //   preset: {},
      // },
      {
        name: 'addon-baz/register.tsx_additionalManagerEntries',
        options: {},
        preset: {
          managerEntries: ['addon-baz/register.tsx'],
        },
      },
      {
        name: '@storybook/addon-notes/register-panel_additionalManagerEntries',
        options: {},
        preset: {
          managerEntries: ['@storybook/addon-notes/register-panel'],
        },
      },
      {
        name: {
          presets: ['@storybook/preset-typescript'],
          addons: [
            '@storybook/addon-docs',
            '@storybook/addon-actions/register',
            'addon-foo/register.js',
            'addon-bar',
            'addon-baz/register.tsx',
            '@storybook/addon-notes/register-panel',
          ],
          name: '',
          type: 'managerEntries',
        },
        options: {},
        preset: {},
      },
    ]);
  });
});
