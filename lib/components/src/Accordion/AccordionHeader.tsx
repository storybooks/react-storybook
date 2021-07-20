import { styled } from '@storybook/theming';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { Icons } from '../icon/icon';
import { AccordionItemContext } from './AccordionItemContext';

export type AccordionHeaderProps = {
  label?: string;
  hideIcon?: boolean;
  Icon?: React.ReactNode;
  LabelProps?: React.HTMLAttributes<HTMLDivElement>;
  onOpen?: () => {};
  onClose?: () => {};
  open?: boolean;
  preventToggle?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>;

export const AccordionHeader: FC<AccordionHeaderProps> = ({
  label,
  children,
  Icon,
  hideIcon,
  LabelProps: _LabelProps = {},
  onOpen,
  onClose,
  open: _open,
  preventToggle: _preventToggle,
  ...rest
}) => {
  const [open, setOpen] = useState(_open);
  const context = useContext(AccordionItemContext);
  const id = useRef('');

  const handleOnClick = () => {
    let newOpenState = !open;

    if (context !== null && !preventToggle) {
      // Context provider will take care of it and send new state back
      if (!context.preventOpen) {
        if (open) {
          context.onClose();
          newOpenState = false;
        } else {
          context.onOpen();
          newOpenState = true;
        }
      }
    } else if (!preventToggle) {
      // No context provider so we handle this ourselves
      setOpen(newOpenState);
    }

    // Handle our own events to send up through props
    if (newOpenState === true && !preventToggle) {
      // eslint-disable-next-line no-unused-expressions
      onOpen && onOpen();
    } else if (!preventToggle) {
      // eslint-disable-next-line no-unused-expressions
      onClose && onClose();
    }
  };

  useEffect(() => {
    if (_open !== open) {
      setOpen(_open);
    }
  }, [_open]);

  useEffect(() => {
    if (context !== null) {
      if (_open !== true && context.open !== open) {
        setOpen(context.open);
      }

      id.current = `${context.id}-label`;
    }
  }, [context, setOpen, _open, id]);

  // If custom DOM is provided in the header, then we can no longer automate
  // aria-labelledby="" for the <AccordionItem /> and user has to provide both the
  // id for the label and add aria-labelledby on <AccordionItem /> to match
  const LabelProps: React.HTMLAttributes<HTMLDivElement> = { ..._LabelProps };

  if (id.current) {
    LabelProps.id = id.current;
  }

  let preventToggle = _preventToggle;
  let preventOpen = false;
  let preventIcon = false;
  const hasCustomIcon = Icon !== undefined;

  if (context !== null) {
    preventToggle = _preventToggle === true ? true : context.preventToggle;
    preventOpen = context.preventOpen || false;
    preventIcon = preventOpen;
  }

  return (
    <Wrapper
      data-sb-accordion-header=""
      onClick={handleOnClick}
      preventToggle={preventToggle}
      preventOpen={preventOpen}
      disabled={preventToggle || preventOpen}
      {...rest}
    >
      <ExpanderWrapper
        data-sb-accordion-expander-wrapper=""
        hideIcon={hideIcon}
        hasCustomIcon={hasCustomIcon}
        preventIcon={preventIcon}
      >
        <Expander data-sb-accordion-expander="" isOpen={open} preventToggle={preventToggle}>
          {hasCustomIcon ? (
            Icon
          ) : (
            <Chevron
              data-sb-accordion-chevron=""
              role="img"
              aria-label="expander"
              icon="chevrondown"
            />
          )}
        </Expander>
      </ExpanderWrapper>
      <Label data-sb-accordion-label="" {...LabelProps}>
        {label || children}
      </Label>
    </Wrapper>
  );
};

interface WrapperProps {
  preventToggle: boolean;
  preventOpen: boolean;
}

const Wrapper = styled.button<WrapperProps>(({ theme, preventToggle, preventOpen }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  padding: 0,
  margin: 0,
  border: '0 none',
  textAlign: 'left',
  backgroundColor: 'transparent',
  cursor: preventToggle || preventOpen ? 'default' : 'pointer',
  fontSize: theme.typography.size.s2 - 1,
}));

interface ExpanderWrapperProps {
  hideIcon: boolean;
  preventIcon: boolean;
  hasCustomIcon: boolean;
}

const ExpanderWrapper = styled.div<ExpanderWrapperProps>(
  {
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ({ hasCustomIcon, preventIcon }) =>
    !hasCustomIcon &&
    preventIcon && {
      display: 'none',
    },
  ({ hideIcon }) =>
    hideIcon && {
      display: 'none',
    }
);

interface ExpanderProps {
  isOpen: boolean;
  preventToggle: boolean;
}

const Expander = styled.div<ExpanderProps>(({ theme, isOpen, preventToggle }) => ({
  color: theme.color.mediumdark,
  transform: preventToggle ? 'rotate(0deg)' : `rotate(${isOpen ? 90 : 0}deg)`,
  transition: 'transform 0.1s ease-in-out',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'stretch',
}));

const Chevron = styled(Icons)({
  transform: 'rotate(-90deg)',
  height: 12,
  width: 12,
});

const Label = styled.div(({ theme }) => ({
  color: theme.color.defaultText,
  width: '100%',
}));
