import { useStorybookApi } from '@storybook/api';
import React, { FunctionComponent, useEffect } from 'react';

import { ReleaseNotesScreen } from './release_notes';

const ReleaseNotesPage: FunctionComponent = () => {
  const api = useStorybookApi();

  useEffect(() => {
    api.setDidViewReleaseNotes();
  }, [api]);

  const version = api.releaseNotesVersion();

  return <ReleaseNotesScreen version={version} />;
};

export { ReleaseNotesPage };
