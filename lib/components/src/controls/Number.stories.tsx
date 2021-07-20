import React, { useState } from 'react';
import { NumberControl } from './Number';

export default {
  title: 'Controls/Number',
  component: NumberControl,
};

const Template = (initialValue) => {
  const [value, setValue] = useState(initialValue);
  return (
    <>
      <NumberControl name="number" value={value} onChange={(newVal) => setValue(newVal)} />
      <pre>{JSON.stringify(value) || 'undefined'}</pre>
    </>
  );
};

export const Basic = () => Template(10);

export const Zero = () => Template(0);

export const Undefined = () => Template(undefined);

export const Null = () => Template(null);

export const Mistyped = () => Template('foo');
