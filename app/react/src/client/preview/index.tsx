/* eslint-disable prefer-destructuring */
import React from 'react';
import { start } from '@storybook/core/client';
import { ClientStoryApi, Loadable } from '@storybook/addons';

import './globals';
import render from './render';
import { IStorybookSection, StoryFnReactReturnType } from './types';
import { Story } from './types-6-3';

const framework = 'react';

interface ClientApi extends ClientStoryApi<StoryFnReactReturnType> {
  setAddon(addon: any): void;
  configure(loader: Loadable, module: NodeModule): void;
  getStorybook(): IStorybookSection[];
  clearDecorators(): void;
  forceReRender(): void;
  raw: () => any; // todo add type
}

const globalRender: Story = (args, { parameters }) => {
  const Component = parameters.component;
  return <Component {...args} />;
};

const api = start(render);
api.clientApi.globalRender = globalRender;

export const storiesOf: ClientApi['storiesOf'] = (kind, m) =>
  (api.clientApi.storiesOf(kind, m) as ReturnType<ClientApi['storiesOf']>).addParameters({
    framework,
  });

export const configure: ClientApi['configure'] = (...args) => api.configure(framework, ...args);
export const addDecorator: ClientApi['addDecorator'] = api.clientApi
  .addDecorator as ClientApi['addDecorator'];
export type DecoratorFn = Parameters<typeof addDecorator>[0];
export const addParameters: ClientApi['addParameters'] = api.clientApi
  .addParameters as ClientApi['addParameters'];
export const clearDecorators: ClientApi['clearDecorators'] = api.clientApi.clearDecorators;
export const setAddon: ClientApi['setAddon'] = api.clientApi.setAddon;
export const forceReRender: ClientApi['forceReRender'] = api.forceReRender;
export const getStorybook: ClientApi['getStorybook'] = api.clientApi.getStorybook;
export const raw: ClientApi['raw'] = api.clientApi.raw;
