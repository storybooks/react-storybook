import React, { FunctionComponent, useCallback, SyntheticEvent } from 'react';
import { styled } from '@storybook/theming';
import { document } from 'global';
import ListItem, { LinkWrapperType, ListItemProps } from './ListItem';

const List = styled.ul<{}>(
  {
    minWidth: 180,
    overflow: 'hidden',
    overflowY: 'auto',
    maxHeight: 13.5 * 32, // 11.5 items
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  ({ theme }) => ({
    borderRadius: theme.appBorderRadius * 2,
  })
);

export interface Link extends Omit<ListItemProps, 'onClick'> {
  id: string;
  isGatsby?: boolean;
  onClick?: (event: SyntheticEvent, item: ListItemProps) => void;
}

export interface TooltipLinkListProps {
  links: Link[];
  LinkWrapper?: LinkWrapperType;
}

const Item: FunctionComponent<TooltipLinkListProps['links'][number]> = (props) => {
  const { LinkWrapper, onClick: onClickFromProps, ...rest } = props;
  const { title, href, active } = rest;
  const onClick = useCallback(
    (event: SyntheticEvent) => {
      onClickFromProps(event, rest);
    },
    [onClickFromProps]
  );

  const hasOnClick = !!onClickFromProps;

  return (
    <ListItem
      title={title}
      active={active}
      href={href}
      LinkWrapper={LinkWrapper}
      {...rest}
      {...(hasOnClick ? { onClick } : {})}
    />
  );
};

function nextItem(list: HTMLUListElement, item: HTMLElement): HTMLElement {
  if (list === item) {
    return list.firstChild as HTMLElement;
  }
  if (item && item.nextElementSibling) {
    return item.nextElementSibling as HTMLElement;
  }
  return list.firstChild as HTMLElement;
}

function previousItem(list: HTMLUListElement, item: HTMLElement): HTMLElement {
  if (list === item) {
    return list.lastChild as HTMLElement;
  }
  if (item && item.previousElementSibling) {
    return item.previousElementSibling as HTMLElement;
  }
  return list.lastChild as HTMLElement;
}

function moveFocus(
  event: React.KeyboardEvent<any>,
  list: HTMLUListElement,
  currentFocus: HTMLElement,
  traversalFunction: (list: HTMLUListElement, item: Element) => HTMLElement | null
) {
  event.preventDefault();

  let wrappedOnce = false;
  const nextFocus = traversalFunction(list, currentFocus);

  while (nextFocus) {
    // Prevent infinite loop.
    if (nextFocus === list.firstChild) {
      if (wrappedOnce) {
        return;
      }
      wrappedOnce = true;
    }

    nextFocus.focus();
    return;
  }
}

export const TooltipLinkList: FunctionComponent<TooltipLinkListProps> = ({
  links,
  LinkWrapper,
}) => {
  const listRef = React.useRef<HTMLUListElement>(null);

  const handleKeyDown: React.KeyboardEventHandler<HTMLUListElement> = (event) => {
    const list = listRef.current;
    const { key } = event;
    const currentFocus = ((list && list.ownerDocument) || document).activeElement;
    if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;

    if (key === 'ArrowDown') {
      // Prevent scroll of the page
      moveFocus(event, list, currentFocus, nextItem);
    } else if (key === 'ArrowUp') {
      moveFocus(event, list, currentFocus, previousItem);
    } else if (key === 'Home') {
      moveFocus(event, list, null, nextItem);
    } else if (key === 'End') {
      moveFocus(event, list, null, previousItem);
    }
  };

  return (
    <List ref={listRef} onKeyDown={handleKeyDown} role="menu">
      {links.map(({ isGatsby, ...p }, index) => (
        <Item
          key={p.id}
          LinkWrapper={isGatsby ? LinkWrapper : null}
          autoFocus={index === 0}
          {...p}
        />
      ))}
    </List>
  );
};

TooltipLinkList.defaultProps = {
  LinkWrapper: ListItem.defaultProps.LinkWrapper,
};
