/* eslint-disable react/display-name */
import React, { Component, Fragment, ReactElement } from 'react';
import { shortcutToHumanString } from '@storybook/api/shortcut';
import { styled } from '@storybook/theming';
import { Tabs, Icons, IconButton } from '@storybook/components';
import { State } from '@storybook/api';

const DesktopOnlyIconButton = styled(IconButton)({
  // Hides full screen icon at mobile breakpoint defined in app.js
  '@media (max-width: 599px)': {
    display: 'none',
  },
});

export interface SafeTabProps {
  title: (() => string) | string;
  id: string;
  children: ReactElement;
}

const SafeTabContent = React.memo<SafeTabProps>(({ children }) => children);

class SafeTab extends Component<SafeTabProps, { hasError: boolean }> {
  constructor(props: SafeTabProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, info: any) {
    this.setState({ hasError: true });
    // eslint-disable-next-line no-console
    console.error(error, info);
  }

  render() {
    const { hasError } = this.state;
    const { children, title, id } = this.props;
    if (hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return (
      <SafeTabContent id={id} title={title}>
        {children}
      </SafeTabContent>
    );
  }
}

const AddonPanel = React.memo<{
  selectedPanel?: string;
  actions: { onSelect: (id: string) => void } & Record<string, any>;
  panels: Record<string, any>;
  shortcuts: State['shortcuts'];
  panelPosition?: 'bottom' | 'right';
  absolute?: boolean;
}>(
  ({
    panels,
    shortcuts,
    actions,
    selectedPanel = null,
    panelPosition = 'right',
    absolute = true,
  }) => (
    <Tabs
      absolute={absolute}
      selected={selectedPanel}
      actions={actions}
      tools={
        <Fragment>
          <DesktopOnlyIconButton
            key="position"
            onClick={actions.togglePosition}
            title={`Change addon orientation [${shortcutToHumanString(shortcuts.panelPosition)}]`}
          >
            <Icons icon={panelPosition === 'bottom' ? 'sidebaralt' : 'bottombar'} />
          </DesktopOnlyIconButton>
          <DesktopOnlyIconButton
            key="visibility"
            onClick={actions.toggleVisibility}
            title={`Hide addons [${shortcutToHumanString(shortcuts.togglePanel)}]`}
          >
            <Icons icon="close" />
          </DesktopOnlyIconButton>
        </Fragment>
      }
      id="storybook-panel-root"
    >
      {Object.entries(panels).map(([k, v]) => (
        <SafeTab key={k} id={k} title={v.title}>
          {v.render}
        </SafeTab>
      ))}
    </Tabs>
  )
);

AddonPanel.displayName = 'AddonPanel';

export default AddonPanel;
