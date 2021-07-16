import React, { Fragment, FunctionComponent } from 'react';
import { Placeholder } from '@storybook/components';
import { Result } from 'axe-core';
import { Item } from './Item';
import { RuleType } from '../../types';

export interface ReportProps {
  items: Result[];
  empty: string;
  type: RuleType;
}

export const Report: FunctionComponent<ReportProps> = ({ items, empty, type }) => (
  <Fragment>
    {items && items.length ? (
      items.map((item) => <Item item={item} key={`${type}:${item.id}`} type={type} />)
    ) : (
      <Placeholder key="placeholder">{empty}</Placeholder>
    )}
  </Fragment>
);
