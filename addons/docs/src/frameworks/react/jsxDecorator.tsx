import React, { createElement, ReactElement } from 'react';
import reactElementToJSXString, { Options } from 'react-element-to-jsx-string';
import dedent from 'ts-dedent';
import deprecate from 'util-deprecate';

import { addons, StoryContext } from '@storybook/addons';
import { logger } from '@storybook/client-logger';

import { SourceType, SNIPPET_RENDERED } from '../../shared';
import { getDocgenSection } from '../../lib/docgen';
import { isMemo, isForwardRef } from './lib';

type JSXOptions = Options & {
  /** How many wrappers to skip when rendering the jsx */
  skip?: number;
  /** Whether to show the function in the jsx tab */
  showFunctions?: boolean;
  /** Whether to format HTML or Vue markup */
  enableBeautify?: boolean;
  /** Override the display name used for a component */
  displayName?: string | Options['displayName'];
  /** Deprecated: A function ran after the story is rendered */
  onBeforeRender?(dom: string): string;
  /** A function ran after a story is rendered (prefer this over `onBeforeRender`) */
  transformSource?(dom: string, context?: StoryContext): string;
};

/** Run the user supplied onBeforeRender function if it exists */
const applyBeforeRender = (domString: string, options: JSXOptions) => {
  if (typeof options.onBeforeRender !== 'function') {
    return domString;
  }

  const deprecatedOnBeforeRender = deprecate(
    options.onBeforeRender,
    dedent`
      StoryFn.parameters.jsx.onBeforeRender was deprecated.
      Prefer StoryFn.parameters.jsx.transformSource instead.
      See https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-onbeforerender for details.
    `
  );

  return deprecatedOnBeforeRender(domString);
};

/** Run the user supplied transformSource function if it exists */
const applyTransformSource = (domString: string, options: JSXOptions, context?: StoryContext) => {
  if (typeof options.transformSource !== 'function') {
    return domString;
  }

  return options.transformSource(domString, context);
};

/** Apply the users parameters and render the jsx for a story */
export const renderJsx = (code: React.ReactElement, options: JSXOptions) => {
  if (typeof code === 'undefined') {
    logger.warn('Too many skip or undefined component');
    return null;
  }

  let renderedJSX = code;
  const Type = renderedJSX.type;

  for (let i = 0; i < options.skip; i += 1) {
    if (typeof renderedJSX === 'undefined') {
      logger.warn('Cannot skip undefined element');
      return null;
    }

    if (React.Children.count(renderedJSX) > 1) {
      logger.warn('Trying to skip an array of elements');
      return null;
    }

    if (typeof renderedJSX.props.children === 'undefined') {
      logger.warn('Not enough children to skip elements.');

      if (typeof renderedJSX.type === 'function' && renderedJSX.type.name === '') {
        renderedJSX = <Type {...renderedJSX.props} />;
      }
    } else if (typeof renderedJSX.props.children === 'function') {
      renderedJSX = renderedJSX.props.children();
    } else {
      renderedJSX = renderedJSX.props.children;
    }
  }

  const displayNameDefaults =
    typeof options.displayName === 'string'
      ? { showFunctions: true, displayName: () => options.displayName }
      : {
          // To get exotic component names resolving properly
          displayName: (el: any): string =>
            el.type.displayName ||
            getDocgenSection(el.type, 'displayName') ||
            (el.type.name !== '_default' ? el.type.name : null) ||
            (typeof el.type === 'function' ? 'No Display Name' : null) ||
            (isForwardRef(el.type) ? el.type.render.name : null) ||
            (isMemo(el.type) ? el.type.type.name : null) ||
            el.type,
        };

  const filterDefaults = {
    filterProps: (value: any, key: string): boolean => value !== undefined,
  };

  const opts = {
    ...displayNameDefaults,
    ...filterDefaults,
    ...options,
  };

  const result = React.Children.map(code, (c) => {
    // @ts-ignore FIXME: workaround react-element-to-jsx-string
    const child = typeof c === 'number' ? c.toString() : c;
    let string = applyBeforeRender(reactElementToJSXString(child, opts as Options), options);

    if (string.indexOf('&quot;') > -1) {
      const matches = string.match(/\S+=\\"([^"]*)\\"/g);
      if (matches) {
        matches.forEach((match) => {
          string = string.replace(match, match.replace(/&quot;/g, "'"));
        });
      }
    }

    return string;
  }).join('\n');

  return result.replace(/function\s+noRefCheck\(\)\s+\{\}/, '() => {}');
};

const defaultOpts = {
  skip: 0,
  showFunctions: false,
  enableBeautify: true,
  showDefaultProps: false,
};

export const skipJsxRender = (context: StoryContext) => {
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

const isMdx = (node: any) => node.type?.displayName === 'MDXCreateElement' && !!node.props?.mdxType;

const mdxToJsx = (node: any) => {
  if (!isMdx(node)) return node;
  const { mdxType, originalType, children, ...rest } = node.props;
  let jsxChildren = [] as ReactElement[];
  if (children) {
    const array = Array.isArray(children) ? children : [children];
    jsxChildren = array.map(mdxToJsx);
  }
  return createElement(originalType, rest, ...jsxChildren);
};

export const jsxDecorator = (storyFn: any, context: StoryContext) => {
  const story = storyFn();

  // We only need to render JSX if the source block is actually going to
  // consume it. Otherwise it's just slowing us down.
  if (skipJsxRender(context)) {
    return story;
  }

  const channel = addons.getChannel();

  const options = {
    ...defaultOpts,
    ...(context?.parameters.jsx || {}),
  } as Required<JSXOptions>;

  // Exclude decorators from source code snippet by default
  const storyJsx = context?.parameters.docs?.source?.excludeDecorators
    ? context.originalStoryFn(context.args)
    : story;

  const sourceJsx = mdxToJsx(storyJsx);

  let jsx = '';
  const rendered = renderJsx(sourceJsx, options);
  if (rendered) {
    jsx = applyTransformSource(rendered, options, context);
  }

  channel.emit(SNIPPET_RENDERED, (context || {}).id, jsx);

  return story;
};
