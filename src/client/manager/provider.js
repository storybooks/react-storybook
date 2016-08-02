import Preview from './preview';
import qs from 'qs';
import UUID from 'uuid';
import React from 'react';
import createPageBus from 'page-bus';
import { Provider } from '@kadira/storybook-ui';
import addons from '@kadira/storybook-addons';
import Channel from '../channel';

export default class ReactProvider extends Provider {
  constructor() {
    super();
    this.channel = new Channel();
    addons.setChannel(this.channel);
  }

  getPanels() {
    return addons.getPanels();
  }

  renderPreview(selectedKind, selectedStory) {
    const queryParams = {
      dataId: this.channel.getDataId(),
      selectedKind,
      selectedStory,
    };

    const queryString = qs.stringify(queryParams);
    const url = `iframe.html?${queryString}`;
    return (
      <Preview url={url} />
    );
  }

  handleAPI(api) {
    api.onStory((kind, story) => {
      this.channel.emit('setCurrentStory', { kind, story });
    });
    this.channel.on('setStories', data => {
      api.setStories(data.stories);
    });
    this.channel.on('selectStory', data => {
      api.selectStory(data.kind, data.story);
    });
    this.channel.on('applyShortcut', data => {
      api.handleShortcut(data.event);
    });
    addons.loadAddons(api);
  }
}
