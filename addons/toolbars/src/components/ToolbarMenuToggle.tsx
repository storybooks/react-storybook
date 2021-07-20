import React, { useCallback, FC } from 'react';
import { useGlobals } from '@storybook/api';
import { ToolbarMenuButton } from './ToolbarMenuButton';
import { withKeyboardCycle, WithKeyboardCycleProps } from '../hoc/withKeyboardCycle';
import { getSelectedIcon } from '../utils/get-selected-icon';
import { ToolbarMenuProps } from '../types';

type ToolbarMenuToggleProps = ToolbarMenuProps & WithKeyboardCycleProps;

export const ToolbarMenuToggle: FC<ToolbarMenuToggleProps> = withKeyboardCycle(
  ({ id, name, description, cycleValues = [], toolbar: { title: _title, items, showName } }) => {
    const [globals, updateGlobals] = useGlobals();

    const currentValue = globals[id];
    const hasGlobalValue = !!currentValue;
    const icon = getSelectedIcon({ currentValue, items });

    let title = _title;

    // Deprecation support for old "name of global arg used as title"
    if (showName && !title) {
      title = name;
    }

    const setNext = useCallback(() => {
      const currentIndex = cycleValues.indexOf(currentValue);
      const currentIsLast = currentIndex === cycleValues.length - 1;

      const newCurrentIndex = currentIsLast ? 0 : currentIndex + 1;
      const newCurrent = cycleValues[newCurrentIndex];

      updateGlobals({ [id]: newCurrent });
    }, [currentValue, updateGlobals]);

    return (
      <ToolbarMenuButton
        active={hasGlobalValue}
        description={description}
        onClick={setNext}
        icon={icon}
        title={title}
      />
    );
  }
);
