import { Component } from '../../blocks/types';

export function extractComponentDescription(component?: Component): string {
  if (!component) {
    return null;
  }

  const { __docgen: docgenInfo = {} } = component;
  return docgenInfo.description;
}
