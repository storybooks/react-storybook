import { linkTo } from '@storybook/addon-links';

import Welcome from '../Welcome.vue';

export default {
  title: 'Welcome',
  component: Welcome,
};

export const welcome = () => ({
  render: (h) => h(Welcome, { listeners: { buttonRequested: linkTo('Button') } }),
});
