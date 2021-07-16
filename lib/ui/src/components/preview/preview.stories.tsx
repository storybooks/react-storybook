import React from 'react';

import { Provider as ManagerProvider, Combo, Consumer } from '@storybook/api';
import { createMemorySource, createHistory } from '@reach/router';
import { Location, LocationProvider } from '@storybook/router';
import { ThemeProvider, ensure as ensureTheme, themes } from '@storybook/theming';

import { DecoratorFn } from '@storybook/react';
import { Preview } from './preview';

import { PrettyFakeProvider } from '../../FakeProvider';
import { previewProps } from './preview.mockdata';

const provider = new PrettyFakeProvider();

export default {
  title: 'UI/Preview',
  component: Preview,
  decorators: [
    ((StoryFn, c) => (
      <LocationProvider
        key="location.provider"
        history={createHistory(createMemorySource('/?path=/story/story--id'))}
      >
        <Location key="location.consumer">
          {(locationData) => (
            <ManagerProvider key="manager" provider={provider} {...locationData} docsMode={false}>
              <ThemeProvider key="theme.provider" theme={ensureTheme(themes.light)}>
                <StoryFn {...c} />
              </ThemeProvider>
            </ManagerProvider>
          )}
        </Location>
      </LocationProvider>
    )) as DecoratorFn,
  ],
};

export const noTabs = () => (
  <Consumer>
    {({ api }: Combo) => (
      <Preview
        {...previewProps}
        api={{ ...api, getElements: () => ({}) }}
        story={{ parameters: { previewTabs: { canvas: { hidden: true } } } }}
      />
    )}
  </Consumer>
);

export const hideFullscreen = () => (
  <Consumer>
    {({ api }: Combo) => (
      <Preview
        {...previewProps}
        api={{ ...api, getElements: () => ({}) }}
        story={{ parameters: { toolbar: { fullscreen: { hidden: true } } } }}
      />
    )}
  </Consumer>
);

export const hideAllDefaultTools = () => (
  <Consumer>
    {({ api }: Combo) => (
      <Preview
        {...previewProps}
        api={{ ...api, getElements: () => ({}) }}
        story={{
          parameters: {
            toolbar: {
              title: { hidden: true },
              zoom: { hidden: true },
              eject: { hidden: true },
              copy: { hidden: true },
              fullscreen: { hidden: true },
            },
          },
        }}
      />
    )}
  </Consumer>
);

export const withCanvasTab = () => (
  <Consumer>
    {({ api }: Combo) => <Preview {...previewProps} api={{ ...api, getElements: () => ({}) }} />}
  </Consumer>
);

export const withTabs = () => <Preview {...previewProps} />;
