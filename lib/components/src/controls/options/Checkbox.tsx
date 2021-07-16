import React, { FC, ChangeEvent, useState, Fragment } from 'react';
import { styled } from '@storybook/theming';
import { logger } from '@storybook/client-logger';
import { ControlProps, OptionsMultiSelection, NormalizedOptionsConfig } from '../../types';
import { selectedKeys, selectedValues } from './helpers';
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

type CheckboxConfig = NormalizedOptionsConfig & { isInline: boolean };
type CheckboxProps = ControlProps<OptionsMultiSelection> & CheckboxConfig;
export const CheckboxControl: FC<CheckboxProps> = ({
  name,
  options,
  value,
  onChange,
  isInline,
}) => {
  if (!options) {
    logger.warn(`Checkbox with no options: ${name}`);
    return <>-</>;
  }

  const initial = selectedKeys(value, options);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selected, setSelected] = useState(initial);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const option = (e.target as HTMLInputElement).value;
    const updated = [...selected];
    if (updated?.includes(option)) {
      updated.splice(updated.indexOf(option), 1);
    } else {
      updated.push(option);
    }
    onChange(selectedValues(updated, options));
    setSelected(updated);
  };

  const controlId = getControlId(name);

  return (
    <Wrapper isInline={isInline}>
      {Object.keys(options).map((key, index) => {
        const id = `${controlId}-${index}`;
        return (
          <Label key={id} htmlFor={id}>
            <input
              type="checkbox"
              id={id}
              name={id}
              value={key}
              onChange={handleChange}
              checked={selected?.includes(key)}
            />
            <Text>{key}</Text>
          </Label>
        );
      })}
    </Wrapper>
  );
};
