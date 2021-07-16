import { createType } from './createType';
import { createDefaultValue } from './createDefaultValue';
import { PropDefFactory } from '../types';

export const createFlowPropDef: PropDefFactory = (propName, docgenInfo) => {
  const { flowType, description, required, defaultValue } = docgenInfo;

  return {
    name: propName,
    type: createType(flowType),
    required,
    description,
    defaultValue: createDefaultValue(defaultValue, flowType),
  };
};
