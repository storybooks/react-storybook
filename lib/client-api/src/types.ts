import {
  Addon,
  StoryId,
  StoryName,
  StoryKind,
  ViewMode,
  StoryIdentifier,
  StoryFn,
  Parameters,
  Args,
  ArgTypes,
  StoryApi,
  DecoratorFunction,
  LoaderFunction,
  DecorateStoryFunction,
  StoryContext,
} from '@storybook/addons';
import type { StoryStore } from './story_store';
import { HooksContext } from './hooks';

export interface ErrorLike {
  message: string;
  stack: string;
}

// Metadata about a story that can be set at various levels: global, for a kind, or for a single story.
export interface StoryMetadata {
  parameters?: Parameters;
  decorators?: DecoratorFunction[];
  loaders?: LoaderFunction[];
}
export type ArgTypesEnhancer = (context: StoryContext) => ArgTypes;
export type ArgsEnhancer = (context: StoryContext) => Args;

export type StorySpecifier = StoryId | { name: StoryName; kind: StoryKind } | '*';

export interface StoreSelectionSpecifier {
  storySpecifier: StorySpecifier;
  viewMode: ViewMode;
  singleStory?: boolean;
  args?: Args;
  globals?: Args;
}

export interface StoreSelection {
  storyId: StoryId;
  viewMode: ViewMode;
}

export type AddStoryArgs = StoryIdentifier & {
  storyFn: StoryFn<any>;
  parameters?: Parameters;
  decorators?: DecoratorFunction[];
  loaders?: LoaderFunction[];
};

export type StoreItem = StoryIdentifier & {
  parameters: Parameters;
  getDecorated: () => StoryFn<any>;
  getOriginal: () => StoryFn<any>;
  applyLoaders: () => Promise<StoryContext>;
  runPlayFunction: () => Promise<any>;
  storyFn: StoryFn<any>;
  unboundStoryFn: StoryFn<any>;
  hooks: HooksContext;
  args: Args;
  initialArgs: Args;
  argTypes: ArgTypes;
};

export type PublishedStoreItem = StoreItem & {
  globals: Args;
};

export interface StoreData {
  [key: string]: StoreItem;
}

export interface ClientApiParams {
  storyStore: StoryStore;
  decorateStory?: DecorateStoryFunction;
  noStoryModuleAddMethodHotDispose?: boolean;
}

export type ClientApiReturnFn<StoryFnReturnType> = (...args: any[]) => StoryApi<StoryFnReturnType>;

export type { StoryApi, DecoratorFunction };

export interface ClientApiAddon<StoryFnReturnType = unknown> extends Addon {
  apply: (a: StoryApi<StoryFnReturnType>, b: any[]) => any;
}

export interface ClientApiAddons<StoryFnReturnType> {
  [key: string]: ClientApiAddon<StoryFnReturnType>;
}

export interface GetStorybookStory {
  name: string;
  render: StoryFn;
}

export interface GetStorybookKind {
  kind: string;
  fileName: string;
  stories: GetStorybookStory[];
}

// This really belongs in lib/core, but that depends on lib/ui which (dev) depends on app/react
// which needs this type. So we put it here to avoid the circular dependency problem.
export type RenderContextWithoutStoryContext = StoreItem & {
  forceRender: boolean;

  showMain: () => void;
  showError: (error: { title: string; description: string }) => void;
  showException: (err: Error) => void;
};

export type RenderContext = RenderContextWithoutStoryContext & {
  storyContext: StoryContext;
};

interface SBBaseType {
  required?: boolean;
  raw?: string;
}

export type SBScalarType = SBBaseType & {
  name: 'boolean' | 'string' | 'number' | 'function';
};

export type SBArrayType = SBBaseType & {
  name: 'array';
  value: SBType;
};
export type SBObjectType = SBBaseType & {
  name: 'object';
  value: Record<string, SBType>;
};
export type SBEnumType = SBBaseType & {
  name: 'enum';
  value: (string | number)[];
};
export type SBIntersectionType = SBBaseType & {
  name: 'intersection';
  value: SBType[];
};
export type SBUnionType = SBBaseType & {
  name: 'union';
  value: SBType[];
};
export type SBOtherType = SBBaseType & {
  name: 'other';
  value: string;
};

export type SBType =
  | SBScalarType
  | SBEnumType
  | SBArrayType
  | SBObjectType
  | SBIntersectionType
  | SBUnionType
  | SBOtherType;
