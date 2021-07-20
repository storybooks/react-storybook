import { styled } from '@storybook/theming';
import { nanoid } from 'nanoid';
import React, { Children, FC, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AccordionContext } from './AccordionContext';
import { AccordionItemContext } from './AccordionItemContext';

// Props are also available from Accordion context provider, but local props
// takes precedence for scope control
export type AccordionItemProps = {
  open?: boolean;
  indentBody?: boolean;
  lined?: boolean;
  narrow?: boolean;
  preventToggle?: boolean;
} & React.HTMLAttributes<HTMLLIElement>;

export const AccordionItem: FC<AccordionItemProps> = ({
  children,
  open: _open,
  indentBody: _indentBody,
  narrow: _narrow,
  lined: _lined,
  preventToggle: _preventToggle,
  ...rest
}) => {
  const [open, setOpen] = useState(_open);
  const context = useContext(AccordionContext);
  const id = useRef(nanoid());
  const preventOpen = Children.count(children) < 2;
  const initialOpen = useRef(_open);
  const allowDynamicOpen = !preventOpen && _open !== true;

  const onExpand = useCallback(() => {
    if (allowDynamicOpen) {
      if (context !== null) {
        context.onOpen(id.current);
      } else {
        setOpen(true);
      }
    }
  }, [setOpen, context]);

  const onCollapse = useCallback(() => {
    if (allowDynamicOpen) {
      if (context !== null) {
        context.onClose(id.current);
      } else {
        setOpen(false);
      }
    }
  }, [setOpen, context]);

  // If we have an accordion container context provider we need to register
  // this accordion item to work as a part of a team
  useEffect(() => {
    if (context !== null) {
      context.addToMap(id.current);
    }
  }, []);

  // Possible outside influences such as from prop or from context provider
  useEffect(() => {
    if (allowDynamicOpen) {
      let newOpen = open;

      if (_open !== open) {
        newOpen = _open;
      }

      if (context !== null) {
        newOpen = context.openState[id.current];
      }

      setOpen(newOpen);
    }
  }, [context, _open, preventOpen]);

  let indentBody = _indentBody;
  let narrow = _narrow;
  let lined = _lined;
  let preventToggle = _preventToggle;
  let bordered = false;

  if (context) {
    indentBody = _indentBody === true ? true : context.indentBody;
    narrow = _narrow === true ? true : context.narrow;
    lined = _lined === true ? true : context.lined;
    preventToggle = _preventToggle === true ? true : context.preventToggle || initialOpen.current;
    bordered = context.bordered;
  }

  return (
    <AccordionItemContext.Provider
      value={{
        id: id.current,
        open,
        preventOpen,
        preventToggle,
        onClose: onCollapse,
        onOpen: onExpand,
      }}
    >
      <Wrapper
        aria-labelledby={`${id.current}-label`}
        aria-expanded={open ? 'true' : 'false'}
        data-sb-accordion-item=""
        bordered={bordered}
        lined={lined}
        indentBody={indentBody}
        narrow={narrow}
        preventOpen={preventOpen}
        {...rest}
      >
        {children}
      </Wrapper>
    </AccordionItemContext.Provider>
  );
};

interface WrapperProps {
  bordered: boolean;
  lined: boolean;
  indentBody: boolean;
  preventOpen: boolean;
  narrow: boolean;
}

const Wrapper = styled.li<WrapperProps>(
  {
    padding: 0,
    margin: 0,
    listStyle: 'none',
  },
  ({ theme, narrow, indentBody }) => ({
    '[data-sb-accordion-header]': {
      padding: narrow ? '10px 15px' : 15,
      fontSize: theme.typography.size.s2 - 1,
      border: '1px solid transparent',
      '&:hover': {
        backgroundColor: theme.background.hoverable,
      },
    },
    '[data-sb-accordion-expander-wrapper]': {
      marginRight: narrow ? 12 : 16,
      paddingTop: 3,
    },
    '[data-sb-accordion-expander]': {
      minWidth: narrow ? 14 : 16,
      minHeight: narrow ? 14 : 16,
      svg: {
        height: narrow ? 14 : 16,
        width: 'auto',
      },
      'svg[data-sb-accordion-chevron]': {
        width: narrow ? 10 : 12,
        height: narrow ? 10 : 12,
      },
    },
    '[data-sb-accordion-body]': {
      fontSize: theme.typography.size.s2 - 1,
      backgroundColor: theme.background.app,
    },
    '&[aria-expanded="true"]': {
      '[data-sb-accordion-body-inner]': {
        padding: narrow
          ? `20px 16px 20px ${indentBody ? '43px' : '17px'}`
          : `24px 16px 24px ${indentBody ? '49px' : '17px'}`,
      },
    },
    '&:hover': {
      '[data-sb-accordion-body]': {
        // backgroundColor: theme.background.app,
      },
    },
  }),
  ({ preventOpen }) =>
    preventOpen && {
      '[data-sb-accordion-header]': {
        cursor: 'default',
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
    },
  ({ theme, lined, bordered }) =>
    lined
      ? {
          borderBottom: `1px solid ${theme.appBorderColor}`,
          '&:last-child': {
            borderBottomWidth: bordered ? 0 : 1,
          },
          '&[aria-expanded="true"]': {
            '& > [data-sb-accordion-header]': {
              borderBottom: `1px solid ${theme.appBorderColor}`,
            },
          },
        }
      : {}
);
