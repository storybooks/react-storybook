import renderer from 'react-test-renderer';
import shallow from 'react-test-renderer/shallow';
import 'jest-specific-snapshot';
import { getSnapshotFileName } from './utils';

function getElementToRender(element) {
  // returns a decorated element if available
  try {
    return element.props.initialContent.props.children;
  } catch (err) {
    return element;
  }
}

function getRenderedTree(story, context, options) {
  const storyElement = story.render(context);
  const elementToRender = getElementToRender(storyElement);
  return renderer.create(elementToRender, options).toJSON();
}

export const snapshotWithOptions = options => ({ story, context }) => {
  const tree = getRenderedTree(story, context, options);
  expect(tree).toMatchSnapshot();
};

export const multiSnapshotWithOptions = options => ({ story, context }) => {
  const tree = getRenderedTree(story, context, options);
  const snapshotFileName = getSnapshotFileName(context);

  if (!snapshotFileName) {
    expect(tree).toMatchSnapshot();
    return;
  }

  expect(tree).toMatchSpecificSnapshot(snapshotFileName);
};

export const snapshot = snapshotWithOptions({});

export function shallowSnapshot({ story, context }) {
  const shallowRenderer = shallow.createRenderer();
  const result = shallowRenderer.render(story.render(context));
  expect(result).toMatchSnapshot();
}

export function renderOnly({ story, context }) {
  const storyElement = story.render(context);
  renderer.create(storyElement);
}
