import 'jest-specific-snapshot';
import { StoryshotsTestMethod, TestMethodOptions } from './api/StoryshotsOptions';

const isFunction = (obj: any) => !!(obj && obj.constructor && obj.call && obj.apply);
const optionsOrCallOptions = (opts: any, story: any) => (isFunction(opts) ? opts(story) : opts);

type SnapshotsWithOptionsReturnType = (
  options: Pick<TestMethodOptions, 'story' | 'context' | 'renderTree' | 'snapshotFileName'>
) => any;

export function snapshotWithOptions(
  // eslint-disable-next-line @typescript-eslint/ban-types
  options: { renderer?: any; serializer?: any } | Function = {}
): SnapshotsWithOptionsReturnType {
  return ({ story, context, renderTree, snapshotFileName }) => {
    const result = renderTree(story, context, optionsOrCallOptions(options, story));

    function match(tree: any) {
      let target = tree;
      const isReact = story.parameters.framework === 'react';

      if (isReact && typeof tree.childAt === 'function') {
        target = tree.childAt(0);
      }
      if (isReact && Array.isArray(tree.children)) {
        [target] = tree.children;
      }

      if (snapshotFileName) {
        expect(target).toMatchSpecificSnapshot(snapshotFileName);
      } else {
        expect(target).toMatchSnapshot();
      }

      if (typeof tree.unmount === 'function') {
        tree.unmount();
      }
    }

    if (typeof result.then === 'function') {
      return result.then(match);
    }

    return match(result);
  };
}

export function multiSnapshotWithOptions(options = {}): StoryshotsTestMethod {
  return ({ story, context, renderTree, stories2snapsConverter }) => {
    const snapshotFileName = stories2snapsConverter.getSnapshotFileName(context);
    return snapshotWithOptions(options)({ story, context, renderTree, snapshotFileName });
  };
}

export const shallowSnapshot: StoryshotsTestMethod = ({
  story,
  context,
  renderShallowTree,
  options = {},
}) => {
  const result = renderShallowTree(story, context, options);
  expect(result).toMatchSnapshot();
};

export function renderWithOptions(options = {}): StoryshotsTestMethod {
  return ({ story, context, renderTree }) => {
    const result = renderTree(story, context, options);
    if (typeof result.then === 'function') {
      return result;
    }

    return undefined;
  };
}

export const renderOnly = renderWithOptions();

export const snapshot = snapshotWithOptions();
