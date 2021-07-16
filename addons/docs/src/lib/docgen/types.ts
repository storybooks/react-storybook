import { ArgTypes } from '@storybook/api';
import { PropDef } from './PropDef';
import { Component } from '../../blocks/types';

export type PropsExtractor = (component: Component) => { rows?: PropDef[] } | null;

export type ArgTypesExtractor = (component: Component) => ArgTypes | null;

export interface ExtractedJsDocParam {
  name: string;
  type?: any;
  description?: string;
  getPrettyName: () => string;
  getTypeName: () => string;
}

export interface ExtractedJsDocReturns {
  type?: any;
  description?: string;
  getTypeName: () => string;
}

export interface ExtractedJsDoc {
  params?: ExtractedJsDocParam[];
  returns?: ExtractedJsDocReturns;
  ignore: boolean;
}

export interface JsDocParsingOptions {
  tags?: string[];
}

export type ParseJsDoc = (value?: string, options?: JsDocParsingOptions) => JsDocParsingResult;

export interface JsDocParsingResult {
  includesJsDoc: boolean;
  ignore: boolean;
  description?: string;
  extractedTags?: ExtractedJsDoc;
}

export type PropDefFactory = (
  propName: string,
  docgenInfo: DocgenInfo,
  jsDocParsingResult?: JsDocParsingResult
) => PropDef;

export interface DocgenType {
  name: string;
  description?: string;
  required?: boolean;
  value?: any; // Seems like this can be many things
}

export interface DocgenPropType extends DocgenType {
  value?: any;
  raw?: string;
  computed?: boolean;
}

export interface DocgenFlowType extends DocgenType {
  type?: string;
  raw?: string;
  signature?: any;
  elements?: any[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DocgenTypeScriptType extends DocgenType {}

// export type DocgenType = DocgenPropType | DocgenFlowType | DocgenTypeScriptType;

export interface DocgenPropDefaultValue {
  value: string;
  computed?: boolean;
  func?: boolean;
}

export interface DocgenInfo {
  type?: DocgenPropType;
  flowType?: DocgenFlowType;
  tsType?: DocgenTypeScriptType;
  required: boolean;
  description?: string;
  defaultValue?: DocgenPropDefaultValue;
}

export enum TypeSystem {
  JAVASCRIPT = 'JavaScript',
  FLOW = 'Flow',
  TYPESCRIPT = 'TypeScript',
  UNKNOWN = 'Unknown',
}

export type { PropDef };
