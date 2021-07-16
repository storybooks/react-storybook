/* eslint-disable react/display-name */
import React, { Component, SyntheticEvent, useCallback, MouseEventHandler } from 'react';

import { Icons, IconButton, Separator } from '@storybook/components';
import { Addon } from '@storybook/addons';

const initialZoom = 1 as const;

const Context = React.createContext({ value: initialZoom, set: (v: number) => {} });

class ZoomProvider extends Component<{ shouldScale: boolean }, { value: number }> {
  state = {
    value: initialZoom,
  };

  set = (value: number) => this.setState({ value });

  render() {
    const { children, shouldScale } = this.props;
    const { set } = this;
    const { value } = this.state;
    return (
      <Context.Provider value={{ value: shouldScale ? value : initialZoom, set }}>
        {children}
      </Context.Provider>
    );
  }
}

const { Consumer: ZoomConsumer } = Context;

const Zoom = React.memo<{
  zoomIn: MouseEventHandler;
  zoomOut: MouseEventHandler;
  reset: MouseEventHandler;
}>(({ zoomIn, zoomOut, reset }) => (
  <>
    <IconButton key="zoomin" onClick={zoomIn} title="Zoom in">
      <Icons icon="zoom" />
    </IconButton>
    <IconButton key="zoomout" onClick={zoomOut} title="Zoom out">
      <Icons icon="zoomout" />
    </IconButton>
    <IconButton key="zoomreset" onClick={reset} title="Reset zoom">
      <Icons icon="zoomreset" />
    </IconButton>
  </>
));

export { Zoom, ZoomConsumer, ZoomProvider };

// eslint-disable-next-line @typescript-eslint/ban-types
const ZoomWrapper = React.memo<{ set: Function; value: number }>(({ set, value }) => {
  const zoomIn = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();
      set(0.8 * value);
    },
    [set, value]
  );
  const zoomOut = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();
      set(1.25 * value);
    },
    [set, value]
  );
  const reset = useCallback(
    (e) => {
      e.preventDefault();
      set(initialZoom);
    },
    [set, initialZoom]
  );
  return <Zoom key="zoom" {...{ zoomIn, zoomOut, reset }} />;
});

export const zoomTool: Addon = {
  title: 'zoom',
  id: 'zoom',
  match: ({ viewMode }) => viewMode === 'story',
  render: React.memo(() => (
    <>
      <ZoomConsumer>{({ set, value }) => <ZoomWrapper {...{ set, value }} />}</ZoomConsumer>
      <Separator />
    </>
  )),
};
