import React from 'react';
import DelayedRender from '../../components/DelayedRender';
import { NamedExportButton } from '../../components/NamedExportButton';

export default {
  title: 'Addons/A11y/NamedExportButton',
  component: NamedExportButton,
  parameters: {
    options: { selectedPanel: 'storybook/a11y/panel' },
  },
};

export const Default = () => <NamedExportButton label="Test" />;
