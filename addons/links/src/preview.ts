import global from 'global';
import qs from 'qs';
import { addons, makeDecorator } from '@storybook/addons';
import { STORY_CHANGED, SELECT_STORY } from '@storybook/core-events';
import { toId } from '@storybook/csf';
import { logger } from '@storybook/client-logger';
import { PARAM_KEY } from './constants';

const {
  document,
  HTMLElement,
  __STORYBOOK_STORY_STORE__: storyStore,
  __STORYBOOK_CLIENT_API__: clientApi,
} = global;

interface ParamsId {
  storyId: string;
}
interface ParamsCombo {
  kind: string;
  story: string;
}

export const navigate = (params: ParamsId | ParamsCombo) =>
  addons.getChannel().emit(SELECT_STORY, params);

const generateUrl = (id: string) => {
  const { location } = document;
  const query = qs.parse(location.search, { ignoreQueryPrefix: true });
  return `${location.origin + location.pathname}?${qs.stringify(
    { ...query, id },
    { encode: false }
  )}`;
};

const valueOrCall = (args: string[]) => (value: string | ((...a: string[]) => string)) =>
  typeof value === 'function' ? value(...args) : value;

export const linkTo = (idOrKindInput: string, storyInput?: string | ((...a: any[]) => string)) => (
  ...args: any[]
) => {
  const resolver = valueOrCall(args);
  const { storyId } = storyStore.getSelection();
  const current = storyStore.fromId(storyId) || {};
  const kindVal = resolver(idOrKindInput);
  const storyVal = resolver(storyInput);

  const fromid = storyStore.fromId(kindVal);

  const item =
    fromid ||
    clientApi.raw().find((i: any) => {
      if (kindVal && storyVal) {
        return i.kind === kindVal && i.story === storyVal;
      }
      if (!kindVal && storyVal) {
        return i.kind === current.kind && i.story === storyVal;
      }
      if (kindVal && !storyVal) {
        return i.kind === kindVal;
      }
      if (!kindVal && !storyVal) {
        return i.kind === current.kind;
      }
      return false;
    });

  if (item) {
    navigate({
      kind: item.kind,
      story: item.story,
    });
  } else {
    logger.error('could not navigate to provided story');
  }
};

export const hrefTo = (kind: string, name: string): Promise<string> =>
  new Promise((resolve) => {
    const { storyId } = storyStore.getSelection();
    const current = storyStore.fromId(storyId);
    resolve(generateUrl(toId(kind || current.kind, name)));
  });

const linksListener = (e: Event) => {
  const { target } = e;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const element = target as HTMLElement;
  const { sbKind: kind, sbStory: story } = element.dataset;
  if (kind || story) {
    e.preventDefault();
    navigate({ kind, story });
  }
};

let hasListener = false;

const on = () => {
  if (!hasListener) {
    hasListener = true;
    document.addEventListener('click', linksListener);
  }
};
const off = () => {
  if (hasListener) {
    hasListener = false;
    document.removeEventListener('click', linksListener);
  }
};

export const withLinks = makeDecorator({
  name: 'withLinks',
  parameterName: PARAM_KEY,
  wrapper: (getStory, context, { parameters }) => {
    on();
    addons.getChannel().once(STORY_CHANGED, off);
    return getStory(context);
  },
});
