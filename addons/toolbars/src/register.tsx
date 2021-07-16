/* eslint-disable react/display-name */
import React from 'react';
import { addons, types } from '@storybook/addons';
import { ToolbarManager } from './components/ToolbarManager';
import { ADDON_ID } from './constants';

addons.register(ADDON_ID, () =>
  addons.add(ADDON_ID, {
    title: ADDON_ID,
    type: types.TOOL,
    match: () => true,
    render: () => <ToolbarManager />,
  })
);
