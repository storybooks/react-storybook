import { StoryFn as StoryFunction, StoryContext, useMemo, useEffect } from '@storybook/addons';

import { PARAM_KEY as BACKGROUNDS_PARAM_KEY } from '../constants';
import {
  clearStyles,
  addBackgroundStyle,
  getBackgroundColorByName,
  clearBackground,
  applyOrRemoveCssVariables,
  removeCssVariables,
  isReduceMotionEnabled,
} from '../helpers';

export const withBackground = (StoryFn: StoryFunction, context: StoryContext) => {
  const { globals, parameters } = context;
  const globalsBackgroundColor = globals[BACKGROUNDS_PARAM_KEY]?.value;
  const backgroundsConfig = parameters[BACKGROUNDS_PARAM_KEY];

  const selectedBackground = useMemo(() => {
    if (backgroundsConfig.disable) {
      return clearBackground;
    }

    return getBackgroundColorByName(
      globalsBackgroundColor,
      backgroundsConfig.values,
      backgroundsConfig.default
    );
  }, [backgroundsConfig, globalsBackgroundColor]);

  const isActive = useMemo(() => selectedBackground && selectedBackground.value !== 'transparent', [
    selectedBackground,
  ]);

  const selector =
    context.viewMode === 'docs' ? `#anchor--${context.id} .docs-story` : '.sb-show-main';

  const backgroundStyles = useMemo(() => {
    const transitionStyle = 'transition: background-color 0.3s;';
    return `
      ${selector} {
        background: ${selectedBackground.value} !important;
        ${isReduceMotionEnabled() ? '' : transitionStyle}
      }
    `;
  }, [selectedBackground, selector]);

  useEffect(() => {
    const selectorId =
      context.viewMode === 'docs'
        ? `addon-backgrounds-docs-${context.id}`
        : `addon-backgrounds-color`;

    if (!isActive) {
      clearStyles(selectorId);
      removeCssVariables();
      return;
    }

    addBackgroundStyle(
      selectorId,
      backgroundStyles,
      context.viewMode === 'docs' ? context.id : null
    );

    applyOrRemoveCssVariables(selectedBackground);
  }, [isActive, backgroundStyles, context]);

  return StoryFn();
};
