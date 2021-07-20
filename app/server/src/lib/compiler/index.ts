import { CompileCsfModuleArgs, CompileStorybookSectionArgs, StorybookSection } from './types';

import { stringifySection } from './stringifier';

function createSection(args: CompileStorybookSectionArgs): StorybookSection {
  return {
    imports: {},
    decorators: [],
    ...args,
  };
}

export function compileCsfModule(args: CompileCsfModuleArgs): string {
  return stringifySection(createSection(args));
}
