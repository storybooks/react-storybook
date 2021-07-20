import React, { useState } from 'react';
import { ColorControl } from './Color';

export default {
  title: 'Controls/Color',
  component: ColorControl,
};

const Template = (
  initialValue?: string,
  presetColors?: Array<string | { color: string; title?: string }>
) => {
  const [value, setValue] = useState(initialValue);
  return (
    <>
      <ColorControl
        name="Color"
        value={value}
        onChange={(newVal) => setValue(newVal)}
        presetColors={presetColors}
        startOpen
      />
      <pre>{JSON.stringify(value) || 'undefined'}</pre>
    </>
  );
};

export const Basic = () => Template('#ff0');

export const Undefined = () => Template(undefined);

export const Null = () => Template(null);

// @ts-ignore
export const Mistyped = () => Template(1);

export const WithPresetColors = () =>
  Template('tan', [
    { color: '#ff4785', title: 'Coral' },
    { color: '#1EA7FD', title: 'Ocean' },
    { color: 'rgb(252, 82, 31)', title: 'Orange' },
    { color: 'RGBA(255, 174, 0, 0.5)', title: 'Gold' },
    { color: 'hsl(101, 52%, 49%)', title: 'Green' },
    { color: 'HSLA(179,65%,53%,0.5)', title: 'Seafoam' },
    { color: '#6F2CAC', title: 'Purple' },
    { color: '#2A0481', title: 'Ultraviolet' },
    { color: 'black' },
    { color: '#333', title: 'Darkest' },
    { color: '#444', title: 'Darker' },
    { color: '#666', title: 'Dark' },
    { color: '#999', title: 'Mediumdark' },
    { color: '#ddd', title: 'Medium' },
    { color: '#EEE', title: 'Mediumlight' },
    { color: '#F3F3F3', title: 'Light' },
    { color: '#F8F8F8', title: 'Lighter' },
    { color: '#FFFFFF', title: 'Lightest' },
    '#fe4a49',
    '#FED766',
    'rgba(0, 159, 183, 1)',
    'HSLA(240,11%,91%,0.5)',
    'slategray',
  ]);
