import { addons, StoryContext, StoryFn } from '@storybook/addons';
import { IStory } from '@storybook/angular';
import { computesTemplateSourceFromComponent } from '@storybook/angular/renderer';
import prettierHtml from 'prettier/parser-html';
import prettier from 'prettier/standalone';
import { SNIPPET_RENDERED, SourceType } from '../../shared';

export const skipSourceRender = (context: StoryContext) => {
  const sourceParams = context?.parameters.docs?.source;

  // always render if the user forces it
  if (sourceParams?.type === SourceType.DYNAMIC) {
    return false;
  }
  // never render if the user is forcing the block to render code, or
  // if the user provides code
  return sourceParams?.code || sourceParams?.type === SourceType.CODE;
};

const prettyUp = (source: string) =>
  prettier.format(source, {
    parser: 'angular',
    plugins: [prettierHtml],
    htmlWhitespaceSensitivity: 'ignore',
  });

/**
 * Svelte source decorator.
 * @param storyFn Fn
 * @param context  StoryContext
 */
export const sourceDecorator = (storyFn: StoryFn<IStory>, context: StoryContext) => {
  const story = storyFn();
  if (skipSourceRender(context)) {
    return story;
  }
  const channel = addons.getChannel();
  const { props, template } = story;

  const {
    parameters: { component, argTypes },
  } = context;

  if (component) {
    const source = computesTemplateSourceFromComponent(component, props, argTypes);

    // We might have a story with a Directive or Service defined as the component
    // In these cases there might exist a template, even if we aren't able to create source from component
    if (source || template) {
      channel.emit(SNIPPET_RENDERED, context.id, prettyUp(source || template));
    }
    return story;
  }

  if (template) {
    channel.emit(SNIPPET_RENDERED, context.id, prettyUp(template));
    return story;
  }

  return story;
};
