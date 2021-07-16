import type { ReactNode } from 'react';
import type { ModuleFn } from '../index';

export interface Notification {
  id: string;
  link: string;
  content: {
    headline: string;
    subHeadline?: string | ReactNode;
  };

  icon?: {
    name: string;
    color?: string;
  };
  onClear?: () => void;
}

export interface SubState {
  notifications: Notification[];
}

export interface SubAPI {
  addNotification: (notification: Notification) => void;
  clearNotification: (id: string) => void;
}

export const init: ModuleFn = ({ store }) => {
  const api: SubAPI = {
    addNotification: (notification) => {
      // Get rid of it if already exists
      api.clearNotification(notification.id);

      const { notifications } = store.getState();

      store.setState({ notifications: [...notifications, notification] });
    },

    clearNotification: (id) => {
      const { notifications } = store.getState();

      store.setState({ notifications: notifications.filter((n) => n.id !== id) });

      const notification = notifications.find((n) => n.id === id);
      if (notification && notification.onClear) {
        notification.onClear();
      }
    },
  };

  const state: SubState = { notifications: [] };

  return { api, state };
};
