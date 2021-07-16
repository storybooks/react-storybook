/* eslint-disable prefer-destructuring */
import Vue, { VueConstructor, ComponentOptions } from 'vue';
import { start } from '@storybook/core/client';
import {
  ClientStoryApi,
  StoryFn,
  DecoratorFunction,
  StoryContext,
  Loadable,
} from '@storybook/addons';

import './globals';
import { IStorybookSection, StoryFnVueReturnType } from './types';

import render, { VALUES } from './render';
import { extractProps } from './util';

export const WRAPS = 'STORYBOOK_WRAPS';

function prepare(
  rawStory: StoryFnVueReturnType,
  innerStory?: VueConstructor
): VueConstructor | null {
  let story: ComponentOptions<Vue> | VueConstructor;

  if (typeof rawStory === 'string') {
    story = { template: rawStory };
  } else if (rawStory != null) {
    story = rawStory as ComponentOptions<Vue>;
  } else {
    return null;
  }

  // @ts-ignore
  // eslint-disable-next-line no-underscore-dangle
  if (!story._isVue) {
    if (innerStory) {
      story.components = { ...(story.components || {}), story: innerStory };
    }
    story = Vue.extend(story);
    // @ts-ignore // https://github.com/storybookjs/storybook/pull/7578#discussion_r307984824
  } else if (story.options[WRAPS]) {
    return story as VueConstructor;
  }

  return Vue.extend({
    // @ts-ignore // https://github.com/storybookjs/storybook/pull/7578#discussion_r307985279
    [WRAPS]: story,
    // @ts-ignore // https://github.com/storybookjs/storybook/pull/7578#discussion_r307984824
    [VALUES]: { ...(innerStory ? innerStory.options[VALUES] : {}), ...extractProps(story) },
    functional: true,
    render(h, { data, parent, children }) {
      return h(
        story,
        {
          ...data,
          // @ts-ignore // https://github.com/storybookjs/storybook/pull/7578#discussion_r307986196
          props: { ...(data.props || {}), ...parent.$root[VALUES] },
        },
        children
      );
    },
  });
}

const defaultContext: StoryContext = {
  id: 'unspecified',
  name: 'unspecified',
  kind: 'unspecified',
  parameters: {},
  args: {},
  argTypes: {},
  globals: {},
};

function decorateStory(
  storyFn: StoryFn<StoryFnVueReturnType>,
  decorators: DecoratorFunction<VueConstructor>[]
): StoryFn<VueConstructor> {
  return decorators.reduce(
    (decorated: StoryFn<VueConstructor>, decorator) => (context: StoryContext = defaultContext) => {
      let story;

      const decoratedStory = decorator(
        ({ parameters, ...innerContext }: StoryContext = {} as StoryContext) => {
          story = decorated({ ...context, ...innerContext });
          return story;
        },
        context
      );

      if (!story) {
        story = decorated(context);
      }

      if (decoratedStory === story) {
        return story;
      }

      return prepare(decoratedStory, story);
    },
    (context) => prepare(storyFn(context))
  );
}
const framework = 'vue';

interface ClientApi extends ClientStoryApi<StoryFnVueReturnType> {
  setAddon(addon: any): void;
  configure(loader: Loadable, module: NodeModule): void;
  getStorybook(): IStorybookSection[];
  clearDecorators(): void;
  forceReRender(): void;
  raw: () => any; // todo add type
  load: (...args: any[]) => void;
}

const api = start(render, { decorateStory });

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
