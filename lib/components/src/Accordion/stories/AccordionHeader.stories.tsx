import type { ComponentStory, Meta } from '@storybook/react';
import React from 'react';
import { AccordionHeader } from '../AccordionHeader';

export default {
  title: 'Basics/Accordion/AccordionHeader',
  component: AccordionHeader,
  argTypes: { onOpen: { action: 'open' }, onClose: { action: 'close' } },
} as Meta;

const Template: ComponentStory<typeof AccordionHeader> = (args) => (
  <AccordionHeader {...args}>Item 1</AccordionHeader>
);

export const Controllable = Template.bind({});
Controllable.args = {
  open: false,
  hideIcon: false,
  preventToggle: false,
};
