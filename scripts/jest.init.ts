import 'jest-enzyme/lib/index';
import '@testing-library/jest-dom';

// setup file
import { configure } from 'enzyme';
// @ts-ignore
import Adapter from 'enzyme-adapter-react-16';
// @ts-ignore
import regeneratorRuntime from 'regenerator-runtime';
// @ts-ignore
import registerRequireContextHook from 'babel-plugin-require-context-hook/register';

registerRequireContextHook();

jest.mock('util-deprecate', () => (fn: any) => fn);

// mock console.info calls for cleaner test execution
global.console.info = jest.fn().mockImplementation(() => {});
global.console.debug = jest.fn().mockImplementation(() => {});

// mock local storage calls
const localStorageMock = {
  getItem: jest.fn().mockName('getItem'),
  setItem: jest.fn().mockName('setItem'),
  clear: jest.fn().mockName('clear'),
};
// @ts-ignore
global.localStorage = localStorageMock;
// @ts-ignore
global.regeneratorRuntime = regeneratorRuntime;

configure({ adapter: new Adapter() });

/* Fail tests on PropType warnings
 This allows us to throw an error in tests environments when there are prop-type warnings.
 This should keep the tests free of warnings going forward.
 */

const ignoreList = [
  (error: any) => error.message.includes('":nth-child" is potentially unsafe'),
  (error: any) => error.message.includes('":first-child" is potentially unsafe'),
  (error: any) => error.message.includes('Failed prop type') && error.stack.includes('storyshots'),
  (error: any) =>
    error.message.includes('react-async-component-lifecycle-hooks') &&
    error.stack.includes('addons/knobs/src/components/__tests__/Options.js'),
];

const throwMessage = (type: any, message: any) => {
  const error = new Error(`${type}${message}`);
  if (!ignoreList.reduce((acc, item) => acc || item(error), false)) {
    throw error;
  }
};
const throwWarning = (message: any) => throwMessage('warn: ', message);
const throwError = (message: any) => throwMessage('error: ', message);

global.console.error = throwError;
global.console.warn = throwWarning;

// Mock for matchMedia since it's not yet implemented in JSDOM (https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom)
global.window.matchMedia = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));
