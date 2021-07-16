/* eslint-disable prefer-destructuring */
import { start } from '@storybook/core/client';

import './globals';
import render from './render';
import { ClientApi } from './types';

const framework = 'preact';
const api = start(render);

export const storiesOf: ClientApi['storiesOf'] = (kind, m) =>
  (api.clientApi.storiesOf(kind, m) as ReturnType<ClientApi['storiesOf']>).addParameters({
    framework,
  });

export const configure: ClientApi['configure'] = (...args) => api.configure(framework, ...args);
export const addDecorator: ClientApi['addDecorator'] = api.clientApi
  .addDecorator as ClientApi['addDecorator'];
export const addParameters: ClientApi['addParameters'] = api.clientApi
  .addParameters as ClientApi['addParameters'];
export const clearDecorators: ClientApi['clearDecorators'] = api.clientApi.clearDecorators;
export const setAddon: ClientApi['setAddon'] = api.clientApi.setAddon;
export const forceReRender: ClientApi['forceReRender'] = api.forceReRender;
export const getStorybook: ClientApi['getStorybook'] = api.clientApi.getStorybook;
export const raw: ClientApi['raw'] = api.clientApi.raw;
