import { start } from '@storybook/core/client';
import { ClientStoryApi, Loadable, StoryFn, Args } from '@storybook/addons';

import './globals';
import { renderMain as render } from './render';
import { StoryFnServerReturnType, IStorybookSection } from './types';

const framework = 'server';

interface ClientApi extends ClientStoryApi<StoryFnServerReturnType> {
  setAddon(addon: any): void;
  configure(loader: Loadable, module: NodeModule): void;
  getStorybook(): IStorybookSection[];
  clearDecorators(): void;
  forceReRender(): void;
  raw: () => any; // todo add type
}

const globalRender: StoryFn = (args: Args) => {};

const api = start(render);
api.clientApi.globalRender = globalRender;

export const storiesOf: ClientApi['storiesOf'] = (kind, m) => {
  return (api.clientApi.storiesOf(kind, m) as ReturnType<ClientApi['storiesOf']>).addParameters({
    framework,
  });
};

export const configure: ClientApi['configure'] = (...args) => api.configure(framework, ...args);
export const {
  addDecorator,
  addParameters,
  clearDecorators,
  setAddon,
  getStorybook,
  raw,
} = api.clientApi;

export const { forceReRender } = api;
