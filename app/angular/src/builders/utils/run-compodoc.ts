import { BuilderContext } from '@angular-devkit/architect';
import { spawn } from 'child_process';
import { Observable } from 'rxjs';

export const runCompodoc = (
  { compodocArgs, tsconfig }: { compodocArgs: string[]; tsconfig: string },
  context: BuilderContext
): Observable<void> =>
  new Observable<void>((observer) => {
    const finalCompodocArgs = [
      // Default options
      '-p',
      tsconfig,
      '-d',
      `${context.workspaceRoot}`,
      ...compodocArgs,
    ];

    try {
      const child = spawn('compodoc', finalCompodocArgs);

      child.stdout.on('data', (data) => {
        context.logger.info(data.toString());
      });
      child.stderr.on('data', (data) => {
        context.logger.error(data.toString());
      });

      child.on('close', (code) => {
        if (code === 0) {
          observer.next();
          observer.complete();
        } else {
          observer.error();
        }
      });
    } catch (error) {
      observer.error(error);
    }
  });
