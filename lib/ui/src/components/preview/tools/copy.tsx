import global from 'global';
import React from 'react';
import copy from 'copy-to-clipboard';
import { IconButton, Icons } from '@storybook/components';
import { Consumer, Combo } from '@storybook/api';
import { Addon } from '@storybook/addons';
import { stringifyQueryParams } from '../utils/stringifyQueryParams';

const { PREVIEW_URL } = global;

const copyMapper = ({ state }: Combo) => {
  const { storyId, location } = state;
  const originUrl = location.origin;

  return {
    baseUrl: originUrl ? `${originUrl}/iframe.html` : (PREVIEW_URL as string) || 'iframe.html',
    storyId,
    queryParams: state.customQueryParams,
  };
};

export const copyTool: Addon = {
  title: 'copy',
  id: 'copy',
  match: ({ viewMode }) => viewMode === 'story',
  render: () => (
    <Consumer filter={copyMapper}>
      {({ baseUrl, storyId, queryParams }) =>
        storyId ? (
          <IconButton
            key="copy"
            onClick={() => copy(`${baseUrl}?id=${storyId}${stringifyQueryParams(queryParams)}`)}
            title="Copy canvas link"
          >
            <Icons icon="link" />
          </IconButton>
        ) : null
      }
    </Consumer>
  ),
};
