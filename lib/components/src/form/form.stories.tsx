import React from 'react';
import { styled } from '@storybook/theming';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { Input, Button, Select, Textarea } from './input/input';
import { Field } from './field/field';
import { Spaced } from '../spaced/Spaced';

const Flexed = styled(Field)({ display: 'flex' });

storiesOf('Basics/Form/Field', module).add('field', () => (
  <Field key="key" label="label">
    <Select value="val2" onChange={action('onChange')} size={1}>
      <option value="val1">Value 1</option>
      <option value="val2">Value 2</option>
      <option value="val3">Value 3</option>
    </Select>
  </Field>
));

storiesOf('Basics/Form/Select', module)
  .add('sizes', () => (
    <Spaced>
      {['auto', 'flex', '100%'].map((size) => (
        <Flexed key={size} label={size}>
          <Select value="val2" onChange={action('onChange')} size={size}>
            <option value="val1">Value 1</option>
            <option value="val2">Value 2</option>
            <option value="val3">Value 3</option>
          </Select>
        </Flexed>
      ))}
    </Spaced>
  ))
  .add('validations', () => (
    <div>
      <Spaced>
        {['error', 'warn', 'valid', null].map((valid) => (
          <Field label={String(valid)} key={String(valid)}>
            <Select
              key={valid}
              value="val2"
              onChange={action('onChange')}
              size="100%"
              valid={valid}
            >
              <option value="val1">Value 1</option>
              <option value="val2">Value 2</option>
              <option value="val3">Value 3</option>
            </Select>
          </Field>
        ))}
      </Spaced>
      <Field label="select">
        <Select value="val2" onChange={action('onChange')} size="100%" disabled>
          <option value="val1">Value 1</option>
          <option value="val2">Value 2</option>
          <option value="val3">Value 3</option>
        </Select>
      </Field>
    </div>
  ));

storiesOf('Basics/Form/Button', module)
  .add('sizes', () => (
    <Spaced>
      {['auto', 'flex', '100%'].map((size) => (
        <Flexed key={size} label={size}>
          <Button size={size}>click this button</Button>
        </Flexed>
      ))}
    </Spaced>
  ))
  .add('validations', () => (
    <Spaced>
      {['error', 'warn', 'valid', null].map((valid) => (
        <Flexed key={valid} label={String(valid)}>
          <Button size="100%" valid={valid}>
            click this button
          </Button>
        </Flexed>
      ))}
    </Spaced>
  ));

storiesOf('Basics/Form/Textarea', module)
  .add('sizes', () => (
    <Spaced>
      {['auto', 'flex', '100%'].map((size) => (
        <Flexed key={size} label={size}>
          <Textarea defaultValue="textarea" size={size} />
        </Flexed>
      ))}
    </Spaced>
  ))
  .add('validations', () => (
    <Spaced>
      {['error', 'warn', 'valid', null].map((valid) => (
        <Flexed key={valid} label={String(valid)}>
          <Textarea defaultValue="textarea" size="100%" valid={valid} />
        </Flexed>
      ))}
    </Spaced>
  ))
  .add('alignment', () => (
    <Spaced>
      {['end', 'center', 'start'].map((align) => (
        <Flexed key={align} label={align}>
          <Textarea defaultValue="textarea" size="100%" align={align} />
        </Flexed>
      ))}
    </Spaced>
  ))
  .add('height', () => (
    <Spaced>
      {[100, 200, undefined].map((height) => (
        <Flexed key={(height || 'undefined').toString()} label={(height || 'undefined').toString()}>
          <Textarea
            defaultValue={[...new Array(650)].fill('textarea textvalue').join(' ')}
            size="100%"
            height={height}
          />
        </Flexed>
      ))}
    </Spaced>
  ));

storiesOf('Basics/Form/Input', module)
  .add('sizes', () => (
    <Spaced>
      {['auto', 'flex', '100%'].map((size) => (
        <Flexed key={size} label={size}>
          <Input defaultValue="text" size={size} />
        </Flexed>
      ))}
    </Spaced>
  ))
  .add('validations', () => (
    <Spaced>
      {['error', 'warn', 'valid', null].map((valid) => (
        <Flexed key={valid} label={String(valid)}>
          <Input defaultValue="text" size="100%" valid={valid} />
        </Flexed>
      ))}
    </Spaced>
  ))
  .add('alignment', () => (
    <Spaced>
      {['end', 'center', 'start'].map((align) => (
        <Flexed key={align} label={align}>
          <Input defaultValue="text" size="100%" align={align} />
        </Flexed>
      ))}
    </Spaced>
  ));
