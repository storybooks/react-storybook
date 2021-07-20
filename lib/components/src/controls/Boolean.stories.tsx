import React, { useState } from 'react';
import { BooleanControl } from './Boolean';

export default {
  title: 'Controls/Boolean',
  component: BooleanControl,
};

const Template = (initialValue?: boolean) => {
  const [value, setValue] = useState(initialValue);
  return (
    <>
      <BooleanControl name="boolean" value={value} onChange={(newVal) => setValue(newVal)} />
      <pre>{JSON.stringify(value) || 'undefined'}</pre>
    </>
  );
};

export const True = () => Template(true);

export const False = () => Template(false);

export const Undefined = () => Template(undefined);

export const Null = () => Template(null);

// @ts-ignore
export const Mistyped = () => Template('foo');
