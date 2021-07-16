import { html } from 'lit';
import { Story, Meta } from '@storybook/web-components';
import '../../../components/sb-button';

export default {
  title: 'Addons / Controls',
  argTypes: {
    backgroundColor: { control: 'color' },
    size: {
      control: {
        type: 'radio',
        options: ['small', 'medium', 'large'],
      },
    },
  },
} as Meta;

const Template: Story = ({ primary, backgroundColor, size, label, sbButtonClickHandler }) =>
  html`<sb-button
    ?primary="${primary}"
    .size="${size}"
    .label="${label}"
    .backgroundColor="${backgroundColor}"
    @sb-button:click="${sbButtonClickHandler}"
  ></sb-button>`;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
  label: 'Button',
  backgroundColor: '#ff00ff',
  size: 'small',
};

export const Large = Template.bind({});
Large.args = {
  label: 'Large Button',
  size: 'large',
};

export const ClickHandler = Template.bind({});
ClickHandler.args = {
  label: 'Click me to fire an alert!',
  // eslint-disable-next-line no-alert
  sbButtonClickHandler: () => alert('Storybook Button clicked!'),
};
