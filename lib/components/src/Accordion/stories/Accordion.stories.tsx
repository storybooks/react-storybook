import type { ComponentStory, Meta } from '@storybook/react';
import React from 'react';
import { Icons } from '../../icon/icon';
import { Accordion } from '../Accordion';
import { AccordionBody } from '../AccordionBody';
import { AccordionHeader } from '../AccordionHeader';
import { AccordionItem } from '../AccordionItem';

export default {
  title: 'Basics/Accordion',
  component: Accordion,
  argTypes: { onOpen: { action: 'open' }, onClose: { action: 'close' } },
  parameters: {
    test: { disable: true },
    storysource: { disable: true },
  },
} as Meta;

const Template: ComponentStory<typeof Accordion> = (args) => (
  <Accordion {...args}>
    <AccordionItem>
      <AccordionHeader>Default AccordionItem</AccordionHeader>
      <AccordionBody>
        Minim proident eu aliqua irure tempor incididunt fugiat. Adipisicing aliquip cillum esse
        amet.
      </AccordionBody>
    </AccordionItem>
    <AccordionItem>
      <AccordionHeader>
        Normal deafult AccordionItem with a very long title so we can check if the label will wrap
        correctly with the expander icon. You may have to resize the viewport to make this happen -
        but this thext should be long enough.
      </AccordionHeader>
      <AccordionBody>
        Minim proident eu aliqua irure tempor incididunt fugiat. Adipisicing aliquip cillum esse
        amet. Consequat qui consectetur duis laboris aliqua fugiat Lorem eiusmod ut cupidatat
        excepteur. Magna nulla nulla velit voluptate duis nulla quis Lorem dolore labore aliqua sit
        ipsum.
      </AccordionBody>
    </AccordionItem>
    <AccordionItem>
      <AccordionHeader Icon={<Icons icon="lightning" />}>
        Custom icon in AccordionHeader
      </AccordionHeader>
      <AccordionBody>
        Minim proident eu aliqua irure tempor incididunt fugiat. Adipisicing aliquip cillum esse
        amet. Consequat qui consectetur duis laboris aliqua fugiat Lorem eiusmod ut cupidatat
        excepteur. Magna nulla nulla velit voluptate duis nulla quis Lorem dolore labore aliqua sit
        ipsum.
      </AccordionBody>
    </AccordionItem>
    <AccordionItem>
      <AccordionHeader>AccordionHeader only - can not be opened</AccordionHeader>
    </AccordionItem>
    <AccordionItem>
      <AccordionHeader hideIcon>Can be opened - but icon hidden</AccordionHeader>
      <AccordionBody>
        This is a normal AccordionIcon, but with hideIcon set on AccordionHeader
      </AccordionBody>
    </AccordionItem>
  </Accordion>
);

export const Controllable = Template.bind({});
Controllable.args = {
  allowMultipleOpen: false,
  bordered: true,
  rounded: true,
  lined: true,
  indentBody: true,
  narrow: false,
  preventToggle: false,
};
