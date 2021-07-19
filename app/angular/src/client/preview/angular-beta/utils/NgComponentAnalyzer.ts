import { Component, Directive, Input, Output, Pipe, Type } from '@angular/core';

export type ComponentInputsOutputs = {
  inputs: {
    propName: string;
    templateName: string;
  }[];
  outputs: {
    propName: string;
    templateName: string;
  }[];
};

/**
 * Returns component Inputs / Outputs by browsing these properties and decorator
 */
export const getComponentInputsOutputs = (component: any): ComponentInputsOutputs => {
  const componentMetadata = getComponentDecoratorMetadata(component);
  const componentPropsMetadata = getComponentPropsDecoratorMetadata(component);

  const initialValue: ComponentInputsOutputs = {
    inputs: [],
    outputs: [],
  };

  // Adds the I/O present in @Component metadata
  if (componentMetadata && componentMetadata.inputs) {
    initialValue.inputs.push(
      ...componentMetadata.inputs.map((i) => ({ propName: i, templateName: i }))
    );
  }
  if (componentMetadata && componentMetadata.outputs) {
    initialValue.outputs.push(
      ...componentMetadata.outputs.map((i) => ({ propName: i, templateName: i }))
    );
  }

  if (!componentPropsMetadata) {
    return initialValue;
  }

  // Browses component properties to extract I/O
  // Filters properties that have the same name as the one present in the @Component property
  return Object.entries(componentPropsMetadata).reduce((previousValue, [propertyName, [value]]) => {
    if (value instanceof Input) {
      const inputToAdd = {
        propName: propertyName,
        templateName: value.bindingPropertyName ?? propertyName,
      };

      const previousInputsFiltered = previousValue.inputs.filter(
        (i) => i.templateName !== propertyName
      );
      return {
        ...previousValue,
        inputs: [...previousInputsFiltered, inputToAdd],
      };
    }
    if (value instanceof Output) {
      const outputToAdd = {
        propName: propertyName,
        templateName: value.bindingPropertyName ?? propertyName,
      };

      const previousOutputsFiltered = previousValue.outputs.filter(
        (i) => i.templateName !== propertyName
      );
      return {
        ...previousValue,
        outputs: [...previousOutputsFiltered, outputToAdd],
      };
    }
    return previousValue;
  }, initialValue);
};

export const isDeclarable = (component: any): boolean => {
  if (!component) {
    return false;
  }

  const decoratorKey = '__annotations__';
  const decorators: any[] = Reflect.getOwnPropertyDescriptor(component, decoratorKey)
    ? Reflect.getOwnPropertyDescriptor(component, decoratorKey).value
    : component[decoratorKey];

  return !!(decorators || []).find(
    (d) => d instanceof Directive || d instanceof Pipe || d instanceof Component
  );
};

export const isComponent = (component: any): component is Type<unknown> => {
  if (!component) {
    return false;
  }

  const decoratorKey = '__annotations__';
  const decorators: any[] = Reflect.getOwnPropertyDescriptor(component, decoratorKey)
    ? Reflect.getOwnPropertyDescriptor(component, decoratorKey).value
    : component[decoratorKey];
  return (decorators || []).some((d) => d instanceof Component);
};

/**
 * Returns all component decorator properties
 * is used to get all `@Input` and `@Output` Decorator
 */
export const getComponentPropsDecoratorMetadata = (component: any) => {
  const decoratorKey = '__prop__metadata__';
  let propsDecorators: Record<string, (Input | Output)[]> =
    Reflect &&
    Reflect.getOwnPropertyDescriptor &&
    Reflect.getOwnPropertyDescriptor(component, decoratorKey)
      ? Reflect.getOwnPropertyDescriptor(component, decoratorKey).value
      : component[decoratorKey];

  const parent = Reflect && Reflect.getPrototypeOf && Reflect.getPrototypeOf(component);

  if (parent) {
    const parentPropsDecorators = getComponentPropsDecoratorMetadata(parent);
    propsDecorators = { ...parentPropsDecorators, ...propsDecorators };
  }

  return propsDecorators;
};

/**
 * Returns component decorator `@Component`
 */
export const getComponentDecoratorMetadata = (component: any): Component | undefined => {
  const decoratorKey = '__annotations__';
  const decorators: any[] =
    Reflect &&
    Reflect.getOwnPropertyDescriptor &&
    Reflect.getOwnPropertyDescriptor(component, decoratorKey)
      ? Reflect.getOwnPropertyDescriptor(component, decoratorKey).value
      : component[decoratorKey];

  return (decorators || []).find((d) => d instanceof Component);
};
