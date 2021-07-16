import React, { FC } from 'react';
import { Icons, IconButton, IconsProps } from '@storybook/components';

interface ToolbarMenuButtonProps {
  active: boolean;
  title: string;
  icon: IconsProps['icon'] | '';
  description: string;
  onClick?: () => void;
}

export const ToolbarMenuButton: FC<ToolbarMenuButtonProps> = ({
  active,
  title,
  icon,
  description,
  onClick,
}) => (
  <IconButton active={active} title={description} onClick={onClick}>
    {icon && <Icons icon={icon} />}
    {title ? `\xa0${title}` : null}
  </IconButton>
);
