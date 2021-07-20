import { ConfigApi, ClientApi, StoryStore } from '@storybook/client-api';
import { isExportStory } from '@storybook/csf';
import { logger } from '@storybook/client-logger';
import dedent from 'ts-dedent';
import deprecate from 'util-deprecate';

import { Loadable, LoaderFunction, RequireContext } from './types';
import { normalizeStory } from './normalizeStory';
import { autoTitle } from './autoTitle';

const duplicateKindWarning = deprecate(
  (kindName: string) => {
    logger.warn(`Duplicate title: '${kindName}'`);
  },
  dedent`
    Duplicate title used in multiple files; use unique titles or a primary file for a component with re-exported stories.

    https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-support-for-duplicate-kinds
  `
);

let previousExports = new Map<any, string>();
const loadStories = (
  loadable: Loadable,
  framework: string,
  { clientApi, storyStore }: { clientApi: ClientApi; storyStore: StoryStore }
) => () => {
  // Make sure we don't try to define a kind more than once within the same load
  const loadedKinds = new Set();

  let reqs = null;
  // todo discuss / improve type check
  if (Array.isArray(loadable)) {
    reqs = loadable;
  } else if ((loadable as RequireContext).keys) {
    reqs = [loadable as RequireContext];
  }

  let currentExports = new Map<any, string>();
  if (reqs) {
    reqs.forEach((req) => {
      req.keys().forEach((filename: string) => {
        try {
          const fileExports = req(filename);
          currentExports.set(
            fileExports,
            // todo discuss: types infer that this is RequireContext; no checks needed?
            // NOTE: turns out `babel-plugin-require-context-hook` doesn't implement this (yet)
            typeof req.resolve === 'function' ? req.resolve(filename) : filename
          );
        } catch (error) {
          const errorString = error.message && error.stack ? `${error.message}\n ${error.stack}` : error.toString();
          logger.warn(`Unexpected error while loading ${filename}: ${errorString}`);
        }
      });
    });
  } else {
    const exported = (loadable as LoaderFunction)();
    if (Array.isArray(exported) && exported.every((obj) => obj.default != null)) {
      currentExports = new Map(exported.map((fileExports) => [fileExports, null]));
    } else if (exported) {
      logger.warn(
        `Loader function passed to 'configure' should return void or an array of module exports that all contain a 'default' export. Received: ${JSON.stringify(
          exported
        )}`
      );
    }
  }

  const removed = Array.from(previousExports.keys()).filter((exp) => !currentExports.has(exp));
  removed.forEach((exp) => {
    if (exp.default) {
      storyStore.removeStoryKind(exp.default.title);
    }
  });

  const added = Array.from(currentExports.keys()).filter((exp) => !previousExports.has(exp));

  added.forEach((fileExports) => {
    // An old-style story file
    if (!fileExports.default) {
      return;
    }

    const { default: defaultExport, __namedExportsOrder, ...namedExports } = fileExports;
    let exports = namedExports;

    const fileName = currentExports.get(fileExports);
    const title = autoTitle(defaultExport, fileName);
    if (!title) {
      throw new Error(
        `Unexpected default export without title: ${JSON.stringify(fileExports.default)}`
      );
    }

    const meta = { ...defaultExport, title };

    // prefer a user/loader provided `__namedExportsOrder` array if supplied
    // we do this as es module exports are always ordered alphabetically
    // see https://github.com/storybookjs/storybook/issues/9136
    if (Array.isArray(__namedExportsOrder)) {
      exports = {};
      __namedExportsOrder.forEach((name) => {
        if (namedExports[name]) {
          exports[name] = namedExports[name];
        }
      });
    }

    const {
      title: kindName,
      parameters: kindParameters,
      decorators: kindDecorators,
      loaders: kindLoaders = [],
      component,
      subcomponents,
      args: kindArgs,
      argTypes: kindArgTypes,
    } = meta;

    if (loadedKinds.has(kindName)) {
      duplicateKindWarning(kindName);
    }
    loadedKinds.add(kindName);

    // We pass true here to avoid the warning about HMR. It's cool clientApi, we got this
    // todo discuss: TS now wants a NodeModule; should we fix this differently?
    const kind = clientApi.storiesOf(kindName, true as any);

    // we should always have a framework, rest optional
    kind.addParameters({
      framework,
      component,
      subcomponents,
      fileName,
      ...kindParameters,
      args: kindArgs,
      argTypes: kindArgTypes,
    });

    // todo add type
    (kindDecorators || []).forEach((decorator: any) => {
      kind.addDecorator(decorator);
    });

    kindLoaders.forEach((loader: any) => {
      kind.addLoader(loader);
    });

    const storyExports = Object.keys(exports);
    if (storyExports.length === 0) {
      logger.warn(
        dedent`
          Found a story file for "${kindName}" but no exported stories.
          Check the docs for reference: https://storybook.js.org/docs/formats/component-story-format/
        `
      );
      return;
    }

    storyExports.forEach((key) => {
      if (isExportStory(key, meta)) {
        const { name, storyFn, parameters } = normalizeStory(
          key,
          exports[key],
          meta,
          clientApi.globalRender
        );
        kind.add(name, storyFn, parameters);
      }
    });
  });
  previousExports = currentExports;
};

const configureDeprecationWarning = deprecate(
  () => {},
  `\`configure()\` is deprecated and will be removed in Storybook 7.0. 
Please use the \`stories\` field of \`main.js\` to load stories.
Read more at https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-configure`
);
let loaded = false;
export const loadCsf = ({
  clientApi,
  storyStore,
  configApi,
}: {
  clientApi: ClientApi;
  storyStore: StoryStore;
  configApi: ConfigApi;
}) =>
  /**
   * Load a collection of stories. If it has a default export, assume that it is a module-style
   * file and process its named exports as stories. If not, assume it's an old-style
   * storiesof file and require it.
   *
   * @param {*} framework - name of framework in use, e.g. "react"
   * @param {*} loadable a require.context `req`, an array of `req`s, or a loader function that returns void or an array of exports
   * @param {*} m - ES module object for hot-module-reloading (HMR)
   * @param {boolean} showDeprecationWarning - show the deprecation warning (default true)
   */
  (framework: string, loadable: Loadable, m: NodeModule, showDeprecationWarning = true) => {
    if (showDeprecationWarning) {
      configureDeprecationWarning();
    }

    if (typeof m === 'string') {
      throw new Error(
        `Invalid module '${m}'. Did you forget to pass \`module\` as the second argument to \`configure\`"?`
      );
    }

    if (m && m.hot && m.hot.dispose) {
      ({ previousExports = new Map() } = m.hot.data || {});
      m.hot.dispose((data) => {
        loaded = false;
        // eslint-disable-next-line no-param-reassign
        data.previousExports = previousExports;
      });
      m.hot.accept();
    }
    if (loaded) {
      logger.warn('Unexpected loaded state. Did you call `load` twice?');
    }
    loaded = true;

    configApi.configure(loadStories(loadable, framework, { clientApi, storyStore }), m);
  };
