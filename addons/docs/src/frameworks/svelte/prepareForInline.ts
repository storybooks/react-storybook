import { StoryFn } from '@storybook/addons';

import React from 'react';

// @ts-ignore
import HOC from './HOC.svelte';

const Prepare = (storyFn: StoryFn) => {
  const el = React.useRef(null);
  React.useEffect(() => {
    const root = new HOC({
      target: el.current,
      props: {
        storyFn,
      },
    });
    return () => root.$destroy();
  });

  return React.createElement('div', { ref: el });
};

export { Prepare as prepareForInline };
