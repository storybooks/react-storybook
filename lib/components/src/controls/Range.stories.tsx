import React, { useState } from 'react';
import { RangeControl } from './Range';

export default {
  title: 'Controls/Range',
  component: RangeControl,
};

const Template = ({
  initialValue,
  step,
  max,
}: {
  initialValue?: number;
  step?: number;
  max?: number;
}) => {
  const [value, setValue] = useState(initialValue);
  return (
    <>
      <RangeControl
        name="range"
        value={value}
        onChange={(newVal) => setValue(newVal)}
        min={0}
        max={max}
        step={step}
      />
      <pre>{JSON.stringify(value) || 'undefined'}</pre>
    </>
  );
};

export const Basic = () => Template({ initialValue: 10, max: 20, step: 2 });

export const Zero = () => Template({ initialValue: 0, max: 20, step: 2 });

export const Null = () => Template({ initialValue: null, max: 20, step: 2 });

// @ts-ignore
export const Mistyped = () => Template({ initialValue: 'foo', max: 20, step: 2 });
export const Decimals = () =>
  Template({ step: 0.000000000002, initialValue: 1989.123123123123, max: 2000 });

export const BigMaxValue = () => Template({ step: 1000, initialValue: 15, max: 10000000000 });

export const Undefined = () => Template({});
