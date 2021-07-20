import React, { useState } from 'react';
import { ArrayControl } from './Array';

export default {
  title: 'Controls/Array',
  component: ArrayControl,
};

const Template = (initialValue: any) => {
  const [value, setValue] = useState(initialValue);
  return (
    <>
      <ArrayControl
        name="array"
        value={value}
        onChange={(newVal) => setValue(newVal)}
        separator=","
      />
      <pre>{JSON.stringify(value) || 'undefined'}</pre>
    </>
  );
};

export const Basic = () => Template(['Bat', 'Cat', 'Rat']);

export const Empty = () => Template([]);

export const Undefined = () => Template(undefined);

export const Null = () => Template(null);

export const Mistyped = () => Template('foo');
