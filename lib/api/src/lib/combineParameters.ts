import mergeWith from 'lodash/mergeWith';
import type { Parameters } from '../index';

// This is duplicated from @storybook/client-api for the reasons mentioned in lib-addons/types.js

export const combineParameters = (...parameterSets: Parameters[]) =>
  mergeWith({}, ...parameterSets, (objValue: any, srcValue: any) => {
    // Treat arrays as scalars:
    if (Array.isArray(srcValue)) return srcValue;

    return undefined;
  });
