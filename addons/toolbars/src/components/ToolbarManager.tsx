import React, { FC } from 'react';
import { useGlobalTypes } from '@storybook/api';
import { Separator } from '@storybook/components';
import { ToolbarMenuToggle } from './ToolbarMenuToggle';
import { ToolbarMenuList } from './ToolbarMenuList';
import { normalizeArgType } from '../utils/normalize-toolbar-arg-type';
import { ToolbarArgType } from '../types';

/**
 * A smart component for handling manager-preview interactions.
 */
export const ToolbarManager: FC = () => {
  const globalTypes = useGlobalTypes();
  const globalIds = Object.keys(globalTypes).filter((id) => !!globalTypes[id].toolbar);

  if (!globalIds.length) {
    return null;
  }

  return (
    <>
      <Separator />
      {globalIds.map((id) => {
        const normalizedArgType = normalizeArgType(id, globalTypes[id] as ToolbarArgType);
        const isToggle = normalizedArgType.toolbar.toggle === true;

        return isToggle ? (
          <ToolbarMenuToggle key={id} id={id} {...normalizedArgType} />
        ) : (
          <ToolbarMenuList key={id} id={id} {...normalizedArgType} />
        );
      })}
    </>
  );
};
