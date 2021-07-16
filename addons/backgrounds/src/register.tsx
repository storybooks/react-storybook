/* eslint-disable react/display-name */
import React, { Fragment } from 'react';
import { addons, types } from '@storybook/addons';

import { ADDON_ID } from './constants';
import { BackgroundSelector } from './containers/BackgroundSelector';
import { GridSelector } from './containers/GridSelector';

addons.register(ADDON_ID, () => {
  addons.add(ADDON_ID, {
    title: 'Backgrounds',
    type: types.TOOL,
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: () => (
      <Fragment>
        <BackgroundSelector />
        <GridSelector />
      </Fragment>
    ),
  });
});
