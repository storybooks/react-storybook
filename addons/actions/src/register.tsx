/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react';
import { addons, types } from '@storybook/addons';
import { STORY_CHANGED } from '@storybook/core-events';
import ActionLogger from './containers/ActionLogger';
import { ADDON_ID, EVENT_ID, PANEL_ID, PARAM_KEY } from './constants';

addons.register(ADDON_ID, (api) => {
  addons.addPanel(PANEL_ID, {
    title() {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [actionsCount, setActionsCount] = useState(0);
      const onEvent = () => setActionsCount((previous) => previous + 1);
      const onChange = () => setActionsCount(0);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        api.on(EVENT_ID, onEvent);
        api.on(STORY_CHANGED, onChange);
        return () => {
          api.off(EVENT_ID, onEvent);
          api.off(STORY_CHANGED, onChange);
        };
      });
      const suffix = actionsCount === 0 ? '' : ` (${actionsCount})`;
      return `Actions${suffix}`;
    },
    type: types.PANEL,
    render: ({ active, key }) => <ActionLogger key={key} api={api} active={active} />,
    paramKey: PARAM_KEY,
  });
});
