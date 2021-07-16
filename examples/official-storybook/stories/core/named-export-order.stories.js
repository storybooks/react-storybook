export default {
  title: 'Core/Named Export Order',
  parameters: { chromatic: { disable: true } },
};

export const Story1 = () => 'story1';
export const Story2 = () => 'story2';

// eslint-disable-next-line no-underscore-dangle, @typescript-eslint/naming-convention
export const __namedExportsOrder = ['Story2', 'Story1'];
