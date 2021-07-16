import { addons, StoryContext } from '@storybook/addons';
import { ArgTypes, Args } from '@storybook/api';

import { SourceType, SNIPPET_RENDERED } from '../../shared';

/**
 * Check if the sourcecode should be generated.
 *
 * @param context StoryContext
 */
const skipSourceRender = (context: StoryContext) => {
  const sourceParams = context?.parameters.docs?.source;
  // eslint-disable-next-line no-underscore-dangle
  const isArgsStory = context?.parameters.__isArgsStory;

  // always render if the user forces it
  if (sourceParams?.type === SourceType.DYNAMIC) {
    return false;
  }

  // never render if the user is forcing the block to render code, or
  // if the user provides code, or if it's not an args story.
  return !isArgsStory || sourceParams?.code || sourceParams?.type === SourceType.CODE;
};

/**
 * Transform a key/value to a svelte declaration as string.
 *
 * Default values are ommited
 *
 * @param key Key
 * @param value Value
 * @param argTypes Component ArgTypes
 */
function toSvelteProperty(key: string, value: any, argTypes: ArgTypes): string {
  if (value === undefined || value === null) {
    return null;
  }

  // default value ?
  if (argTypes[key] && argTypes[key].defaultValue === value) {
    return null;
  }

  if (value === true) {
    return key;
  }

  if (typeof value === 'string') {
    return `${key}=${JSON.stringify(value)}`;
  }

  return `${key}={${JSON.stringify(value)}}`;
}

/**
 * Extract a component name.
 *
 * @param component Component
 */
function getComponentName(component: any): string {
  if (component == null) {
    return null;
  }

  const { __docgen: docGenInfo = {} } = component;
  let { name } = docGenInfo;

  if (!name) {
    return component.name;
  }

  if (name.endsWith('.svelte')) {
    name = name.substring(0, name.length - 7);
  }
  return name;
}

/**
 * Generate a svelte template.
 *
 * @param component Component
 * @param args Args
 * @param argTypes ArgTypes
 * @param slotProperty Property used to simulate a slot
 */
export function generateSvelteSource(
  component: any,
  args: Args,
  argTypes: ArgTypes,
  slotProperty: string
): string {
  const name = getComponentName(component);

  if (!name) {
    return null;
  }

  const props = Object.entries(args)
    .filter(([k]) => k !== slotProperty)
    .map(([k, v]) => toSvelteProperty(k, v, argTypes))
    .filter((p) => p)
    .join(' ');

  const slotValue = slotProperty ? args[slotProperty] : null;

  if (slotValue) {
    return `<${name} ${props}>\n    ${slotValue}\n</${name}>`;
  }

  return `<${name} ${props}/>`;
}

/**
 * Check if the story component is a wrapper to the real component.
 *
 * A component can be annoted with @wrapper to indicate that
 * it's just a wrapper for the real tested component. If it's the case
 * then the code generated references the real component, not the wrapper.
 *
 * moreover, a wrapper can annotate a property with @slot : this property
 * is then assumed to be an alias to the default slot.
 *
 * @param component Component
 */
function getWrapperProperties(component: any) {
  const { __docgen: docGenInfo } = component;
  if (!docGenInfo) {
    return { wrapper: false };
  }

  // the component should be declared as a wrapper
  if (!docGenInfo.keywords.find((kw: any) => kw.name === 'wrapper')) {
    return { wrapper: false };
  }

  const slotProp = docGenInfo.data.find((prop: any) =>
    prop.keywords.find((kw: any) => kw.name === 'slot')
  );
  return { wrapper: true, slotProperty: slotProp?.name as string };
}

/**
 * Svelte source decorator.
 * @param storyFn Fn
 * @param context  StoryContext
 */
export const sourceDecorator = (storyFn: any, context: StoryContext) => {
  const story = storyFn();

  if (skipSourceRender(context)) {
    return story;
  }

  const channel = addons.getChannel();

  const { parameters = {}, args = {} } = context || {};
  let { Component: component = {} } = story;

  const { wrapper, slotProperty } = getWrapperProperties(component);
  if (wrapper) {
    component = parameters.component;
  }

  const source = generateSvelteSource(component, args, context?.argTypes, slotProperty);

  if (source) {
    channel.emit(SNIPPET_RENDERED, (context || {}).id, source);
  }

  return story;
};
