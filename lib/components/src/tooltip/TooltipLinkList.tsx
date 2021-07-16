import React, { FunctionComponent, useCallback, SyntheticEvent, useRef } from 'react';
import { styled } from '@storybook/theming';

import ListItem, { LinkWrapperType, ListItemProps } from './ListItem';

const List = styled.div(
  {
    minWidth: 180,
    overflow: 'hidden',
    overflowY: 'auto',
    maxHeight: 13.5 * 32, // 11.5 items
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
  const ref = useRef(rest);
  ref.current = rest;
  const onClick = useCallback(
    (event: SyntheticEvent) => {
      onClickFromProps(event, ref.current);
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

export const TooltipLinkList: FunctionComponent<TooltipLinkListProps> = ({
  links,
  LinkWrapper,
}) => (
  <List>
    {links.map(({ isGatsby, ...p }) => (
      <Item key={p.id} LinkWrapper={isGatsby ? LinkWrapper : null} {...p} />
    ))}
  </List>
);

TooltipLinkList.defaultProps = {
  LinkWrapper: ListItem.defaultProps.LinkWrapper,
};
