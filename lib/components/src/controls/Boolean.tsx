import React, { FC, useCallback } from 'react';

import { opacify, transparentize } from 'polished';
import { styled } from '@storybook/theming';

import { getControlId } from './helpers';
import { Form } from '../form';
import { ControlProps, BooleanValue, BooleanConfig } from '../types';

const Label = styled.label(({ theme }) => ({
  lineHeight: '18px',
  alignItems: 'center',
  marginBottom: 8,
  display: 'inline-block',
  position: 'relative',
  whiteSpace: 'nowrap',
  background: `${opacify(0.05, theme.appBorderColor)}`,
  borderRadius: '3em',
  padding: 1,

  input: {
    appearance: 'none',
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    margin: 0,
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: '3em',

    '&:focus': {
      outline: 'none',
      boxShadow: `${theme.color.secondary} 0 0 0 1px inset !important`,
    },
  },

  span: {
    textAlign: 'center',
    fontSize: theme.typography.size.s1,
    fontWeight: theme.typography.weight.bold,
    lineHeight: '1',
    cursor: 'pointer',
    display: 'inline-block',
    padding: '7px 15px',
    transition: 'all 100ms ease-out',
    userSelect: 'none',
    borderRadius: '3em',

    color: transparentize(0.4, theme.color.defaultText),
    background: 'transparent',

    '&:hover': {
      boxShadow: `${opacify(0.3, theme.appBorderColor)} 0 0 0 1px inset`,
    },

    '&:active': {
      boxShadow: `${opacify(0.05, theme.appBorderColor)} 0 0 0 2px inset`,
      color: opacify(1, theme.appBorderColor),
    },

    '&:first-of-type': {
      paddingRight: 8,
    },
    '&:last-of-type': {
      paddingLeft: 8,
    },
  },

  'input:checked ~ span:first-of-type, input:not(:checked) ~ span:last-of-type': {
    background: theme.background.app,
    boxShadow: `${opacify(0.1, theme.appBorderColor)} 0 0 2px`,
    color: theme.color.defaultText,
    padding: '7px 15px',
  },
}));

const format = (value: BooleanValue): string | null => (value ? String(value) : null);
const parse = (value: string | null) => value === 'true';

export type BooleanProps = ControlProps<BooleanValue> & BooleanConfig;
export const BooleanControl: FC<BooleanProps> = ({ name, value, onChange, onBlur, onFocus }) => {
  const onSetFalse = useCallback(() => onChange(false), [onChange]);
  if (value === undefined) {
    return <Form.Button onClick={onSetFalse}>Set boolean</Form.Button>;
  }

  return (
    <Label htmlFor={name} title={value ? 'Change to false' : 'Change to true'}>
      <input
        id={getControlId(name)}
        type="checkbox"
        onChange={(e) => onChange(e.target.checked)}
        checked={value || false}
        {...{ name, onBlur, onFocus }}
      />
      <span>False</span>
      <span>True</span>
    </Label>
  );
};
