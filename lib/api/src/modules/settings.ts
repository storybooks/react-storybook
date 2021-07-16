import type { ModuleFn } from '../index';

export interface SubAPI {
  changeSettingsTab: (tab: string) => void;
  closeSettings: () => void;
  isSettingsScreenActive: () => boolean;
  navigateToSettingsPage: (path: string) => Promise<void>;
}

export interface Settings {
  lastTrackedStoryId: string;
}

export interface SubState {
  settings: Settings;
}

export const init: ModuleFn = ({ store, navigate, fullAPI }) => {
  const isSettingsScreenActive = () => {
    const { path } = fullAPI.getUrlState();
    return !!(path || '').match(/^\/settings/);
  };
  const api: SubAPI = {
    closeSettings: () => {
      const {
        settings: { lastTrackedStoryId },
      } = store.getState();

      if (lastTrackedStoryId) {
        fullAPI.selectStory(lastTrackedStoryId);
      } else {
        fullAPI.selectFirstStory();
      }
    },
    changeSettingsTab: (tab: string) => {
      navigate(`/settings/${tab}`);
    },
    isSettingsScreenActive,
    navigateToSettingsPage: async (path) => {
      if (!isSettingsScreenActive()) {
        const { settings, storyId } = store.getState();

        await store.setState({
          settings: { ...settings, lastTrackedStoryId: storyId },
        });
      }

      navigate(path);
    },
  };

  const initModule = async () => {
    await store.setState({ settings: { lastTrackedStoryId: null } });
  };

  return { init: initModule, api };
};
