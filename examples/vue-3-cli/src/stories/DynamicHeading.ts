/*
  Functional Vue 3 component
  Inspired by https://v3.vuejs.org/guide/migration/functional-components.html#components-created-by-functions
 */

import { FunctionalComponent, h } from 'vue';

export type Props = {
  level: number;
};

export type Component = FunctionalComponent<Props>;

const DynamicHeading: Component = (props, context) =>
  h(`h${props.level}`, context.attrs, context.slots);

/*
  Props object definition is tied to the Props type used in FunctionalComponent<Props>

  Try adding a prop that doesn't exist on the type...
 */
DynamicHeading.props = {
  level: {
    type: Number,
  },
};

export default DynamicHeading;
