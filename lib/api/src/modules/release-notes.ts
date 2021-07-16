import global from 'global';
import memoize from 'memoizerific';

import type { ModuleFn } from '../index';

const { RELEASE_NOTES_DATA } = global;

export interface ReleaseNotes {
  success?: boolean;
  currentVersion?: string;
  showOnFirstLaunch?: boolean;
}

const getReleaseNotesData = memoize(1)(
  (): ReleaseNotes => {
    try {
      return { ...(JSON.parse(RELEASE_NOTES_DATA) || {}) };
    } catch (e) {
      return {};
    }
  }
);

export interface SubAPI {
  releaseNotesVersion: () => string;
  setDidViewReleaseNotes: () => void;
  showReleaseNotesOnLaunch: () => boolean;
}

export interface SubState {
  releaseNotesViewed: string[];
}

export const init: ModuleFn = ({ store }) => {
  const releaseNotesData = getReleaseNotesData();
  const getReleaseNotesViewed = () => {
    const { releaseNotesViewed: persistedReleaseNotesViewed } = store.getState();
    return persistedReleaseNotesViewed || [];
  };

  const api: SubAPI = {
    releaseNotesVersion: () => releaseNotesData.currentVersion,
    setDidViewReleaseNotes: () => {
      const releaseNotesViewed = getReleaseNotesViewed();

      if (!releaseNotesViewed.includes(releaseNotesData.currentVersion)) {
        store.setState(
          { releaseNotesViewed: [...releaseNotesViewed, releaseNotesData.currentVersion] },
          { persistence: 'permanent' }
        );
      }
    },
    showReleaseNotesOnLaunch: () => {
      // The currentVersion will only exist for dev builds
      if (!releaseNotesData.currentVersion) return false;
      const releaseNotesViewed = getReleaseNotesViewed();
      const didViewReleaseNotes = releaseNotesViewed.includes(releaseNotesData.currentVersion);
      const showReleaseNotesOnLaunch = releaseNotesData.showOnFirstLaunch && !didViewReleaseNotes;
      return showReleaseNotesOnLaunch;
    },
  };

  const initModule = () => {};

  return { init: initModule, api };
};
