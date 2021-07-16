/* eslint-disable react/display-name */
import React from 'react';

import type { Combo, StoriesHash } from '@storybook/api';
import { Consumer } from '@storybook/api';

import { Sidebar as SidebarComponent } from '../components/sidebar/Sidebar';
import { useMenu } from './menu';

export type Item = StoriesHash[keyof StoriesHash];

const mapper = ({ state, api }: Combo) => {
  const {
    ui: { name, url, enableShortcuts },
    viewMode,
    storyId,
    refId,
    layout: { isToolshown, isFullscreen, showPanel, showNav },
    storiesHash,
    storiesConfigured,
    storiesFailed,
    refs,
  } = state;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const menu = useMenu(api, isToolshown, isFullscreen, showPanel, showNav, enableShortcuts);

  return {
    title: name,
    url,
    stories: storiesHash,
    storiesFailed,
    storiesConfigured,
    refs,
    storyId,
    refId,
    viewMode,
    menu,
    menuHighlighted: api.versionUpdateAvailable(),
    enableShortcuts,
  };
};

const Sidebar = React.memo(() => {
  return <Consumer filter={mapper}>{(fromState) => <SidebarComponent {...fromState} />}</Consumer>;
});

export default Sidebar;
