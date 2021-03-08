import { Args, ArgTypes } from '@storybook/addons';
import { once } from '@storybook/client-logger';
import { isPlainObject } from 'lodash';
import dedent from 'ts-dedent';

type ValueType = { name: string; value?: ObjectValueType | ValueType };
type ObjectValueType = Record<string, ValueType>;

const INCOMPATIBLE = Symbol('incompatible');
const map = (arg: unknown, type: ValueType): any => {
  if (arg === undefined || arg === null || !type) return arg;
  switch (type.name) {
    case 'string':
      return String(arg);
    case 'number':
      return Number(arg);
    case 'boolean':
      return arg === 'true';
    case 'array':
      if (!type.value || !Array.isArray(arg)) return INCOMPATIBLE;
      return arg.reduce((acc, item) => {
        const mapped = map(item, type.value as ValueType);
        return mapped === INCOMPATIBLE ? acc : acc.concat([mapped]);
      }, []);
    case 'object':
      if (!type.value || typeof arg !== 'object') return INCOMPATIBLE;
      return Object.entries(arg).reduce((acc, [key, val]) => {
        const mapped = map(val, (type.value as ObjectValueType)[key]);
        return mapped === INCOMPATIBLE ? acc : Object.assign(acc, { [key]: mapped });
      }, {} as Args);
    default:
      return INCOMPATIBLE;
  }
};

export const mapArgsToTypes = (args: Args, argTypes: ArgTypes): Args => {
  return Object.entries(args).reduce((acc, [key, value]) => {
    if (!argTypes[key]) return acc;
    const mapped = map(value, argTypes[key].type);
    return mapped === INCOMPATIBLE ? acc : Object.assign(acc, { [key]: mapped });
  }, {});
};

export const combineArgs = (value: any, update: any): Args => {
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

export const validateOptions = (args: Args, argTypes: ArgTypes): Args => {
  return Object.entries(argTypes).reduce((acc, [key, { options }]) => {
    if (!options) {
      acc[key] = args[key];
      return acc;
    }

    if (!Array.isArray(options)) {
      once.warn(dedent`
        Invalid argType: '${key}.options' should be an array.

        More info: https://storybook.js.org/docs/react/api/argtypes
      `);
      acc[key] = args[key];
      return acc;
    }

    if (options.some((opt) => opt && ['object', 'function'].includes(typeof opt))) {
      once.warn(dedent`
        Invalid argType: '${key}.options' should only contain primitives. Use a 'mapping' for complex values.

        More info: https://storybook.js.org/docs/react/writing-stories/args#mapping-to-complex-arg-values
      `);
    }

    if (args[key] === undefined || options.includes(args[key])) {
      acc[key] = args[key];
      return acc;
    }

    once.warn(
      `Received illegal value for '${key}'. Supported options: ${options
        .map((opt: any) => (typeof opt === 'string' ? `'${opt}'` : String(opt)))
        .join(', ')}`
    );
    return acc;
  }, {} as Args);
};