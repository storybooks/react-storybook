/* eslint-disable no-underscore-dangle */
/* global window */
import { render } from 'lit-html';
import { addons, StoryContext, StoryFn } from '@storybook/addons';
import { SNIPPET_RENDERED, SourceType } from '../../shared';

function skipSourceRender(context: StoryContext) {
  const sourceParams = context?.parameters.docs?.source;
  const isArgsStory = context?.parameters.__isArgsStory;

  // always render if the user forces it
  if (sourceParams?.type === SourceType.DYNAMIC) {
    return false;
  }

  // never render if the user is forcing the block to render code, or
  // if the user provides code, or if it's not an args story.
  return !isArgsStory || sourceParams?.code || sourceParams?.type === SourceType.CODE;
}

function applyTransformSource(source: string, context: StoryContext): string {
  const { transformSource } = context.parameters.docs ?? {};
  if (typeof transformSource !== 'function') return source;
  return transformSource(source, context);
}

export function sourceDecorator(storyFn: StoryFn, context: StoryContext) {
  const story = context?.parameters.docs?.source?.excludeDecorators
    ? context.originalStoryFn(context.args)
    : storyFn();

  if (!skipSourceRender(context)) {
    const container = window.document.createElement('div');
    render(story, container);
    const source = applyTransformSource(container.innerHTML.replace(/<!---->/g, ''), context);
    if (source) addons.getChannel().emit(SNIPPET_RENDERED, context.id, source);
  }

  return story;
}
