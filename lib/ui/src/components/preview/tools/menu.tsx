/* eslint-disable react/display-name */
import React from 'react';
import { IconButton, Icons, Separator } from '@storybook/components';
import { Consumer, Combo } from '@storybook/api';
import { Addon } from '@storybook/addons';

const menuMapper = ({ api, state }: Combo) => ({
  isVisible: state.layout.showNav,
  toggle: () => api.toggleNav(),
});

export const menuTool: Addon = {
  title: 'menu',
  id: 'menu',
  match: ({ viewMode }) => viewMode === 'story',
  render: () => (
    <Consumer filter={menuMapper}>
      {({ isVisible, toggle }) =>
        !isVisible && (
          <>
            <IconButton aria-label="Show sidebar" key="menu" onClick={toggle} title="Show sidebar">
              <Icons icon="menu" />
            </IconButton>
            <Separator />
          </>
        )
      }
    </Consumer>
  ),
};
