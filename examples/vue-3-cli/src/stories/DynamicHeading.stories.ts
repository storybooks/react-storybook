import { Story, Meta } from '@storybook/vue3';
import { FunctionalComponent, h } from 'vue';
import DynamicHeading, { Props } from './DynamicHeading';

export default {
  title: 'Example/DynamicHeading',
  component: DynamicHeading,
  argTypes: {
    // Number type is detected, but we still want to constrain the range from 1-6
    level: { control: { type: 'range', min: 1, max: 6 } },
  },
  decorators: [
    (storyFn) => {
      // Call the `storyFn` to receive a component that Vue can render
      const story = storyFn();
      // Vue 3 "Functional" component as decorator
      return () => h('div', { style: 'border: 2px solid red' }, h(story));
    },
  ],
} as Meta;

/*
  You can return a Vue 3 functional component from a Story.

  Make sure to pass the `args` the component expects  to receive as the props!
 */
const Template: Story = (args, { argTypes }) => {
  const component: FunctionalComponent<Props> = () =>
    h(DynamicHeading, args as Props, 'Hello World!');
  component.props = Object.keys(argTypes);
  return component;
};

export const One = Template.bind({});
One.args = {
  level: 1,
};
One.decorators = [
  // Vue 3 "ComponentOptions" component as decorator
  // Story Args can be destructured from the 2nd argument (`context`) to a decorator
  (storyFn, { args }) => ({
    // The `story` component is always injected into a decorator
    template: '<div :style="{ color: activeColor }"><story /></div>',
    data() {
      switch (args.level) {
        case 1:
          return { activeColor: 'purple' };
        case 2:
          return { activeColor: 'green' };
        case 3:
          return { activeColor: 'blue' };
        default:
          return { activeColor: 'unset' };
      }
    },
  }),
];

export const Two = Template.bind({});
Two.args = {
  level: 2,
};

export const Three = Template.bind({});
Three.args = {
  level: 3,
};

export const Four = Template.bind({});
Four.args = {
  level: 4,
};

export const Five = Template.bind({});
Five.args = {
  level: 5,
};

export const Six = Template.bind({});
Six.args = {
  level: 6,
};
