import React, { FC } from 'react';
import { styled } from '@storybook/theming';
import { logger } from '@storybook/client-logger';
import { ControlProps, OptionsSingleSelection, NormalizedOptionsConfig } from '../../types';
import { selectedKey } from './helpers';
import { getControlId } from '../helpers';

const Wrapper = styled.div<{ isInline: boolean }>(({ isInline }) =>
  isInline
    ? {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',

        label: {
          display: 'inline-flex',
          marginRight: 15,
        },
      }
    : {
        label: {
          display: 'flex',
        },
      }
);

const Fieldset = styled.fieldset({
  border: 0,
  padding: 0,
  margin: 0,
});

const Text = styled.span({});

const Label = styled.label({
  lineHeight: '20px',
  alignItems: 'center',
  marginBottom: 8,

  '&:last-child': {
    marginBottom: 0,
  },

  input: {
    margin: 0,
    marginRight: 6,
  },
});

type RadioConfig = NormalizedOptionsConfig & { isInline: boolean };
type RadioProps = ControlProps<OptionsSingleSelection> & RadioConfig;
export const RadioControl: FC<RadioProps> = ({ name, options, value, onChange, isInline }) => {
  if (!options) {
    logger.warn(`Radio with no options: ${name}`);
    return <>-</>;
  }
  const selection = selectedKey(value, options);
  const controlId = getControlId(name);

  return (
    <Wrapper isInline={isInline}>
      {Object.keys(options).map((key, index) => {
        const id = `${controlId}-${index}`;
        return (
          <Label key={id} htmlFor={id}>
            <input
              type="radio"
              id={id}
              name={id}
              value={key}
              onChange={(e) => onChange(options[e.currentTarget.value])}
              checked={key === selection}
            />
            <Text>{key}</Text>
          </Label>
        );
      })}
    </Wrapper>
  );
};
