import React, { useCallback, FC, ReactNode } from 'react';
import { useGlobals } from '@storybook/api';
import { WithTooltip, TooltipLinkList } from '@storybook/components';
import { ToolbarMenuButton } from './ToolbarMenuButton';
import { withKeyboardCycle, WithKeyboardCycleProps } from '../hoc/withKeyboardCycle';
import { getSelectedIcon } from '../utils/get-selected-icon';
import { ToolbarMenuProps } from '../types';
import { ToolbarMenuListItem } from './ToolbarMenuListItem';

type ItemProps = {
  left?: ReactNode;
  title?: ReactNode;
  right?: ReactNode;
  active?: boolean;
  onClick?: () => void;
};

type ToolbarMenuListProps = ToolbarMenuProps & WithKeyboardCycleProps;

export const ToolbarMenuList: FC<ToolbarMenuListProps> = withKeyboardCycle(
  ({
    id,
    name,
    description,
    toolbar: { icon: _icon, items, title: _title, showName, preventDynamicIcon },
  }) => {
    const [globals, updateGlobals] = useGlobals();

    const currentValue = globals[id];
    const hasGlobalValue = !!currentValue;
    let icon = _icon;
    let title = _title;

    if (!preventDynamicIcon) {
      icon = getSelectedIcon({ currentValue, items }) || icon;
    }

    // Deprecation support for old "name of global arg used as title"
    if (showName && !title) {
      title = name;
    }

    const handleItemClick = useCallback(
      (value: string) => {
        updateGlobals({ [id]: value });
      },
      [id, updateGlobals]
    );

    return (
      <WithTooltip
        placement="top"
        trigger="click"
        tooltip={({ onHide }) => {
          const links = items
            // Special case handling for various "type" variants
            .filter(({ type }) => {
              let shouldReturn = true;

              if (type === 'reset' && !currentValue) {
                shouldReturn = false;
              }

              return shouldReturn;
            })
            .map((item) => {
              const listItem = ToolbarMenuListItem({
                ...item,
                currentValue,
                onClick: () => {
                  handleItemClick(item.value);
                  onHide();
                },
              });

              return listItem;
            });
          return <TooltipLinkList links={links} />;
        }}
        closeOnClick
      >
        <ToolbarMenuButton
          active={hasGlobalValue}
          description={description}
          icon={icon}
          title={title}
        />
      </WithTooltip>
    );
  }
);
