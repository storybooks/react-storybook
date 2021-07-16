import { StoryWrapper, StoryGetter, StoryContext } from './types';

type MakeDecoratorResult = (...args: any) => any;

interface MakeDecoratorOptions {
  name: string;
  parameterName: string;
  skipIfNoParametersOrOptions?: boolean;
  wrapper: StoryWrapper;
}

export const makeDecorator = ({
  name,
  parameterName,
  wrapper,
  skipIfNoParametersOrOptions = false,
}: MakeDecoratorOptions): MakeDecoratorResult => {
  const decorator: any = (options: Record<string, unknown>) => (
    getStory: StoryGetter,
    context: StoryContext
  ) => {
    const parameters = context.parameters && context.parameters[parameterName];

    if (parameters && parameters.disable) {
      return getStory(context);
    }

    if (skipIfNoParametersOrOptions && !options && !parameters) {
      return getStory(context);
    }

    return wrapper(getStory, context, {
      options,
      parameters,
    });
  };

  return (...args: any) => {
    // Used without options as .addDecorator(decorator)
    if (typeof args[0] === 'function') {
      return decorator()(...args);
    }

    return (...innerArgs: any): any => {
      // Used as [.]addDecorator(decorator(options))
      if (innerArgs.length > 1) {
        // Used as [.]addDecorator(decorator(option1, option2))
        if (args.length > 1) {
          return decorator(args)(...innerArgs);
        }
        return decorator(...args)(...innerArgs);
      }

      throw new Error(
        `Passing stories directly into ${name}() is not allowed,
        instead use addDecorator(${name}) and pass options with the '${parameterName}' parameter`
      );
    };
  };
};
