import React from 'react';
import pLimit from 'p-limit';
import { nanoid } from 'nanoid';

import { IStory, StoryContext } from '@storybook/angular';
import { rendererFactory } from '@storybook/angular/renderer';
import { StoryFn } from '@storybook/addons';

const limit = pLimit(1);

/**
 * Uses the angular renderer to generate a story. Uses p-limit to run synchronously
 */
export const prepareForInline = (storyFn: StoryFn<IStory>, { id, parameters }: StoryContext) =>
  React.createElement('div', {
    ref: async (node?: HTMLDivElement): Promise<void> => {
      if (!node) {
        return null;
      }

      return limit(async () => {
        const renderer = await rendererFactory.getRendererInstance(`${id}-${nanoid(10)}`, node);
        await renderer.render({
          forced: false,
          parameters,
          storyFnAngular: storyFn(),
          targetDOMNode: node,
        });
      });
    },
  });
