import React, { Fragment } from 'react';
import { DecoratorFn } from '@storybook/react';

import isChromatic from 'chromatic/isChromatic';

import { Desktop, DesktopProps } from './desktop';

import { store } from './persist';
import { mockProps, realProps, MockPage } from './app.mockdata';

export default {
  title: 'UI/Layout/Desktop',
  component: Desktop,
  parameters: { passArgsFirst: false },
  decorators: [
    ((StoryFn, c) => {
      const mocked = true;
      const height = 900;
      const width = 1200;

      if (isChromatic) {
        store.local.set(`storybook-layout`, {});
      }

      const props = {
        height,
        width,
        ...(mocked ? mockProps : realProps),
      };

      return (
        <div style={{ minHeight: 900, minWidth: 1200 }}>
          <StoryFn props={props} {...c} />;
        </div>
      );
    }) as DecoratorFn,
  ],
};

export const Default = ({ props }: { props: DesktopProps }) => <Desktop {...props} />;
export const NoAddons = ({ props }: { props: DesktopProps }) => (
  <Desktop {...props} panelCount={0} />
);
export const NoSidebar = ({ props }: { props: DesktopProps }) => (
  <Desktop {...props} options={{ ...props.options, showNav: false }} />
);
export const NoPanel = ({ props }: { props: DesktopProps }) => (
  <Desktop {...props} options={{ ...props.options, showPanel: false }} />
);
export const BottomPanel = ({ props }: { props: DesktopProps }) => (
  <Desktop {...props} options={{ ...props.options, panelPosition: 'bottom' }} />
);
export const Fullscreen = ({ props }: { props: DesktopProps }) => (
  <Desktop {...props} options={{ ...props.options, isFullscreen: true }} />
);
export const NoPanelNoSidebar = ({ props }: { props: DesktopProps }) => (
  <Desktop {...props} options={{ ...props.options, showPanel: false, showNav: false }} />
);
export const Page = ({ props }: { props: DesktopProps }) => (
  <Desktop
    {...props}
    pages={[
      {
        key: 'settings',
        route: ({ children }) => <Fragment>{children}</Fragment>,
        render: () => <MockPage />,
      },
    ]}
    viewMode="settings"
  />
);
