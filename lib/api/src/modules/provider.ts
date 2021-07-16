import { ReactNode } from 'react';
import { Channel } from '@storybook/channels';
import { ThemeVars } from '@storybook/theming';

import type { API, State, ModuleFn, Root, Group, Story } from '../index';
import type { StoryMapper, Refs } from './refs';
import type { UIOptions } from './layout';

interface SidebarOptions {
  showRoots?: boolean;
  collapsedRoots?: string[];
  renderLabel?: (item: Root | Group | Story) => ReactNode;
}

type IframeRenderer = (
  storyId: string,
  viewMode: State['viewMode'],
  id: string,
  baseUrl: string,
  scale: number,
  queryParams: Record<string, any>
) => ReactNode;

export interface Provider {
  channel?: Channel;
  renderPreview?: IframeRenderer;
  handleAPI(api: API): void;
  getConfig(): {
    sidebar?: SidebarOptions;
    theme?: ThemeVars;
    refs?: Refs;
    StoryMapper?: StoryMapper;
    [k: string]: any;
  } & Partial<UIOptions>;
  [key: string]: any;
}

export interface SubAPI {
  renderPreview?: Provider['renderPreview'];
}

export const init: ModuleFn = ({ provider, fullAPI }) => ({
  api: provider.renderPreview ? { renderPreview: provider.renderPreview } : {},
  init: () => {
    provider.handleAPI(fullAPI);
  },
});
