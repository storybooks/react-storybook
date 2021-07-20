import { styled } from '@storybook/theming';
import React, { Children, useCallback, useEffect, useRef, useState, FC } from 'react';
import type { AddToMapFn, OpenMap } from './AccordionContext';
import { AccordionContext } from './AccordionContext';

type AccordionMap = Record<string, { index: number; id: string }>;

interface StateChange {
  id: string;
  index: number;
}

export type AccordionProps = {
  /** Set to true to allow for more than one AccordionItem open at the time */
  allowMultipleOpen?: boolean;
  /** Ability to control which panel(s) are open or closed externally - or use to set default opens */
  open?: number | number[];
  /** Set to true to add theme border around the Accordion */
  bordered?: boolean;
  /** Set to true to add rounded borders from theme to Accordion */
  rounded?: boolean;
  /**
   * Set to true to add theme borders between AccordionItem's
   * Note: can be overridden on AccordionItem
   */
  lined?: boolean;
  /**
   * Set to true to indent AccordionBody content left to match the AccordionHeader text
   * Note: can be overridden on AccordionItem
   */
  indentBody?: boolean;
  /**
   * Set to true to apply narrow paddings and smaller text in all AccordionItem's
   * Note: can be overridden on AccordionItem
   */
  narrow?: boolean;
  /**
   * Set to true to prevent toggle between open and close for all AccordionItem's
   * Note: can be overridden on AccordionItem
   */
  preventToggle?: boolean;
  /** Courtesy callback prop for when a new accordion opens */
  onOpen?: (change: StateChange) => void;
  /** Courtesy callback prop for when an accordion closes */
  onClose?: (change: StateChange) => void;
} & React.HTMLAttributes<HTMLUListElement>;

/**
 *
 * Controlling wrapper component that will control the open/close functionality to
 * child ```<AccordionItem />```'s and style the other support components
 * ```<AccordionHeader />``` and ```<AccordionBody />```
 *
 * Although each component can work independently and be controlled from the outside
 * via an **open** prop, it is not recommended to use ```<AccordionItem />```,
 *  ```<AccordionHeader />``` and ```<AccordionBody />``` without this controller
 *
 * If no ```<AccordionBody />``` is inside an ```<AccordionItem />``` the open/close
 * functionality will be removed by default, as well as the icon and pointer cursor.
 */
export const Accordion: FC<AccordionProps> = ({
  allowMultipleOpen,
  children,
  open,
  rounded = false,
  bordered = false,
  narrow, // To be carried to AccordionItem children via context
  lined, // To be carried to AccordionItem children via context
  indentBody, // To be carried to AccordionItem children via context
  preventToggle, // To be carried to AccordionItem children via context
  onOpen,
  onClose,
  ...rest
}) => {
  const [openState, setOpenState] = useState<OpenMap>({});
  const openStateMap = useRef<OpenMap>({});
  const accordionMap = useRef<AccordionMap>({});
  const accordionMapIndex = useRef(0);

  const addToMap: AddToMapFn = useCallback(
    (id) => {
      const index = accordionMapIndex.current + 1;
      accordionMap.current = { ...accordionMap.current, [id]: { id, index } };
      accordionMapIndex.current = index;

      if (typeof open === 'number') {
        openStateMap.current = { ...openStateMap.current, [id]: open === index };
      } else if (Array.isArray(open)) {
        const isExpanded = open.includes(index);
        openStateMap.current = { ...openStateMap.current, [id]: isExpanded };
      } else {
        openStateMap.current = { ...openStateMap.current, [id]: false };
      }
    },
    [accordionMap, openStateMap, open]
  );

  const onItemClose = useCallback(
    (id: string) => {
      setOpenState({ ...openState, [id]: false });

      if (onClose) {
        onClose({ id, index: accordionMap.current[id].index });
      }
    },
    [openState, setOpenState, onClose, accordionMap]
  );

  const onItemOpen = useCallback(
    (id: string) => {
      const newOpen = { ...openState };
      let oldOpen: StateChange | undefined;

      if (allowMultipleOpen) {
        newOpen[id] = true;
      } else {
        Object.keys(openState).forEach((key) => {
          if (openState[key]) {
            oldOpen = { id: key, index: accordionMap.current[key].index };
          }

          newOpen[key] = id === key;
        });
      }

      if (oldOpen && onClose) {
        onClose(oldOpen);
      }

      setOpenState({ ...openState, ...newOpen });

      if (onOpen) {
        onOpen({ id, index: accordionMap.current[id].index });
      }
    },
    [openState, setOpenState, onOpen, accordionMap]
  );

  useEffect(() => {
    if (Object.keys(accordionMap.current).length === Children.count(children)) {
      setOpenState({ ...openState, ...openStateMap.current });
    }
  }, [accordionMap, openStateMap]);

  useEffect(() => {
    let newOpen: number[] = [];

    if (typeof open === 'number') {
      newOpen.push(open);
    } else if (Array.isArray(open)) {
      newOpen = open;
    }

    let newOpenState = { ...openState };

    Object.keys(accordionMap.current).forEach((key) => {
      const item = accordionMap.current[key];

      newOpenState = { ...newOpenState, [item.id]: newOpen.includes(item.index) };
    });

    setOpenState({ ...openState, ...newOpenState });
  }, [open]);

  return (
    <AccordionContext.Provider
      value={{
        addToMap,
        onClose: onItemClose,
        onOpen: onItemOpen,
        bordered,
        openState,
        indentBody,
        lined,
        narrow,
        preventToggle,
      }}
    >
      <Wrapper data-sb-accordion="" bordered={bordered} rounded={rounded} {...rest}>
        {children}
      </Wrapper>
    </AccordionContext.Provider>
  );
};

interface WrapperProps {
  bordered: boolean;
  rounded: boolean;
}

const Wrapper = styled.ul<WrapperProps>(
  ({ theme }) => ({
    overflow: 'hidden',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    backgroundColor: theme.background.content,
  }),
  ({ theme, bordered }) =>
    bordered && {
      border: `1px solid ${theme.appBorderColor}`,
    },
  ({ theme, rounded }) =>
    rounded && {
      borderRadius: theme.appBorderRadius,
    }
);
