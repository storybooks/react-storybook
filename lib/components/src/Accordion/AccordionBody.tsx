import { styled } from '@storybook/theming';
import React, { FC, useContext } from 'react';
import { AccordionItemContext } from './AccordionItemContext';

export type AccordionBodyProps = {
  open?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export const AccordionBody: FC<AccordionBodyProps> = ({ children, open: _open, ...rest }) => {
  const context = useContext(AccordionItemContext);

  let open = _open;

  if (context !== null) {
    open = context.open;
  }

  return (
    <Wrapper data-sb-accordion-body="" {...rest}>
      <InnerWrapper data-sb-accordion-body-inner="" isOpen={open}>
        {children}
      </InnerWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  overflow: hidden;
`;

interface InnerWrapperProps {
  isOpen: boolean;
}

const InnerWrapper = styled.div<InnerWrapperProps>(({ isOpen, theme }) => ({
  height: isOpen ? 'auto' : 0,
  display: isOpen ? 'block' : 'none',
  transition: `height 175ms ease-in-out`,
  color: theme.color.defaultText,
}));
