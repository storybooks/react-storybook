/* eslint-disable global-require, no-underscore-dangle, import/no-dynamic-require */
import path from 'path';
import fs from 'fs';

const fileExists = (basename: string) =>
  ['.js', '.cjs'].reduce((found: string, ext: string) => {
    const filename = `${basename}${ext}`;
    return !found && fs.existsSync(filename) ? filename : found;
  }, '');

export function getMiddleware(configDir: string) {
  const middlewarePath = fileExists(path.resolve(configDir, 'middleware'));
  if (middlewarePath) {
    let middlewareModule = require(middlewarePath);
    if (middlewareModule.__esModule) {
      middlewareModule = middlewareModule.default;
    }
    return middlewareModule;
  }
  return () => {};
}
