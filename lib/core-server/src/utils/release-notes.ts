import semver from '@storybook/semver';
import { ReleaseNotesData } from '@storybook/core-common';

// We only expect to have release notes available for major and minor releases.
// For this reason, we convert the actual version of the build here so that
// every place that relies on this data can reference the version of the
// release notes that we expect to use.
const getReleaseNotesVersion = (version: string): string => {
  const { major, minor } = semver.parse(version);
  const { version: releaseNotesVersion } = semver.coerce(`${major}.${minor}`);
  return releaseNotesVersion;
};
export const getReleaseNotesFailedState = (version: string) => ({
  success: false,
  currentVersion: getReleaseNotesVersion(version),
  showOnFirstLaunch: false,
});

export const RELEASE_NOTES_CACHE_KEY = 'releaseNotesData';

export const getReleaseNotesData = async (
  currentVersionToParse: string,
  fileSystemCache: any
): Promise<ReleaseNotesData> => {
  let result;
  try {
    const fromCache = (await fileSystemCache.get('releaseNotesData', []).catch(() => {})) || [];
    const releaseNotesVersion = getReleaseNotesVersion(currentVersionToParse);
    const versionHasNotBeenSeen = !fromCache.includes(releaseNotesVersion);

    if (versionHasNotBeenSeen) {
      await fileSystemCache.set('releaseNotesData', [...fromCache, releaseNotesVersion]);
    }

    const sortedHistory = semver.sort(fromCache);
    const highestVersionSeenInThePast = sortedHistory.slice(-1)[0];

    let isUpgrading = false;
    let isMajorOrMinorDiff = false;

    if (highestVersionSeenInThePast) {
      isUpgrading = semver.gt(releaseNotesVersion, highestVersionSeenInThePast);
      const versionDiff = semver.diff(releaseNotesVersion, highestVersionSeenInThePast);
      isMajorOrMinorDiff = versionDiff === 'major' || versionDiff === 'minor';
    }

    result = {
      success: true,
      showOnFirstLaunch:
        versionHasNotBeenSeen &&
        // Only show the release notes if this is not the first time Storybook
        // has been built.
        !!highestVersionSeenInThePast &&
        isUpgrading &&
        isMajorOrMinorDiff,
      currentVersion: releaseNotesVersion,
    };
  } catch (e) {
    result = getReleaseNotesFailedState(currentVersionToParse);
  }
  return result;
};
