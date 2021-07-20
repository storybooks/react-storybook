import { linkTo } from '@storybook/addon-links';

import Button from '../Button';

export default {
  title: 'Addons/Links',
};

export const GoToWelcome = () => (
  <Button onclick={linkTo('Welcome')}>This button links to Welcome</Button>
);

GoToWelcome.storyName = 'Go to welcome';
