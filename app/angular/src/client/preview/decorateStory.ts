import { DecoratorFunction, StoryContext, StoryFn } from '@storybook/addons';
import { computesTemplateFromComponent } from './angular-beta/ComputesTemplateFromComponent';

import { StoryFnAngularReturnType } from './types';

const defaultContext: StoryContext = {
  id: 'unspecified',
  name: 'unspecified',
  kind: 'unspecified',
  parameters: {},
  args: {},
  argTypes: {},
  globals: {},
};

export default function decorateStory(
  mainStoryFn: StoryFn<StoryFnAngularReturnType>,
  decorators: DecoratorFunction<StoryFnAngularReturnType>[]
): StoryFn<StoryFnAngularReturnType> {
  const returnDecorators = [cleanArgsDecorator, ...decorators].reduce(
    (previousStoryFn: StoryFn<StoryFnAngularReturnType>, decorator) => (
      context: StoryContext = defaultContext
    ) => {
      const decoratedStory = decorator(
        ({ parameters, ...innerContext }: StoryContext = {} as StoryContext) =>
          previousStoryFn({ ...context, ...innerContext }),
        context
      );

      return decoratedStory;
    },
    (context) => prepareMain(mainStoryFn(context), context)
  );

  return returnDecorators;
}

const prepareMain = (
  story: StoryFnAngularReturnType,
  context: StoryContext
): StoryFnAngularReturnType => {
  let { template } = story;

  const component = story.component ?? context.parameters.component;

  if (hasNoTemplate(template) && component) {
    template = computesTemplateFromComponent(component, story.props, '');
  }
  return {
    ...story,
    ...(template ? { template } : {}),
  };
};

function hasNoTemplate(template: string | null | undefined): template is undefined {
  return template === null || template === undefined;
}

const cleanArgsDecorator: DecoratorFunction<StoryFnAngularReturnType> = (storyFn, context) => {
  if (!context.argTypes || !context.args) {
    return storyFn();
  }

  const argsToClean = context.args;

  context.args = Object.entries(argsToClean).reduce((obj, [key, arg]) => {
    const argType = context.argTypes[key];

    // Only keeps args with a control or an action in argTypes
    if (argType.action || argType.control) {
      return { ...obj, [key]: arg };
    }
    return obj;
  }, {});

  return storyFn();
};
