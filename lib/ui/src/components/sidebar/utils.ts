import memoize from 'memoizerific';
import global from 'global';
import { SyntheticEvent } from 'react';
import type { StoriesHash } from '@storybook/api';
import { isRoot } from '@storybook/api';

import { DEFAULT_REF_ID } from './data';
import { Item, RefType, Dataset, SearchItem } from './types';

const { document, window: globalWindow, DOCS_MODE } = global;

export const createId = (itemId: string, refId?: string) =>
  !refId || refId === DEFAULT_REF_ID ? itemId : `${refId}_${itemId}`;

export const getLink = (itemId: string, refId?: string) => {
  const type = DOCS_MODE ? 'docs' : 'story';
  return `${document.location.pathname}?path=/${type}/${createId(itemId, refId)}`;
};

export const prevent = (e: SyntheticEvent) => {
  e.preventDefault();
  return false;
};

export const get = memoize(1000)((id: string, dataset: Dataset) => dataset[id]);
export const getParent = memoize(1000)((id: string, dataset: Dataset) => {
  const item = get(id, dataset);
  return item && !isRoot(item) ? get(item.parent, dataset) : undefined;
});
export const getParents = memoize(1000)((id: string, dataset: Dataset): Item[] => {
  const parent = getParent(id, dataset);
  return parent ? [parent, ...getParents(parent.id, dataset)] : [];
});
export const getAncestorIds = memoize(1000)((data: StoriesHash, id: string): string[] =>
  getParents(id, data).map((item) => item.id)
);
export const getDescendantIds = memoize(1000)(
  (data: StoriesHash, id: string, skipLeafs: boolean): string[] => {
    const { children = [] } = data[id] || {};
    return children.reduce((acc, childId) => {
      if (!data[childId] || (skipLeafs && data[childId].isLeaf)) return acc;
      acc.push(childId, ...getDescendantIds(data, childId, skipLeafs));
      return acc;
    }, []);
  }
);

export function getPath(item: Item, ref: RefType): string[] {
  const parent = !isRoot(item) && item.parent ? ref.stories[item.parent] : null;
  if (parent) return [...getPath(parent, ref), parent.name];
  return ref.id === DEFAULT_REF_ID ? [] : [ref.title || ref.id];
}

export const searchItem = (item: Item, ref: RefType): SearchItem => ({
  ...item,
  refId: ref.id,
  path: getPath(item, ref),
});

export function cycle<T>(array: T[], index: number, delta: number): number {
  let next = index + (delta % array.length);
  if (next < 0) next = array.length + next;
  if (next >= array.length) next -= array.length;
  return next;
}

export const scrollIntoView = (element: Element, center = false) => {
  if (!element) return;
  const { top, bottom } = element.getBoundingClientRect();
  const isInView =
    top >= 0 && bottom <= (globalWindow.innerHeight || document.documentElement.clientHeight);
  if (!isInView) element.scrollIntoView({ block: center ? 'center' : 'nearest' });
};

export const getStateType = (
  isLoading: boolean,
  isAuthRequired: boolean,
  isError: boolean,
  isEmpty: boolean
) => {
  switch (true) {
    case isAuthRequired:
      return 'auth';
    case isError:
      return 'error';
    case isLoading:
      return 'loading';
    case isEmpty:
      return 'empty';
    default:
      return 'ready';
  }
};

export const isAncestor = (element?: Element, maybeAncestor?: Element): boolean => {
  if (!element || !maybeAncestor) return false;
  if (element === maybeAncestor) return true;
  return isAncestor(element.parentElement, maybeAncestor);
};
