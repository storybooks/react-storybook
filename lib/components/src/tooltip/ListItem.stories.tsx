import React from 'react';
import { storiesOf } from '@storybook/react';
import { styled } from '@storybook/theming';
import ListItem from './ListItem';

import { Icons } from '../icon/icon';

const Ul = styled.ul({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

storiesOf('basics/Tooltip/ListItem', module)
  .add('all', () => (
    <Ul>
      <ListItem loading />
      <ListItem title="Default" />
      <ListItem title="Default icon" right={<Icons icon="eye" />} />
      <ListItem left="left" title="title" center="center" right="right" />
      <ListItem active left="left" title="active" center="center" right="right" />
      <ListItem
        active
        left="left"
        title="active icon"
        center="center"
        right={<Icons icon="eye" />}
      />
      <ListItem disabled left="left" title="disabled" center="center" right="right" />
    </Ul>
  ))
  .add('loading', () => (
    <Ul>
      <ListItem loading />
    </Ul>
  ))
  .add('default', () => (
    <Ul>
      <ListItem title="Default" />
    </Ul>
  ))
  .add('default icon', () => (
    <Ul>
      <ListItem title="Default icon" right={<Icons icon="eye" />} />
    </Ul>
  ))
  .add('active icon', () => (
    <Ul>
      <ListItem active title="active icon" right={<Icons icon="eye" />} />
    </Ul>
  ))
  .add('w/positions', () => (
    <Ul>
      <ListItem left="left" title="title" center="center" right="right" />
    </Ul>
  ))
  .add('w/positions active', () => (
    <Ul>
      <ListItem active left="left" title="active" center="center" right="right" />
    </Ul>
  ))
  .add('disabled', () => (
    <Ul>
      <ListItem disabled left="left" title="disabled" center="center" right="right" />
    </Ul>
  ));
