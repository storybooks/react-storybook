/* eslint-disable @typescript-eslint/no-empty-interface */
export interface JsDocParam {
  name: string;
  description?: string;
}

export interface JsDocReturns {
  description?: string;
}

export interface JsDocTags {
  params?: JsDocParam[];
  returns?: JsDocReturns;
}

export interface PropSummaryValue {
  summary: string;
  detail?: string;
  required?: boolean;
}

export type PropType = PropSummaryValue;
export type PropDefaultValue = PropSummaryValue;

export interface TableAnnotation {
  type: PropType;
  jsDocTags?: JsDocTags;
  defaultValue?: PropDefaultValue;
  category?: string;
}

export interface ArgType {
  name?: string;
  description?: string;
  defaultValue?: any;
  [key: string]: any;
}

export interface ArgTypes {
  [key: string]: ArgType;
}

export interface Args {
  [key: string]: any;
}

export interface ControlProps<T> {
  name: string;
  value?: T;
  defaultValue?: T;
  argType?: ArgType;
  onChange: (value: T) => T | void;
  onFocus?: (evt: any) => void;
  onBlur?: (evt: any) => void;
}

export type ArrayValue = string[] | readonly string[];
export interface ArrayConfig {
  separator?: string;
}

export type BooleanValue = boolean;
export interface BooleanConfig {}

export type ColorValue = string;
export type PresetColor = ColorValue | { color: ColorValue; title?: string };
export interface ColorConfig {
  presetColors?: PresetColor[];
  startOpen?: boolean;
}

export type DateValue = Date | number;
export interface DateConfig {}

export type NumberValue = number;
export interface NumberConfig {
  min?: number;
  max?: number;
  step?: number;
}

export type RangeConfig = NumberConfig;

export type ObjectValue = any;
export interface ObjectConfig {}

export type OptionsSingleSelection = any;
export type OptionsMultiSelection = any[];
export type OptionsSelection = OptionsSingleSelection | OptionsMultiSelection;
export type OptionsArray = any[];
export type OptionsObject = Record<string, any>;
export type Options = OptionsArray | OptionsObject;
export type OptionsControlType =
  | 'radio'
  | 'inline-radio'
  | 'check'
  | 'inline-check'
  | 'select'
  | 'multi-select';

export interface OptionsConfig {
  labels: Record<any, string>;
  options: Options;
  type: OptionsControlType;
}

export interface NormalizedOptionsConfig {
  options: OptionsObject;
}

export type TextValue = string;
export interface TextConfig {}

export type ControlType =
  | 'array'
  | 'boolean'
  | 'color'
  | 'date'
  | 'number'
  | 'range'
  | 'object'
  | OptionsControlType
  | 'text';

export type Control =
  | ArrayConfig
  | BooleanConfig
  | ColorConfig
  | DateConfig
  | NumberConfig
  | ObjectConfig
  | OptionsConfig
  | RangeConfig
  | TextConfig;

export type Controls = Record<string, Control>;
