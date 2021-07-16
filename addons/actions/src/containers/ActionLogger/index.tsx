import React, { Component } from 'react';
import deepEqual from 'fast-deep-equal';

import { API } from '@storybook/api';
import { STORY_CHANGED } from '@storybook/core-events';

import { ActionLogger as ActionLoggerComponent } from '../../components/ActionLogger';
import { EVENT_ID } from '../..';
import { ActionDisplay } from '../../models';

interface ActionLoggerProps {
  active: boolean;
  api: API;
}

interface ActionLoggerState {
  actions: ActionDisplay[];
}

const safeDeepEqual = (a: any, b: any): boolean => {
  try {
    return deepEqual(a, b);
  } catch (e) {
    return false;
  }
};

export default class ActionLogger extends Component<ActionLoggerProps, ActionLoggerState> {
  private mounted: boolean;

  constructor(props: ActionLoggerProps) {
    super(props);

    this.state = { actions: [] };
  }

  componentDidMount() {
    this.mounted = true;
    const { api } = this.props;

    api.on(EVENT_ID, this.addAction);
    api.on(STORY_CHANGED, this.handleStoryChange);
  }

  componentWillUnmount() {
    this.mounted = false;
    const { api } = this.props;

    api.off(STORY_CHANGED, this.handleStoryChange);
    api.off(EVENT_ID, this.addAction);
  }

  handleStoryChange = () => {
    const { actions } = this.state;
    if (actions.length > 0 && actions[0].options.clearOnStoryChange) {
      this.clearActions();
    }
  };

  addAction = (action: ActionDisplay) => {
    this.setState((prevState: ActionLoggerState) => {
      const actions = [...prevState.actions];
      const previous = actions.length && actions[0];
      if (previous && safeDeepEqual(previous.data, action.data)) {
        // eslint-disable-next-line no-plusplus
        previous.count++;
      } else {
        // eslint-disable-next-line no-param-reassign
        action.count = 1;
        actions.unshift(action);
      }
      return { actions: actions.slice(0, action.options.limit) };
    });
  };

  clearActions = () => {
    this.setState({ actions: [] });
  };

  render() {
    const { actions = [] } = this.state;
    const { active } = this.props;
    const props = {
      actions,
      onClear: this.clearActions,
    };
    return active ? <ActionLoggerComponent {...props} /> : null;
  }
}
