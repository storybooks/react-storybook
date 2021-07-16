/* eslint-disable react/display-name */
import React from 'react';
import { addons } from '@storybook/addons';

import { StoryPanel } from './StoryPanel';
import { ADDON_ID, PANEL_ID } from '.';

addons.register(ADDON_ID, (api) => {
  addons.addPanel(PANEL_ID, {
    title: 'Story',
    paramKey: 'storysource',
    render: ({ active, key }) => (active ? <StoryPanel key={key} api={api} /> : null),
  });
});
