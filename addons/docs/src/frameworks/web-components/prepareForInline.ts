/* eslint-disable @typescript-eslint/ban-types */
import type { StoryFn } from '@storybook/addons';
import React from 'react';
import { render } from 'lit-html';

export const prepareForInline = (storyFn: StoryFn) => {
  class Story extends React.Component {
    wrapperRef = React.createRef<HTMLElement>();

    componentDidMount(): void {
      render(storyFn(), this.wrapperRef.current);
    }

    render(): React.ReactElement {
      return React.createElement('div', { ref: this.wrapperRef });
    }
  }

  return (React.createElement(Story) as unknown) as React.CElement<{}, React.Component>;
};
