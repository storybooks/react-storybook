import React from 'react';
import { action } from '@storybook/addon-actions';
import { Button } from '@storybook/react/demo';
import PropTypes from 'prop-types';

const Bold = ({ children }) => <b>{children}</b>;

Bold.propTypes = {
  children: PropTypes.string.isRequired,
};

export default {
  title: 'Decorators',
  component: Button,
  decorators: [
    (Story) => (
      <div style={{ padding: 25, border: '3px solid red' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithArgs = (args) => <Button {...args} />;
WithArgs.args = { onClick: action('clicked', { depth: 1 }), children: 'With args' };

export const Basic = () => <Button onClick={action('clicked', { depth: 1 })}>Basic</Button>;

export const Nested = (args) => (
  <Button {...args}>
    <Bold>Hello</Bold>
  </Button>
);
Nested.args = { onClick: action('clicked', { depth: 1 }) };
