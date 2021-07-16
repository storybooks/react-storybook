import global from 'global';
import { PREVIEW_KEYDOWN } from '@storybook/core-events';

import type { ModuleFn } from '../index';

import { shortcutMatchesShortcut, eventToShortcut } from '../lib/shortcut';
import { focusableUIElements } from './layout';

const { navigator, document } = global;

export const isMacLike = () =>
  navigator && navigator.platform ? !!navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) : false;
export const controlOrMetaKey = () => (isMacLike() ? 'meta' : 'control');

export function keys<O>(o: O) {
  return Object.keys(o) as (keyof O)[];
}

export interface SubState {
  shortcuts: Shortcuts;
}

export interface SubAPI {
  getShortcutKeys(): Shortcuts;
  getDefaultShortcuts(): Shortcuts | AddonShortcutDefaults;
  getAddonsShortcuts(): AddonShortcuts;
  getAddonsShortcutLabels(): AddonShortcutLabels;
  getAddonsShortcutDefaults(): AddonShortcutDefaults;
  setShortcuts(shortcuts: Shortcuts): Promise<Shortcuts>;
  setShortcut(action: Action, value: KeyCollection): Promise<KeyCollection>;
  setAddonShortcut(addon: string, shortcut: AddonShortcut): Promise<AddonShortcut>;
  restoreAllDefaultShortcuts(): Promise<Shortcuts>;
  restoreDefaultShortcut(action: Action): Promise<KeyCollection>;
  handleKeydownEvent(event: Event): void;
  handleShortcutFeature(feature: Action): void;
}
export type KeyCollection = string[];

export interface Shortcuts {
  fullScreen: KeyCollection;
  togglePanel: KeyCollection;
  panelPosition: KeyCollection;
  toggleNav: KeyCollection;
  toolbar: KeyCollection;
  search: KeyCollection;
  focusNav: KeyCollection;
  focusIframe: KeyCollection;
  focusPanel: KeyCollection;
  prevComponent: KeyCollection;
  nextComponent: KeyCollection;
  prevStory: KeyCollection;
  nextStory: KeyCollection;
  shortcutsPage: KeyCollection;
  aboutPage: KeyCollection;
  escape: KeyCollection;
  collapseAll: KeyCollection;
  expandAll: KeyCollection;
}

export type Action = keyof Shortcuts;

interface AddonShortcut {
  label: string;
  defaultShortcut: KeyCollection;
  actionName: string;
  showInMenu?: boolean;
  action: (...args: any[]) => any;
}
type AddonShortcuts = Record<string, AddonShortcut>;
type AddonShortcutLabels = Record<string, string>;
type AddonShortcutDefaults = Record<string, KeyCollection>;

export const defaultShortcuts: Shortcuts = Object.freeze({
  fullScreen: ['F'],
  togglePanel: ['A'],
  panelPosition: ['D'],
  toggleNav: ['S'],
  toolbar: ['T'],
  search: ['/'],
  focusNav: ['1'],
  focusIframe: ['2'],
  focusPanel: ['3'],
  prevComponent: ['alt', 'ArrowUp'],
  nextComponent: ['alt', 'ArrowDown'],
  prevStory: ['alt', 'ArrowLeft'],
  nextStory: ['alt', 'ArrowRight'],
  shortcutsPage: [controlOrMetaKey(), 'shift', ','],
  aboutPage: [','],
  escape: ['escape'], // This one is not customizable
  collapseAll: [controlOrMetaKey(), 'shift', 'ArrowUp'],
  expandAll: [controlOrMetaKey(), 'shift', 'ArrowDown'],
});

const addonsShortcuts: AddonShortcuts = {};
export interface Event extends KeyboardEvent {
  target: {
    tagName: string;
    addEventListener(): void;
    removeEventListener(): boolean;
    dispatchEvent(event: Event): boolean;
    getAttribute(attr: string): string | null;
  };
}

function focusInInput(event: Event) {
  return (
    /input|textarea/i.test(event.target.tagName) ||
    event.target.getAttribute('contenteditable') !== null
  );
}

export const init: ModuleFn = ({ store, fullAPI }) => {
  const api: SubAPI = {
    // Getting and setting shortcuts
    getShortcutKeys(): Shortcuts {
      return store.getState().shortcuts;
    },
    getDefaultShortcuts(): Shortcuts | AddonShortcutDefaults {
      return {
        ...defaultShortcuts,
        ...api.getAddonsShortcutDefaults(),
      };
    },
    getAddonsShortcuts(): AddonShortcuts {
      return addonsShortcuts;
    },
    getAddonsShortcutLabels(): AddonShortcutLabels {
      const labels: AddonShortcutLabels = {};
      Object.entries(api.getAddonsShortcuts()).forEach(([actionName, { label }]) => {
        labels[actionName] = label;
      });

      return labels;
    },
    getAddonsShortcutDefaults(): AddonShortcutDefaults {
      const defaults: AddonShortcutDefaults = {};
      Object.entries(api.getAddonsShortcuts()).forEach(([actionName, { defaultShortcut }]) => {
        defaults[actionName] = defaultShortcut;
      });

      return defaults;
    },
    async setShortcuts(shortcuts: Shortcuts) {
      await store.setState({ shortcuts }, { persistence: 'permanent' });
      return shortcuts;
    },
    async restoreAllDefaultShortcuts() {
      return api.setShortcuts(api.getDefaultShortcuts() as Shortcuts);
    },
    async setShortcut(action, value) {
      const shortcuts = api.getShortcutKeys();
      await api.setShortcuts({ ...shortcuts, [action]: value });
      return value;
    },
    async setAddonShortcut(addon: string, shortcut: AddonShortcut) {
      const shortcuts = api.getShortcutKeys();
      await api.setShortcuts({
        ...shortcuts,
        [`${addon}-${shortcut.actionName}`]: shortcut.defaultShortcut,
      });
      addonsShortcuts[`${addon}-${shortcut.actionName}`] = shortcut;
      return shortcut;
    },
    async restoreDefaultShortcut(action) {
      const defaultShortcut = api.getDefaultShortcuts()[action];
      return api.setShortcut(action, defaultShortcut);
    },

    // Listening to shortcut events
    handleKeydownEvent(event) {
      const shortcut = eventToShortcut(event);
      const shortcuts = api.getShortcutKeys();
      const actions = keys(shortcuts);
      const matchedFeature = actions.find((feature: Action) =>
        shortcutMatchesShortcut(shortcut, shortcuts[feature])
      );
      if (matchedFeature) {
        // Event.prototype.preventDefault is missing when received from the MessageChannel.
        if (event?.preventDefault) event.preventDefault();
        api.handleShortcutFeature(matchedFeature);
      }
    },

    // warning: event might not have a full prototype chain because it may originate from the channel
    handleShortcutFeature(feature) {
      const {
        layout: { isFullscreen, showNav, showPanel },
        ui: { enableShortcuts },
      } = store.getState();
      if (!enableShortcuts) {
        return;
      }
      switch (feature) {
        case 'escape': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
          } else if (!showNav) {
            fullAPI.toggleNav();
          }
          break;
        }

        case 'focusNav': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
          }
          if (!showNav) {
            fullAPI.toggleNav();
          }
          fullAPI.focusOnUIElement(focusableUIElements.storyListMenu);
          break;
        }

        case 'search': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
          }
          if (!showNav) {
            fullAPI.toggleNav();
          }

          setTimeout(() => {
            fullAPI.focusOnUIElement(focusableUIElements.storySearchField, true);
          }, 0);
          break;
        }

        case 'focusIframe': {
          const element = document.getElementById('storybook-preview-iframe');

          if (element) {
            try {
              // should be like a channel message and all that, but yolo for now
              element.contentWindow.focus();
            } catch (e) {
              //
            }
          }
          break;
        }

        case 'focusPanel': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
          }
          if (!showPanel) {
            fullAPI.togglePanel();
          }
          fullAPI.focusOnUIElement(focusableUIElements.storyPanelRoot);
          break;
        }

        case 'nextStory': {
          fullAPI.jumpToStory(1);
          break;
        }

        case 'prevStory': {
          fullAPI.jumpToStory(-1);
          break;
        }

        case 'nextComponent': {
          fullAPI.jumpToComponent(1);
          break;
        }

        case 'prevComponent': {
          fullAPI.jumpToComponent(-1);
          break;
        }

        case 'fullScreen': {
          fullAPI.toggleFullscreen();
          break;
        }

        case 'togglePanel': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
            fullAPI.resetLayout();
          }

          fullAPI.togglePanel();
          break;
        }

        case 'toggleNav': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
            fullAPI.resetLayout();
          }

          fullAPI.toggleNav();
          break;
        }

        case 'toolbar': {
          fullAPI.toggleToolbar();
          break;
        }

        case 'panelPosition': {
          if (isFullscreen) {
            fullAPI.toggleFullscreen();
          }
          if (!showPanel) {
            fullAPI.togglePanel();
          }

          fullAPI.togglePanelPosition();
          break;
        }

        case 'aboutPage': {
          fullAPI.navigate('/settings/about');
          break;
        }

        case 'shortcutsPage': {
          fullAPI.navigate('/settings/shortcuts');
          break;
        }
        case 'collapseAll': {
          fullAPI.collapseAll();
          break;
        }
        case 'expandAll': {
          fullAPI.expandAll();
          break;
        }
        default:
          addonsShortcuts[feature].action();
          break;
      }
    },
  };

  const { shortcuts: persistedShortcuts = defaultShortcuts }: SubState = store.getState();
  const state: SubState = {
    // Any saved shortcuts that are still in our set of defaults
    shortcuts: keys(defaultShortcuts).reduce(
      (acc, key) => ({ ...acc, [key]: persistedShortcuts[key] || defaultShortcuts[key] }),
      defaultShortcuts
    ),
  };

  const initModule = () => {
    // Listen for keydown events in the manager
    document.addEventListener('keydown', (event: Event) => {
      if (!focusInInput(event)) {
        fullAPI.handleKeydownEvent(event);
      }
    });

    // Also listen to keydown events sent over the channel
    fullAPI.on(PREVIEW_KEYDOWN, (data: { event: Event }) => {
      fullAPI.handleKeydownEvent(data.event);
    });
  };

  return { api, state, init: initModule };
};
