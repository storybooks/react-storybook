/* eslint-disable react/display-name */
import React from 'react';
import { addons, types } from '@storybook/addons';
import { ADDON_ID, PANEL_ID, PARAM_KEY } from './constants';
import { VisionSimulator } from './components/VisionSimulator';
import { A11YPanel } from './components/A11YPanel';
import { A11yContextProvider } from './components/A11yContext';

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    title: '',
    type: types.TOOL,
    match: ({ viewMode }) => viewMode === 'story',
    render: () => <VisionSimulator />,
  });

  addons.add(PANEL_ID, {
    title: 'Accessibility',
    type: types.PANEL,
    render: ({ active = true, key }) => (
      <A11yContextProvider key={key} active={active}>
        <A11YPanel />
      </A11yContextProvider>
    ),
    paramKey: PARAM_KEY,
  });
});
