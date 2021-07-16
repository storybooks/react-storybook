import { mount } from '@storybook/riot';
import { linkTo } from '@storybook/addon-links';
import { action } from '@storybook/addon-actions';

// eslint-disable-next-line import/no-webpack-loader-syntax
import MyButtonRaw from 'raw-loader!./MyButton.tag';
import './MyButton.tag';

export default {
  title: 'Button',
  argTypes: {
    content: { control: 'text' },
  },
};

const Template = (args) => mount('my-button', args);

export const Text = Template.bind({});
Text.args = {
  content: 'Button',
  onClick: action('onClick'),
};

export const Emoji = Template.bind({});
Emoji.args = {
  content: '😀 😎 👍 💯',
};

export const WithScenario = () => ({
  tags: [{ content: MyButtonRaw, boundAs: 'MyButton' }],
  template: '<MyButton>With scenario</MyButton>',
});

export const TextWithAction = () =>
  mount('my-button', {
    content: 'Trigger Action',
    onClick: () => action('This was clicked')(),
  });

TextWithAction.storyName = 'With an action';

export const ButtonWithLinkToAnotherStory = () =>
  mount('my-button', {
    content: 'Go to Welcome Story',
    onClick: linkTo('example-introduction--page'),
  });

ButtonWithLinkToAnotherStory.storyName = 'button with link to another story';
