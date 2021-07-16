import { sync as spawnSync } from 'cross-spawn';
import { sync as findUpSync } from 'find-up';
import { JsPackageManagerFactory } from './JsPackageManagerFactory';
import { NPMProxy } from './NPMProxy';
import { Yarn1Proxy } from './Yarn1Proxy';
import { Yarn2Proxy } from './Yarn2Proxy';

jest.mock('cross-spawn');
const spawnSyncMock = spawnSync as jest.Mock;

jest.mock('find-up');
const findUpSyncMock = (findUpSync as unknown) as jest.Mock;
findUpSyncMock.mockReturnValue(undefined);

describe('JsPackageManagerFactory', () => {
  describe('getPackageManager', () => {
    describe('return an NPM proxy', () => {
      it('when `useNpm` option is used', () => {
        expect(JsPackageManagerFactory.getPackageManager(true)).toBeInstanceOf(NPMProxy);
      });

      it('when NPM command is ok, Yarn is ok, there is no `yarn.lock` file', () => {
        spawnSyncMock.mockImplementation((command) =>
          command === 'yarn'
            ? {
                // Yarn is ok
                status: 0,
                output: '1.22.4',
              }
            : {
                // NPM is ok
                status: 0,
                output: '6.5.12',
              }
        );

        // There is no yarn.lock
        findUpSyncMock.mockImplementation((file) => (file === 'yarn.lock' ? undefined : ''));

        expect(JsPackageManagerFactory.getPackageManager(false)).toBeInstanceOf(NPMProxy);
      });
    });

    describe('return a Yarn 1 proxy', () => {
      it('when Yarn command is ok, Yarn version is <2, NPM is ko', () => {
        spawnSyncMock.mockImplementation((command) =>
          command === 'yarn'
            ? {
                // Yarn is ok
                status: 0,
                output: '1.22.4',
              }
            : {
                // NPM is ko
                status: 1,
              }
        );

        // there is no
        findUpSyncMock.mockReturnValue(undefined);

        expect(JsPackageManagerFactory.getPackageManager(false)).toBeInstanceOf(Yarn1Proxy);
      });

      it('when Yarn command is ok, Yarn version is <2, NPM is ok, there is a `yarn.lock` file', () => {
        spawnSyncMock.mockImplementation((command) =>
          command === 'yarn'
            ? {
                // Yarn is ok
                status: 0,
                output: '1.22.4',
              }
            : {
                // NPM is ok
                status: 0,
                output: '6.5.12',
              }
        );

        // There is a yarn.lock
        findUpSyncMock.mockImplementation((file) =>
          file === 'yarn.lock' ? '/Users/johndoe/Documents/yarn.lock' : undefined
        );

        expect(JsPackageManagerFactory.getPackageManager(false)).toBeInstanceOf(Yarn1Proxy);
      });
    });

    describe('return a Yarn 2 proxy', () => {
      it('when Yarn command is ok, Yarn version is >=2, NPM is ko', () => {
        spawnSyncMock.mockImplementation((command) =>
          command === 'yarn'
            ? {
                // Yarn is ok
                status: 0,
                output: '2.0.0-rc.33',
              }
            : {
                // NPM is ko
                status: 1,
              }
        );

        expect(JsPackageManagerFactory.getPackageManager(false)).toBeInstanceOf(Yarn2Proxy);
      });

      it('when Yarn command is ok, Yarn version is >=2, NPM is ok, there is a `yarn.lock` file', () => {
        spawnSyncMock.mockImplementation((command) =>
          command === 'yarn'
            ? {
                // Yarn is ok
                status: 0,
                output: '2.0.0-rc.33',
              }
            : {
                // NPM is ok
                status: 0,
                output: '6.5.12',
              }
        );

        // There is a yarn.lock
        findUpSyncMock.mockImplementation((file) =>
          file === 'yarn.lock' ? '/Users/johndoe/Documents/yarn.lock' : undefined
        );

        expect(JsPackageManagerFactory.getPackageManager(false)).toBeInstanceOf(Yarn2Proxy);
      });
    });

    it('throws an error if Yarn is ko and NPM is ko', () => {
      spawnSyncMock.mockReturnValue({ status: 1 });
      expect(() => JsPackageManagerFactory.getPackageManager(false)).toThrow();
    });
  });
});
