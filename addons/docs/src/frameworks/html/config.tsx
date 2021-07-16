import React from 'react';
import { StoryFn } from '@storybook/addons';

const prepareForInline = (storyFn: StoryFn<string>) => {
  const html = storyFn();
  if (typeof html === 'string') {
    // eslint-disable-next-line react/no-danger
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return (
    <div ref={(node?: HTMLDivElement): never | null => (node ? node.appendChild(html) : null)} />
  );
};

export const parameters = {
  docs: {
    inlineStories: true,
    prepareForInline,
  },
};
