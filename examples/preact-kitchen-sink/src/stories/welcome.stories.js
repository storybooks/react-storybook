import { linkTo } from '@storybook/addon-links';

import Welcome from '../Welcome';

export default {
  title: 'Welcome',
  parameters: {
    component: Welcome,
  },
};

export const ToStorybook = () => <Welcome showApp={linkTo('Button')} />;

ToStorybook.storyName = 'to Storybook';
