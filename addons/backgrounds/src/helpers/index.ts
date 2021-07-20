import global from 'global';
import dedent from 'ts-dedent';

import { logger } from '@storybook/client-logger';

import { Background } from '../types';

export const clearBackground: Background = {
  name: 'Clear the background or CSS of the preview',
  value: 'transparent',
};
const variablesStyleIdentifier = 'addon-backgrounds-variables';
const variablesStyleLinkIdentifier = 'addon-backgrounds-variables-link';
const { document, window } = global;

export const isReduceMotionEnabled = () => {
  const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  return prefersReduceMotion.matches;
};

export const getBackgroundColorByName = (
  currentSelectedValue: string,
  backgrounds: Background[] = [],
  defaultName: string
): Background => {
  if (currentSelectedValue === 'transparent') {
    return clearBackground;
  }

  const result = backgrounds.find((background) => background.value === currentSelectedValue);
  if (result) {
    return result;
  }

  const defaultBackground = backgrounds.find((background) => background.name === defaultName);
  if (defaultBackground) {
    return defaultBackground;
  }

  if (defaultName) {
    const availableColors = backgrounds.map((background) => background.name).join(', ');
    logger.warn(
      dedent`
        Backgrounds Addon: could not find the default color "${defaultName}".
        These are the available colors for your story based on your configuration:
        ${availableColors}.
      `
    );
  }

  return clearBackground;
};

export const clearStyles = (selector: string | string[]) => {
  const selectors = Array.isArray(selector) ? selector : [selector];
  selectors.forEach(clearStyle);
};

const clearStyle = (selector: string) => {
  const element = document.getElementById(selector) as HTMLElement;
  if (element) {
    element.parentElement.removeChild(element);
  }
};

export const addGridStyle = (selector: string, css: string) => {
  const existingStyle = document.getElementById(selector) as HTMLElement;
  if (existingStyle) {
    if (existingStyle.innerHTML !== css) {
      existingStyle.innerHTML = css;
    }
  } else {
    const style = document.createElement('style') as HTMLElement;
    style.setAttribute('id', selector);
    style.innerHTML = css;
    document.head.appendChild(style);
  }
};

export const addBackgroundStyle = (selector: string, css: string, storyId: string) => {
  const existingStyle = document.getElementById(selector) as HTMLElement;
  if (existingStyle) {
    if (existingStyle.innerHTML !== css) {
      existingStyle.innerHTML = css;
    }
  } else {
    const style = document.createElement('style') as HTMLElement;
    style.setAttribute('id', selector);
    style.innerHTML = css;

    const gridStyleSelector = `addon-backgrounds-grid${storyId ? `-docs-${storyId}` : ''}`;
    // If grids already exist, we want to add the style tag BEFORE it so the background doesn't override grid
    const existingGridStyle = document.getElementById(gridStyleSelector) as HTMLElement;
    if (existingGridStyle) {
      existingGridStyle.parentElement.insertBefore(style, existingGridStyle);
    } else {
      document.head.appendChild(style);
    }
  }
};

export const applyOrRemoveCssVariablesFromConfiguration = (variables: {
  [name: string]: string;
}) => {
  let style = document.getElementById(variablesStyleIdentifier) as HTMLStyleElement;
  if (variables) {
    if (!style) {
      style = document.createElement('style');
      style.id = variablesStyleIdentifier;
      document.head.appendChild(style);
    }
    const cssVariables = Object.keys(variables)
      .map((name) => `${name}:${variables[name]};`)
      .join('');
    style.textContent = `:root{${cssVariables}}`;
  } else if (!variables && style) {
    document.head.removeChild(style);
  }
};

export const applyOrRemoveCssVariablesFromAssetFile = (variablesAsset: string) => {
  let link = document.getElementById(variablesStyleLinkIdentifier) as HTMLLinkElement;
  if (variablesAsset) {
    if (!link) {
      link = document.createElement('link');
      link.id = variablesStyleLinkIdentifier;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      document.head.appendChild(link);
    }
    link.href = variablesAsset;
  } else if (!variablesAsset && link) {
    document.head.removeChild(link);
  }
};

export const applyOrRemoveCssVariables = ({ cssVariables, cssVariablesAsset }: Background) => {
  applyOrRemoveCssVariablesFromAssetFile(cssVariablesAsset);
  applyOrRemoveCssVariablesFromConfiguration(cssVariables);
};

export const removeCssVariables = () => {
  const style = document.getElementById(variablesStyleIdentifier);
  const styleLink = document.getElementById(variablesStyleLinkIdentifier);
  if (style) {
    document.head.removeChild(style);
  }
  if (styleLink) {
    document.head.removeChild(styleLink);
  }
};
