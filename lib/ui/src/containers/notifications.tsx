import React, { FunctionComponent } from 'react';

import { Consumer, Combo, useStorybookApi } from '@storybook/api';

import NotificationList from '../components/notifications/NotificationList';

export const mapper = ({ state }: Combo) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { clearNotification } = useStorybookApi();
  const { notifications } = state;

  return {
    notifications,
    clearNotification,
  };
};

const NotificationConnect: FunctionComponent<any> = (props) => (
  <Consumer filter={mapper}>
    {(fromState) => <NotificationList {...props} {...fromState} />}
  </Consumer>
);

export default NotificationConnect;
