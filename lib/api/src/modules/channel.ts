import { STORIES_COLLAPSE_ALL, STORIES_EXPAND_ALL } from '@storybook/core-events';
import { Channel, Listener } from '@storybook/channels';

import type { ModuleFn } from '../index';

export interface SubAPI {
  getChannel: () => Channel;
  on: (type: string, cb: Listener) => () => void;
  off: (type: string, cb: Listener) => void;
  emit: (type: string, ...args: any[]) => void;
  once: (type: string, cb: Listener) => void;
  collapseAll: () => void;
  expandAll: () => void;
}

export const init: ModuleFn = ({ provider }) => {
  const api: SubAPI = {
    getChannel: () => provider.channel,
    on: (type, cb) => {
      provider.channel.addListener(type, cb);

      return () => provider.channel.removeListener(type, cb);
    },
    off: (type, cb) => provider.channel.removeListener(type, cb),
    once: (type, cb) => provider.channel.once(type, cb),
    emit: (type, ...args) => provider.channel.emit(type, ...args),

    collapseAll: () => {
      provider.channel.emit(STORIES_COLLAPSE_ALL, {});
    },
    expandAll: () => {
      api.emit(STORIES_EXPAND_ALL);
    },
  };
  return { api };
};
