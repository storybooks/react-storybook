import { Args, ArgTypes } from '@storybook/addons';
import { once } from '@storybook/client-logger';
import isPlainObject from 'lodash/isPlainObject';
import dedent from 'ts-dedent';

type ValueType = { name: string; value?: ObjectValueType | ValueType };
type ObjectValueType = Record<string, ValueType>;

const INCOMPATIBLE = Symbol('incompatible');
const map = (arg: unknown, type: ValueType): any => {
  if (arg === undefined || arg === null || !type) return arg;
  switch (type.name) {
    case 'string':
      return String(arg);
    case 'enum':
      return arg;
    case 'number':
      return Number(arg);
    case 'boolean':
      return arg === 'true';
    case 'array':
      if (!type.value || !Array.isArray(arg)) return INCOMPATIBLE;
      return arg.reduce((acc, item, index) => {
        const mapped = map(item, type.value as ValueType);
        if (mapped !== INCOMPATIBLE) acc[index] = mapped;
        return acc;
      }, new Array(arg.length));
    case 'object':
      if (typeof arg === 'string' || typeof arg === 'number') return arg;
      if (!type.value || typeof arg !== 'object') return INCOMPATIBLE;
      return Object.entries(arg).reduce((acc, [key, val]) => {
        const mapped = map(val, (type.value as ObjectValueType)[key]);
        return mapped === INCOMPATIBLE ? acc : Object.assign(acc, { [key]: mapped });
      }, {} as Args);
    default:
      return INCOMPATIBLE;
  }
};

export const mapArgsToTypes = (args: Args, argTypes: ArgTypes): Args =>
  Object.entries(args).reduce((acc, [key, value]) => {
    if (!argTypes[key]) return acc;
    const mapped = map(value, argTypes[key].type);
    return mapped === INCOMPATIBLE ? acc : Object.assign(acc, { [key]: mapped });
  }, {});

export const combineArgs = (value: any, update: any): Args => {
  if (Array.isArray(value) && Array.isArray(update)) {
    return update
      .reduce(
        (acc, upd, index) => {
          acc[index] = combineArgs(value[index], update[index]);
          return acc;
        },
        [...value]
      )
      .filter((v: any) => v !== undefined);
  }
  if (!isPlainObject(value) || !isPlainObject(update)) return update;
  return Object.keys({ ...value, ...update }).reduce((acc, key) => {
    if (key in update) {
      const combined = combineArgs(value[key], update[key]);
      if (combined !== undefined) acc[key] = combined;
    } else {
      acc[key] = value[key];
    }
    return acc;
  }, {} as any);
};

export const validateOptions = (args: Args, argTypes: ArgTypes): Args =>
  Object.entries(argTypes).reduce((acc, [key, { options }]) => {
    if (!options) {
      acc[key] = args[key];
      return acc;
    }

    if (!Array.isArray(options)) {
      once.error(dedent`
        Invalid argType: '${key}.options' should be an array.

        More info: https://storybook.js.org/docs/react/api/argtypes
      `);
      acc[key] = args[key];
      return acc;
    }

    if (options.some((opt) => opt && ['object', 'function'].includes(typeof opt))) {
      once.error(dedent`
        Invalid argType: '${key}.options' should only contain primitives. Use a 'mapping' for complex values.

        More info: https://storybook.js.org/docs/react/writing-stories/args#mapping-to-complex-arg-values
      `);
      acc[key] = args[key];
      return acc;
    }

    const isArray = Array.isArray(args[key]);
    const invalidIndex = isArray && args[key].findIndex((val: any) => !options.includes(val));
    const isValidArray = isArray && invalidIndex === -1;

    if (args[key] === undefined || options.includes(args[key]) || isValidArray) {
      acc[key] = args[key];
      return acc;
    }

    const field = isArray ? `${key}[${invalidIndex}]` : key;
    const supportedOptions = options
      .map((opt: any) => (typeof opt === 'string' ? `'${opt}'` : String(opt)))
      .join(', ');
    once.warn(`Received illegal value for '${field}'. Supported options: ${supportedOptions}`);

    return acc;
  }, {} as Args);
