import { useState } from 'preact/hooks';

import { action, actions } from '@storybook/addon-actions';
import Button from '../Button';

export default {
  title: 'Addons/Actions',
};

export const ActionOnly = () => {
  const [clicks, setClicks] = useState(0);
  const log = action('log');
  return (
    <Button
      onclick={() => {
        const clicked = clicks + 1;
        setClicks(clicked);
        log(clicked);
      }}
    >
      Click me to log the action{' '}
      {clicks > 0 ? `(Clicked ${clicks} time${clicks > 1 ? 's' : ''}.)` : ''}
    </Button>
  );
};

ActionOnly.storyName = 'Action only';

export const MultipleActions = () => (
  <Button {...actions('onclick', 'ondblclick')}>(Double) click me to log the action</Button>
);

MultipleActions.storyName = 'Multiple actions';

export const MultipleActionsObject = () => (
  <Button {...actions({ onclick: 'click', ondblclick: 'double-click' })}>
    (Double) click me to log the action
  </Button>
);

MultipleActionsObject.storyName = 'Multiple actions, object';

export const ActionAndMethod = () => (
  <Button
    onclick={(event) => {
      event.preventDefault();
      action('method-log')(event.target);
    }}
  >
    Click me to log the action
  </Button>
);

ActionAndMethod.storyName = 'Action and method';
