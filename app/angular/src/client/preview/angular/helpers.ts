// @ts-ignore
import global from 'global';
import { enableProdMode, NgModule, Component, NgModuleRef, Type, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { Observable, ReplaySubject, Subscriber } from 'rxjs';
import { StoryFn } from '@storybook/addons';
import { AppComponent } from './components/app.component';
import { STORY } from './app.token';
import { NgModuleMetadata, StoryFnAngularReturnType } from '../types';

const { document } = global;

declare global {
  interface Window {
    NODE_ENV: 'string' | 'development' | undefined;
  }
}

let platform: any = null;
let promises: Promise<NgModuleRef<any>>[] = [];
let storyData = new ReplaySubject<StoryFnAngularReturnType>(1);

const moduleClass = class DynamicModule {};
const componentClass = class DynamicComponent {};

type DynamicComponentType = typeof componentClass;

function storyDataFactory<T>(data: Observable<T>) {
  return (ngZone: NgZone) =>
    new Observable((subscriber: Subscriber<T>) => {
      const sub = data.subscribe(
        (v: T) => {
          ngZone.run(() => subscriber.next(v));
        },
        (err) => {
          ngZone.run(() => subscriber.error(err));
        },
        () => {
          ngZone.run(() => subscriber.complete());
        }
      );

      return () => {
        sub.unsubscribe();
      };
    });
}

const getModule = (
  declarations: (Type<any> | any[])[],
  entryComponents: (Type<any> | any[])[],
  bootstrap: (Type<any> | any[])[],
  data: StoryFnAngularReturnType,
  moduleMetadata: NgModuleMetadata
) => {
  // Complete last ReplaySubject and create a new one for the current module
  storyData.complete();
  storyData = new ReplaySubject<StoryFnAngularReturnType>(1);
  storyData.next(data);

  const moduleMeta = {
    declarations: [...declarations, ...(moduleMetadata.declarations || [])],
    imports: [BrowserModule, FormsModule, ...(moduleMetadata.imports || [])],
    providers: [
      { provide: STORY, useFactory: storyDataFactory(storyData.asObservable()), deps: [NgZone] },
      ...(moduleMetadata.providers || []),
    ],
    entryComponents: [...entryComponents, ...(moduleMetadata.entryComponents || [])],
    schemas: [...(moduleMetadata.schemas || [])],
    bootstrap: [...bootstrap],
  };

  return NgModule(moduleMeta)(moduleClass);
};

const createComponentFromTemplate = (template: string, styles: string[]) =>
  Component({
    template,
    styles,
  })(componentClass);

const extractNgModuleMetadata = (importItem: any): NgModule => {
  const target = importItem && importItem.ngModule ? importItem.ngModule : importItem;
  const decoratorKey = '__annotations__';
  const decorators: any[] =
    Reflect &&
    Reflect.getOwnPropertyDescriptor &&
    Reflect.getOwnPropertyDescriptor(target, decoratorKey)
      ? Reflect.getOwnPropertyDescriptor(target, decoratorKey).value
      : target[decoratorKey];

  if (!decorators || decorators.length === 0) {
    return null;
  }

  const ngModuleDecorator: NgModule | undefined = decorators.find(
    (decorator) => decorator instanceof NgModule
  );
  if (!ngModuleDecorator) {
    return null;
  }
  return ngModuleDecorator;
};

const getExistenceOfComponentInModules = (
  component: any,
  declarations: any[],
  imports: any[]
): boolean => {
  if (declarations && declarations.some((declaration) => declaration === component)) {
    // Found component in declarations array
    return true;
  }
  if (!imports) {
    return false;
  }

  return imports.some((importItem) => {
    const extractedNgModuleMetadata = extractNgModuleMetadata(importItem);
    if (!extractedNgModuleMetadata) {
      // Not an NgModule
      return false;
    }
    return getExistenceOfComponentInModules(
      component,
      extractedNgModuleMetadata.declarations,
      extractedNgModuleMetadata.imports
    );
  });
};

const initModule = (storyFn: StoryFn<StoryFnAngularReturnType>) => {
  const storyObj = storyFn();
  const { component, template, props, styles, moduleMetadata = {} } = storyObj;

  const isCreatingComponentFromTemplate = Boolean(template);

  const AnnotatedComponent = isCreatingComponentFromTemplate
    ? createComponentFromTemplate(template, styles)
    : component;

  const componentRequiresDeclaration =
    isCreatingComponentFromTemplate ||
    !getExistenceOfComponentInModules(
      component,
      moduleMetadata.declarations,
      moduleMetadata.imports
    );

  const componentDeclarations = componentRequiresDeclaration
    ? [AppComponent, AnnotatedComponent]
    : [AppComponent];

  const story = {
    component: AnnotatedComponent,
    props,
  };

  return getModule(
    componentDeclarations,
    [AnnotatedComponent],
    [AppComponent],
    story,
    moduleMetadata
  );
};

const staticRoot = document.getElementById('root');
const insertDynamicRoot = () => {
  const app = document.createElement('storybook-dynamic-app-root');
  staticRoot.innerHTML = '';
  staticRoot.appendChild(app);
};

const draw = (newModule: DynamicComponentType): void => {
  if (!platform) {
    insertDynamicRoot();
    if (typeof NODE_ENV === 'string' && NODE_ENV !== 'development') {
      try {
        enableProdMode();
      } catch (e) {
        //
      }
    }

    platform = platformBrowserDynamic();
    promises.push(platform.bootstrapModule(newModule));
  } else {
    Promise.all(promises).then((modules) => {
      modules.forEach((mod) => mod.destroy());

      insertDynamicRoot();
      promises = [];
      promises.push(platform.bootstrapModule(newModule));
    });
  }
};

export const renderNgApp = (storyFn: StoryFn<StoryFnAngularReturnType>, forced: boolean) => {
  if (!forced) {
    draw(initModule(storyFn));
  } else {
    storyData.next(storyFn());
  }
};
