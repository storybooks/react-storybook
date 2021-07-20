import global from 'global';
import path from 'path';
import startCase from 'lodash/startCase';
import type { NormalizedStoriesEntry } from '@storybook/core-common';

const { FEATURES = {}, STORIES = [] } = global;

interface Meta {
  title?: string;
}

const autoTitleV2 = (meta: Meta, fileName: string) => {
  return meta.title;
};

const stripExtension = (titleWithExtension: string) => {
  let parts = titleWithExtension.split('/');
  const last = parts[parts.length - 1];
  const dotIndex = last.indexOf('.');
  const stripped = dotIndex > 0 ? last.substr(0, dotIndex) : last;
  parts[parts.length - 1] = stripped;
  const [first, ...rest] = parts;
  if (first === '') {
    parts = rest;
  }
  return parts.join('/');
};

const startCaseTitle = (title: string) => {
  return title.split('/').map(startCase).join('/');
};

export const autoTitleFromEntry = (fileName: string, entry: NormalizedStoriesEntry) => {
  const { directory, titlePrefix = '' } = entry.specifier || {};
  if (fileName.startsWith(directory)) {
    const suffix = fileName.replace(directory, '');
    return startCaseTitle(stripExtension(path.join(titlePrefix, suffix)));
  }
  return undefined;
};

const autoTitleV3 = (meta: Meta, fileName: string) => {
  if (meta.title) return meta.title;
  for (let i = 0; i < STORIES.length; i += 1) {
    const title = autoTitleFromEntry(fileName, STORIES[i]);
    if (title) return title;
  }
  return undefined;
};

export const autoTitle = FEATURES.previewCsfV3 ? autoTitleV3 : autoTitleV2;
