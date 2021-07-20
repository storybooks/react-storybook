import fs from 'fs';
import path from 'path';
import type { StoriesEntry, NormalizedStoriesEntry } from '../types';

const DEFAULT_FILES = '*.stories.@(mdx|tsx|ts|jsx|js)';
const DEFAULT_TITLE_PREFIX = '';
// Excaping regexes for glob regexes is fun
// Mathing things like '../**/*.stories.mdx'
const GLOB_REGEX = /^(?<directory>[^*]*)\/\*\*\/(?<files>\*\..*)/;

const isDirectory = (configDir: string, entry: string) => {
  try {
    return fs.lstatSync(path.resolve(configDir, entry)).isDirectory();
  } catch (err) {
    return false;
  }
};

export const normalizeStoriesEntry = (
  entry: StoriesEntry,
  configDir: string
): NormalizedStoriesEntry => {
  let glob;
  let directory;
  let files;
  let titlePrefix;
  if (typeof entry === 'string') {
    if (!entry.includes('**') && isDirectory(configDir, entry)) {
      directory = entry;
      files = DEFAULT_FILES;
      titlePrefix = DEFAULT_TITLE_PREFIX;
    } else {
      const match = entry.match(GLOB_REGEX);
      if (match) {
        directory = match.groups.directory;
        files = match.groups.files;
        titlePrefix = DEFAULT_TITLE_PREFIX;
      } else {
        glob = entry;
      }
    }
  } else {
    directory = entry.directory;
    files = entry.files || DEFAULT_FILES;
    titlePrefix = entry.titlePrefix || DEFAULT_TITLE_PREFIX;
  }
  if (typeof glob !== 'undefined') {
    return { glob, specifier: undefined };
  }
  return { glob: `${directory}/**/${files}`, specifier: { directory, titlePrefix, files } };
};

interface NormalizeOptions {
  configDir: string;
  workingDir: string;
}

/**
 * Stories entries are specified relative to the configDir. Webpack filenames are produced relative to the
 * current working directory. This function rewrites the specifier.directory relative to the current working
 * directory.
 */
export const normalizeDirectory = (
  entry: NormalizedStoriesEntry,
  { configDir, workingDir }: NormalizeOptions
) => {
  if (!entry.specifier) return entry;

  const { directory } = entry.specifier;
  const directoryFromConfig = path.resolve(configDir, directory);
  let directoryFromWorking = path.relative(workingDir, directoryFromConfig);

  // relative('/foo', '/foo/src') => 'src'
  // but we want `./src`to match webpack's file names
  if (!directoryFromWorking.startsWith('.')) {
    directoryFromWorking = `.${path.sep}${directoryFromWorking}`;
  }

  return {
    ...entry,
    specifier: {
      ...entry.specifier,
      directory: directoryFromWorking,
    },
  };
};

export const normalizeStories = (entries: StoriesEntry[], options: NormalizeOptions) =>
  entries.map((entry) =>
    normalizeDirectory(normalizeStoriesEntry(entry, options.configDir), options)
  );
