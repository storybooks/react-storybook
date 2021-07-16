import React, { useEffect, useRef } from 'react';
import { useArgs } from '@storybook/client-api';

export default {
  title: 'Core/Rendering',
};

// NOTE: in our example apps each component is mounted twice as we render in strict mode
let timesCounterMounted = 0;
export const Counter = () => {
  const countRef = useRef();

  if (!countRef.current) timesCounterMounted += 1;
  countRef.current = (countRef.current || 0) + 1;

  return (
    <div>
      Mounted: {timesCounterMounted}, rendered (this mount): {countRef.current}
    </div>
  );
};

// An example to test what happens when the story is remounted due to argChanges
let timesArgsChangeMounted = 0;
export const ArgsChange = () => {
  const countRef = useRef();

  if (!countRef.current) timesArgsChangeMounted += 1;
  countRef.current = true;

  return (
    <div>
      Mounted: {timesArgsChangeMounted} (NOTE: we use strict mode so this number is 2x what you'd
      expect -- it should be 2, not 4 though!)
    </div>
  );
};

ArgsChange.args = {
  first: 0,
};

ArgsChange.decorators = [
  (StoryFn) => {
    const [args, updateArgs] = useArgs();

    useEffect(() => {
      if (args.first === 0) {
        updateArgs({ first: 1 });
      }
    }, [args.first, updateArgs]);

    return <StoryFn />;
  },
];
