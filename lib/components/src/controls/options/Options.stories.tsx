import React, { useState } from 'react';
import { OptionsControl } from './Options';

export default {
  title: 'Controls/Options',
  component: OptionsControl,
};

const arrayOptions = ['Bat', 'Cat', 'Rat'];
const objectOptions = {
  A: { id: 'Aardvark' },
  B: { id: 'Bat' },
  C: { id: 'Cat' },
};

const rawOptionsHelper = (options, type, isMulti, initial) => {
  const [value, setValue] = useState(isMulti ? [initial] : initial);
  return (
    <>
      <OptionsControl
        name="options"
        options={options}
        value={value}
        type={type}
        onChange={(newVal) => setValue(newVal)}
      />
      <pre>{JSON.stringify(value) || 'undefined'}</pre>
    </>
  );
};

const optionsHelper = (options, type, isMulti) =>
  rawOptionsHelper(options, type, isMulti, Array.isArray(options) ? options[1] : options.B);

// Check
export const ArrayCheck = () => optionsHelper(arrayOptions, 'check', true);
export const ArrayInlineCheck = () => optionsHelper(arrayOptions, 'inline-check', true);
export const ObjectCheck = () => optionsHelper(objectOptions, 'check', true);
export const ObjectInlineCheck = () => optionsHelper(objectOptions, 'inline-check', true);

export const ArrayCheckUndefined = () => rawOptionsHelper(arrayOptions, 'check', false, undefined);
export const ObjectCheckUndefined = () =>
  rawOptionsHelper(objectOptions, 'check', false, undefined);

export const ArrayCheckNull = () => rawOptionsHelper(arrayOptions, 'check', false, null);
export const ObjectCheckNull = () => rawOptionsHelper(objectOptions, 'check', false, null);

export const ArrayCheckMistyped = () => rawOptionsHelper(arrayOptions, 'check', false, 1);
export const ObjectCheckMistyped = () => rawOptionsHelper(objectOptions, 'check', false, 1);

// Radio
export const ArrayRadio = () => optionsHelper(arrayOptions, 'radio', false);
export const ArrayInlineRadio = () => optionsHelper(arrayOptions, 'inline-radio', false);
export const ObjectRadio = () => optionsHelper(objectOptions, 'radio', false);
export const ObjectInlineRadio = () => optionsHelper(objectOptions, 'inline-radio', false);

export const ArrayRadioUndefined = () => rawOptionsHelper(arrayOptions, 'radio', false, undefined);
export const ObjectRadioUndefined = () =>
  rawOptionsHelper(objectOptions, 'radio', false, undefined);

export const ArrayRadioNull = () => rawOptionsHelper(arrayOptions, 'radio', false, null);
export const ObjectRadioNull = () => rawOptionsHelper(objectOptions, 'radio', false, null);

export const ArrayRadioMistyped = () => rawOptionsHelper(arrayOptions, 'radio', false, 1);
export const ObjectRadioMistyped = () => rawOptionsHelper(objectOptions, 'radio', false, 1);

// Select
export const ArraySelect = () => optionsHelper(arrayOptions, 'select', false);
export const ArrayMultiSelect = () => optionsHelper(arrayOptions, 'multi-select', true);
export const ObjectSelect = () => optionsHelper(objectOptions, 'select', false);
export const ObjectMultiSelect = () => optionsHelper(objectOptions, 'multi-select', true);

export const ArraySelectUndefined = () =>
  rawOptionsHelper(arrayOptions, 'select', false, undefined);
export const ObjectSelectUndefined = () =>
  rawOptionsHelper(objectOptions, 'select', false, undefined);
export const ArrayMultiSelectUndefined = () =>
  rawOptionsHelper(arrayOptions, 'multi-select', false, undefined);
export const ObjectMultiSelectUndefined = () =>
  rawOptionsHelper(objectOptions, 'multi-select', false, undefined);

export const ArraySelectNull = () => rawOptionsHelper(arrayOptions, 'select', false, null);
export const ObjectSelectNull = () => rawOptionsHelper(objectOptions, 'select', false, null);
export const ArrayMultiSelectNull = () =>
  rawOptionsHelper(arrayOptions, 'multi-select', false, null);
export const ObjectMultiSelectNull = () =>
  rawOptionsHelper(objectOptions, 'multi-select', false, null);

export const ArraySelectMistyped = () => rawOptionsHelper(arrayOptions, 'select', false, 1);
export const ObjectSelectMistyped = () => rawOptionsHelper(objectOptions, 'select', false, 1);
export const ArrayMultiSelectMistyped = () =>
  rawOptionsHelper(arrayOptions, 'multi-select', false, 1);
export const ObjectMultiSelectMistyped = () =>
  rawOptionsHelper(objectOptions, 'multi-select', false, 1);
