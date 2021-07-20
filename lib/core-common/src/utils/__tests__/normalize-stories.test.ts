import { normalizeStoriesEntry, normalizeDirectory } from '../normalize-stories';

expect.addSnapshotSerializer({
  print: (val: any) => JSON.stringify(val, null, 2),
  test: (val) => typeof val !== 'string',
});

jest.mock('fs', () => ({
  lstatSync: () => ({
    isDirectory: () => true,
  }),
}));

describe('normalizeStoriesEntry', () => {
  it('direcotry/files glob', () => {
    expect(normalizeStoriesEntry('../**/*.stories.mdx', '')).toMatchInlineSnapshot(`
      {
        "glob": "../**/*.stories.mdx",
        "specifier": {
          "directory": "..",
          "titlePrefix": "",
          "files": "*.stories.mdx"
        }
      }
    `);
  });

  it('too many stars glob', () => {
    expect(normalizeStoriesEntry('../**/foo/**/*.stories.mdx', '')).toMatchInlineSnapshot(`
      {
        "glob": "../**/foo/**/*.stories.mdx"
      }
    `);
  });

  it('intermediate directory glob', () => {
    expect(normalizeStoriesEntry('../**/foo/*.stories.mdx', '')).toMatchInlineSnapshot(`
      {
        "glob": "../**/foo/*.stories.mdx"
      }
    `);
  });

  it('directory', () => {
    expect(normalizeStoriesEntry('..', '')).toMatchInlineSnapshot(`
      {
        "glob": "../**/*.stories.@(mdx|tsx|ts|jsx|js)",
        "specifier": {
          "directory": "..",
          "titlePrefix": "",
          "files": "*.stories.@(mdx|tsx|ts|jsx|js)"
        }
      }
    `);
  });

  it('directory specifier', () => {
    expect(normalizeStoriesEntry({ directory: '..' }, '')).toMatchInlineSnapshot(`
      {
        "glob": "../**/*.stories.@(mdx|tsx|ts|jsx|js)",
        "specifier": {
          "directory": "..",
          "titlePrefix": "",
          "files": "*.stories.@(mdx|tsx|ts|jsx|js)"
        }
      }
    `);
  });

  it('directory/files specifier', () => {
    expect(normalizeStoriesEntry({ directory: '..', files: '*.stories.mdx' }, ''))
      .toMatchInlineSnapshot(`
      {
        "glob": "../**/*.stories.mdx",
        "specifier": {
          "directory": "..",
          "titlePrefix": "",
          "files": "*.stories.mdx"
        }
      }
    `);
  });

  it('directory/titlePrefix specifier', () => {
    expect(normalizeStoriesEntry({ directory: '..', titlePrefix: 'atoms' }, ''))
      .toMatchInlineSnapshot(`
      {
        "glob": "../**/*.stories.@(mdx|tsx|ts|jsx|js)",
        "specifier": {
          "directory": "..",
          "titlePrefix": "atoms",
          "files": "*.stories.@(mdx|tsx|ts|jsx|js)"
        }
      }
    `);
  });

  it('directory/titlePrefix/files specifier', () => {
    expect(
      normalizeStoriesEntry({ directory: '..', titlePrefix: 'atoms', files: '*.stories.mdx' }, '')
    ).toMatchInlineSnapshot(`
      {
        "glob": "../**/*.stories.mdx",
        "specifier": {
          "directory": "..",
          "titlePrefix": "atoms",
          "files": "*.stories.mdx"
        }
      }
    `);
  });
});

describe('normalizeDirectory', () => {
  it('.storybook config', () => {
    expect(
      normalizeDirectory(
        {
          glob: '../src/**/*.stories.*',
          specifier: {
            directory: '../src',
          },
        },
        {
          configDir: '/project/.storybook',
          workingDir: '/project',
        }
      )
    ).toMatchInlineSnapshot(`
      {
        "glob": "../src/**/*.stories.*",
        "specifier": {
          "directory": "./src"
        }
      }
    `);
  });
});
