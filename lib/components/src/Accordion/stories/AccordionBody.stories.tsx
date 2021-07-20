import type { ComponentStory, Meta } from '@storybook/react';
import React from 'react';
import { AccordionBody } from '../AccordionBody';

export default {
  title: 'Basics/Accordion/AccordionBody',
  component: AccordionBody,
} as Meta;

const Template: ComponentStory<typeof AccordionBody> = (args) => (
  <AccordionBody {...args}>
    Minim proident eu aliqua irure tempor incididunt fugiat. Adipisicing aliquip cillum esse amet.
    Consequat qui consectetur duis laboris aliqua fugiat Lorem eiusmod ut cupidatat excepteur. Magna
    nulla nulla velit voluptate duis nulla quis Lorem dolore labore aliqua sit ipsum.
  </AccordionBody>
);

export const Controllable = Template.bind({});
Controllable.args = {
  open: true,
};
