import global from 'global';
import configure from '../configure';
import { Loader } from '../Loader';
import { StoryshotsOptions } from '../../api/StoryshotsOptions';

function test(options: StoryshotsOptions): boolean {
  return options.framework === 'server';
}

function load(options: StoryshotsOptions) {
  global.STORYBOOK_ENV = 'server';

  const storybook = jest.requireActual('@storybook/server');

  configure({ ...options, storybook });

  return {
    framework: 'server' as const,
    renderTree: jest.requireActual('./renderTree').default,
    renderShallowTree: () => {
      throw new Error('Shallow renderer is not supported for server');
    },
    storybook,
  };
}

const serverLoader: Loader = {
  load,
  test,
};

export default serverLoader;
