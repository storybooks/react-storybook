import React, { Component, FunctionComponent } from 'react';

import { API, useStorybookApi } from '@storybook/api';

import { AboutScreen } from './about';

// Clear a notification on mount. This could be exported by core/notifications.js perhaps?
class NotificationClearer extends Component<{ api: API; notificationId: string }> {
  componentDidMount() {
    const { api, notificationId } = this.props;
    api.clearNotification(notificationId);
  }

  render() {
    const { children } = this.props;
    return children;
  }
}

const AboutPage: FunctionComponent = () => {
  const api = useStorybookApi();

  return (
    <NotificationClearer api={api} notificationId="update">
      <AboutScreen current={api.getCurrentVersion()} latest={api.getLatestVersion()} />
    </NotificationClearer>
  );
};

export { AboutPage };
