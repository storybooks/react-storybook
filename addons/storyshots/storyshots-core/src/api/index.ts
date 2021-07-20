import global from 'global';
import { addons, mockChannel } from '@storybook/addons';
import ensureOptionsDefaults from './ensureOptionsDefaults';
import snapshotsTests from './snapshotsTestsTemplate';
import integrityTest from './integrityTestTemplate';
import loadFramework from '../frameworks/frameworkLoader';
import { StoryshotsOptions } from './StoryshotsOptions';

const { describe } = global;
global.STORYBOOK_REACT_CLASSES = global.STORYBOOK_REACT_CLASSES || {};

type TestMethod = 'beforeAll' | 'beforeEach' | 'afterEach' | 'afterAll';
const methods: TestMethod[] = ['beforeAll', 'beforeEach', 'afterEach', 'afterAll'];

function callTestMethodGlobals(
  testMethod: { [key in TestMethod]?: Function & { timeout?: number } } & { [key in string]: any }
) {
  methods.forEach((method) => {
    if (typeof testMethod[method] === 'function') {
      global[method](testMethod[method], testMethod[method].timeout);
    }
  });
}

const isDisabled = (parameter: any) =>
  parameter === false || (parameter && parameter.disable === true);

function testStorySnapshots(options: StoryshotsOptions = {}) {
  if (typeof describe !== 'function') {
    throw new Error('testStorySnapshots is intended only to be used inside jest');
  }

  addons.setChannel(mockChannel());

  const { storybook, framework, renderTree, renderShallowTree } = loadFramework(options);
  const {
    asyncJest,
    suite,
    storyNameRegex,
    storyKindRegex,
    storyFilterFunction,
    stories2snapsConverter,
    testMethod,
    integrityOptions,
    snapshotSerializers,
  } = ensureOptionsDefaults(options);
  const testMethodParams = {
    renderTree,
    renderShallowTree,
    stories2snapsConverter,
  };

  const data = storybook.raw().reduce(
    (acc, item, index) => {
      if (storyFilterFunction && !storyFilterFunction(item, index)) {
        return acc;
      }

      if (storyNameRegex && !item.name.match(storyNameRegex)) {
        return acc;
      }

      if (storyKindRegex && !item.kind.match(storyKindRegex)) {
        return acc;
      }

      const { kind, storyFn: render, parameters } = item;
      const existing = acc.find((i: any) => i.kind === kind);
      const { fileName } = item.parameters;

      if (!isDisabled(parameters.storyshots)) {
        if (existing) {
          existing.children.push({ ...item, render, fileName });
        } else {
          acc.push({
            kind,
            children: [{ ...item, render, fileName }],
          });
        }
      }
      return acc;
    },
    [] as {
      kind: string;
      children: any[];
    }[]
  );

  if (data.length) {
    callTestMethodGlobals(testMethod);

    snapshotsTests({
      data,
      asyncJest,
      suite,
      framework,
      testMethod,
      testMethodParams,
      snapshotSerializers,
    });

    integrityTest(integrityOptions, stories2snapsConverter);
  } else {
    throw new Error('storyshots found 0 stories');
  }
}

export default testStorySnapshots;
