import React, { useState } from 'react';
import { Story, StoryError } from './Story';
import { Button } from '../Button/Button';

export default {
  title: 'Docs/Story',
  component: Story,
};

const buttonFn = () => <Button secondary>Inline story</Button>;

const buttonHookFn = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [count, setCount] = useState(0);
  return (
    <Button secondary onClick={() => setCount(count + 1)}>
      {`count: ${count}`}
    </Button>
  );
};

export const Inline = () => <Story inline storyFn={buttonFn} title="hello button" />;

export const Error = () => <Story error={StoryError.NO_STORY} />;

export const ReactHook = () => <Story inline storyFn={buttonHookFn} title="hello button" />;
