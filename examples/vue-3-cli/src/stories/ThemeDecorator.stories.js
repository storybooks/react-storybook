// Just going to use the Button component for this example
import MyButton from './Button.vue';

const withTheme = (Story, context) => ({
  data() {
    return {
      theme: context.globals.theme,
    };
  },
  template: `<div class="theme" :class="theme"><story /></div>`,
});

export default {
  title: 'Example/Theme Decorator',
  component: MyButton,
  argTypes: {
    backgroundColor: { control: 'color' },
    size: { control: { type: 'select', options: ['small', 'medium', 'large'] } },
    onClick: {},
  },
  decorators: [withTheme],
};

const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { MyButton },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<my-button v-bind="args" />',
});

export const ButtonWithTheme = Template.bind({});
ButtonWithTheme.args = {
  primary: true,
  label: 'Button',
};
