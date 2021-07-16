/* eslint-disable react-hooks/rules-of-hooks, react/display-name */
import React from 'react';
import { addons, types } from '@storybook/addons';
import { AddonPanel } from '@storybook/components';
import { API, useArgTypes } from '@storybook/api';
import { ControlsPanel } from './ControlsPanel';
import { ADDON_ID, PARAM_KEY } from './constants';

addons.register(ADDON_ID, (api: API) => {
  addons.addPanel(ADDON_ID, {
    title() {
      const rows = useArgTypes();
      const controlsCount = Object.values(rows).filter((argType) => argType?.control).length;
      const suffix = controlsCount === 0 ? '' : ` (${controlsCount})`;
      return `Controls${suffix}`;
    },
    type: types.PANEL,
    paramKey: PARAM_KEY,
    render: ({ key, active }) => {
      if (!active || !api.getCurrentStoryData()) {
        return null;
      }
      return (
        <AddonPanel key={key} active={active}>
          <ControlsPanel />
        </AddonPanel>
      );
    },
  });
});
