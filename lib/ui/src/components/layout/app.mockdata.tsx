/* eslint-disable react/display-name */
import global from 'global';
import React, { Component, FunctionComponent } from 'react';
import { styled } from '@storybook/theming';
import { Collection } from '@storybook/addons';
import { State } from '@storybook/api';
import { Sidebar, SidebarProps } from '../sidebar/Sidebar';
import Panel from '../panel/panel';
import { Preview } from '../preview/preview';

import { previewProps } from '../preview/preview.mockdata';
import { mockDataset } from '../sidebar/mockdata';
import { DesktopProps } from './desktop';

const { setInterval } = global;

export const shortcuts: State['shortcuts'] = {
  fullScreen: ['F'],
  togglePanel: ['A'],
  panelPosition: ['D'],
  toggleNav: ['S'],
  toolbar: ['T'],
  search: ['/'],
  focusNav: ['1'],
  focusIframe: ['2'],
  focusPanel: ['3'],
  prevComponent: ['alt', 'ArrowUp'],
  nextComponent: ['alt', 'ArrowDown'],
  prevStory: ['alt', 'ArrowLeft'],
  nextStory: ['alt', 'ArrowRight'],
  shortcutsPage: ['ctrl', 'shift', ','],
  aboutPage: [','],
  escape: ['escape'],
  collapseAll: ['ctrl', 'shift', 'ArrowUp'],
  expandAll: ['ctrl', 'shift', 'ArrowDown'],
};

export const panels: Collection = {
  test1: {
    title: 'Test 1',
    render: ({ active, key }) =>
      active ? (
        <div id="test1" key={key}>
          TEST 1
        </div>
      ) : null,
  },
  test2: {
    title: 'Test 2',
    render: ({ active, key }) =>
      active ? (
        <div id="test2" key={key}>
          TEST 2
        </div>
      ) : null,
  },
};

const realSidebarProps: SidebarProps = {
  stories: mockDataset.withRoot,
  menu: [],
  refs: {},
  storiesConfigured: true,
};

const PlaceholderBlock = styled.div(({ color }) => ({
  background: color || 'hotpink',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
}));

class PlaceholderClock extends Component<{ color: string }, { count: number }> {
  state = {
    count: 1,
  };

  interval: ReturnType<typeof setTimeout>;

  componentDidMount() {
    this.interval = setInterval(() => {
      const { count } = this.state;
      this.setState({ count: count + 1 });
    }, 1000);
  }

  componentWillUnmount() {
    const { interval } = this;
    clearInterval(interval);
  }

  render() {
    const { children, color } = this.props;
    const { count } = this.state;
    return (
      <PlaceholderBlock color={color}>
        <h2
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            color: 'rgba(0,0,0,0.2)',
            fontSize: '150px',
            lineHeight: '150px',
            margin: '-20px',
          }}
        >
          {count}
        </h2>
        {children}
      </PlaceholderBlock>
    );
  }
}

const MockSidebar: FunctionComponent<any> = (props) => (
  <PlaceholderClock color="hotpink">
    <pre>{JSON.stringify(props, null, 2)}</pre>
  </PlaceholderClock>
);
const MockPreview: FunctionComponent<any> = (props) => (
  <PlaceholderClock color="deepskyblue">
    <pre>{JSON.stringify(props, null, 2)}</pre>
  </PlaceholderClock>
);
const MockPanel: FunctionComponent<any> = (props) => (
  <PlaceholderClock color="orangered">
    <pre>{JSON.stringify(props, null, 2)}</pre>
  </PlaceholderClock>
);
export const MockPage: FunctionComponent<any> = (props) => (
  <PlaceholderClock color="cyan">
    <pre>{JSON.stringify(props, null, 2)}</pre>
  </PlaceholderClock>
);

export const mockProps: DesktopProps = {
  Sidebar: MockSidebar,
  Preview: MockPreview,
  Panel: MockPanel,
  Notifications: () => null,
  pages: [],
  options: {
    isFullscreen: false,
    showNav: true,
    showPanel: true,
    panelPosition: 'right',
    isToolshown: true,
    initialActive: 'canvas',
  },
  viewMode: 'story',
  panelCount: 2,
  width: 900,
  height: 600,
  docsOnly: false,
};

export const realProps: DesktopProps = {
  Sidebar: () => <Sidebar {...realSidebarProps} />,
  Preview: () => <Preview {...previewProps} />,
  Notifications: () => null,
  Panel: () => (
    <Panel
      panels={panels}
      actions={{ onSelect: () => {}, toggleVisibility: () => {}, togglePosition: () => {} }}
      selectedPanel="test2"
      panelPosition="bottom"
      shortcuts={shortcuts}
      absolute={false}
    />
  ),
  pages: [],
  options: {
    isFullscreen: false,
    showNav: true,
    showPanel: true,
    panelPosition: 'right',
    isToolshown: true,
    initialActive: 'canvas',
  },
  viewMode: 'story',
  panelCount: 2,
  width: 900,
  height: 600,
  docsOnly: false,
};
