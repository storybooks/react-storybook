import { Architect, createBuilder } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { schema } from '@angular-devkit/core';
import * as path from 'path';

const buildStandaloneMock = jest.fn().mockImplementation((_options: unknown) => Promise.resolve());
jest.doMock('@storybook/angular/standalone', () => buildStandaloneMock);

const cpSpawnMock = {
  spawn: jest.fn().mockImplementation(() => ({
    stdout: { on: () => {} },
    stderr: { on: () => {} },
    on: (_event: string, cb: any) => cb(0),
  })),
};
jest.doMock('child_process', () => cpSpawnMock);

describe('Start Storybook Builder', () => {
  let architect: Architect;
  let architectHost: TestingArchitectHost;

  beforeEach(async () => {
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    architectHost = new TestingArchitectHost();
    architect = new Architect(architectHost, registry);

    architectHost.addBuilder(
      '@angular-devkit/build-angular:browser',
      createBuilder(() => ({ success: true }))
    );
    architectHost.addTarget(
      { project: 'angular-cli', target: 'build-2' },
      '@angular-devkit/build-angular:browser',
      {
        outputPath: 'dist/angular-cli',
        index: 'src/index.html',
        main: 'src/main.ts',
        polyfills: 'src/polyfills.ts',
        tsConfig: 'src/tsconfig.app.json',
        assets: ['src/favicon.ico', 'src/assets'],
        styles: ['src/styles.css'],
        scripts: [],
      }
    );
    // This will either take a Node package name, or a path to the directory
    // for the package.json file.
    await architectHost.addBuilderFromPackage(path.join(__dirname, '../../..'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should work', async () => {
    const run = await architect.scheduleBuilder('@storybook/angular:start-storybook', {
      browserTarget: 'angular-cli:build-2',
      port: 4400,
      compodoc: false,
    });

    const output = await run.result;

    await run.stop();

    expect(output.success).toBeTruthy();
    expect(cpSpawnMock.spawn).not.toHaveBeenCalledWith();
    expect(buildStandaloneMock).toHaveBeenCalledWith({
      angularBrowserTarget: 'angular-cli:build-2',
      browserTarget: 'angular-cli:build-2',
      ci: false,
      configDir: '.storybook',
      docsMode: false,
      host: 'localhost',
      https: false,
      port: 4400,
      quiet: false,
      smokeTest: false,
      sslCa: undefined,
      sslCert: undefined,
      sslKey: undefined,
      staticDir: [],
      compodoc: false,
      compodocArgs: ['-e', 'json'],
    });
  });

  it('should run compodoc', async () => {
    const run = await architect.scheduleBuilder('@storybook/angular:start-storybook', {
      browserTarget: 'angular-cli:build-2',
    });

    const output = await run.result;

    await run.stop();

    expect(output.success).toBeTruthy();
    expect(cpSpawnMock.spawn).toHaveBeenCalledWith('compodoc', [
      '-p',
      'src/tsconfig.app.json',
      '-d',
      '',
      '-e',
      'json',
    ]);
    expect(buildStandaloneMock).toHaveBeenCalledWith({
      angularBrowserTarget: 'angular-cli:build-2',
      browserTarget: 'angular-cli:build-2',
      ci: false,
      configDir: '.storybook',
      docsMode: false,
      host: 'localhost',
      https: false,
      port: 9009,
      quiet: false,
      smokeTest: false,
      sslCa: undefined,
      sslCert: undefined,
      sslKey: undefined,
      staticDir: [],
      compodoc: true,
      compodocArgs: ['-e', 'json'],
    });
  });
});
