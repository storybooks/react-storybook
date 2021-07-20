import React, { useState } from 'react';
import { DateControl } from './Date';

export default {
  title: 'Controls/Date',
  component: DateControl,
};

const Template = (initialValue) => {
  const [value, setValue] = useState(initialValue);
  return (
    <>
      <DateControl name="date" value={value} onChange={(newVal) => setValue(newVal)} />
      <pre>{JSON.stringify(value) || 'undefined'}</pre>
    </>
  );
};

export const Basic = () => Template(new Date(2020, 4, 20));

export const Undefined = () => Template(undefined);

export const Null = () => Template(null);

export const Mistyped = () => Template(1);
