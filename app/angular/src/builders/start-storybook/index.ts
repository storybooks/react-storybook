import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
  targetFromTargetString,
} from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { BrowserBuilderOptions } from '@angular-devkit/build-angular';
import { from, Observable, of } from 'rxjs';
import { CLIOptions } from '@storybook/core-common';
import { map, switchMap } from 'rxjs/operators';

// eslint-disable-next-line import/no-extraneous-dependencies
import buildStandalone, { StandaloneOptions } from '@storybook/angular/standalone';
import { runCompodoc } from '../utils/run-compodoc';

export type StorybookBuilderOptions = JsonObject & {
  browserTarget: string;
  compodoc: boolean;
  compodocArgs: string[];
} & Pick<
    // makes sure the option exists
    CLIOptions,
    | 'port'
    | 'host'
    | 'staticDir'
    | 'configDir'
    | 'https'
    | 'sslCa'
    | 'sslCert'
    | 'sslKey'
    | 'smokeTest'
    | 'ci'
    | 'quiet'
    | 'docs'
  >;

export type StorybookBuilderOutput = JsonObject & BuilderOutput & Record<string, any>;

export default createBuilder(commandBuilder);

function commandBuilder(
  options: StorybookBuilderOptions,
  context: BuilderContext
): Observable<StorybookBuilderOutput> {
  return from(setup(options, context)).pipe(
    switchMap(({ browserOptions }) =>
      options.compodoc
        ? runCompodoc(
            { compodocArgs: options.compodocArgs, tsconfig: browserOptions.tsConfig },
            context
          )
        : of({})
    ),
    map(() => ({
      ...options,
      angularBrowserTarget: options.browserTarget,
    })),
    switchMap((standaloneOptions) => runInstance(standaloneOptions)),
    map(() => ({ success: true }))
  );
}

async function setup(options: StorybookBuilderOptions, context: BuilderContext) {
  const browserTarget = targetFromTargetString(options.browserTarget);
  const browserOptions = await context.validateOptions<JsonObject & BrowserBuilderOptions>(
    await context.getTargetOptions(browserTarget),
    await context.getBuilderNameForTarget(browserTarget)
  );

  return {
    browserOptions,
    browserTarget,
  };
}

function runInstance(options: StandaloneOptions) {
  return new Observable<void>((observer) => {
    // This Observable intentionally never complete, leaving the process running ;)
    buildStandalone(options).then(
      () => observer.next(),
      (error) => observer.error(error)
    );
  });
}
