/* eslint-disable react/display-name */
import React, { FunctionComponent, useMemo } from 'react';
import sizeMe from 'react-sizeme';

import { State } from '@storybook/api';
import { Symbols } from '@storybook/components';
import { Route } from '@storybook/router';
import { Global, createGlobal, styled } from '@storybook/theming';

import { Mobile } from './components/layout/mobile';
import { Desktop } from './components/layout/desktop';
import Sidebar from './containers/sidebar';
import Preview from './containers/preview';
import Panel from './containers/panel';
import Notifications from './containers/notifications';

import SettingsPages from './settings';

const View = styled.div({
  position: 'fixed',
  overflow: 'hidden',
  height: '100vh',
  width: '100vw',
});

export interface AppProps {
  viewMode: State['viewMode'];
  docsOnly: boolean;
  layout: State['layout'];
  panelCount: number;
  size: {
    width: number;
    height: number;
  };
}

const App = React.memo<AppProps>(
  ({ viewMode, docsOnly, layout, panelCount, size: { width, height } }) => {
    let content;

    const props = useMemo(
      () => ({
        Sidebar,
        Preview,
        Panel,
        Notifications,
        pages: [
          {
            key: 'settings',
            render: () => <SettingsPages />,
            route: (({ children }) => (
              <Route path="/settings" startsWith>
                {children}
              </Route>
            )) as FunctionComponent,
          },
        ],
      }),
      []
    );

    if (!width || !height) {
      content = <div />;
    } else if (width < 600) {
      content = <Mobile {...props} viewMode={viewMode} options={layout} docsOnly={docsOnly} />;
    } else {
      content = (
        <Desktop
          {...props}
          viewMode={viewMode}
          options={layout}
          docsOnly={docsOnly}
          {...{ width, height }}
          panelCount={panelCount}
        />
      );
    }

    return (
      <View>
        <Global styles={createGlobal} />
        <Symbols icons={['folder', 'component', 'document', 'bookmarkhollow']} />
        {content}
      </View>
    );
  },
  // This is the default shallowEqual implementation, but with custom behavior for the `size` prop.
  (prevProps: any, nextProps: any) => {
    if (Object.is(prevProps, nextProps)) return true;
    if (typeof prevProps !== 'object' || prevProps === null) return false;
    if (typeof nextProps !== 'object' || nextProps === null) return false;

    const keysA = Object.keys(prevProps);
    const keysB = Object.keys(nextProps);
    if (keysA.length !== keysB.length) return false;

    // eslint-disable-next-line no-restricted-syntax
    for (const key of keysA) {
      if (key === 'size') {
        // SizeMe injects a new `size` object every time, even if the width/height doesn't change,
        // so we chech that one manually.
        if (prevProps[key].width !== nextProps[key].width) return false;
        if (prevProps[key].height !== nextProps[key].height) return false;
      } else {
        if (!Object.prototype.hasOwnProperty.call(nextProps, key)) return false;
        if (!Object.is(prevProps[key], nextProps[key])) return false;
      }
    }

    return true;
  }
);

const SizedApp = sizeMe({ monitorHeight: true })(App);

App.displayName = 'App';

export default SizedApp;
