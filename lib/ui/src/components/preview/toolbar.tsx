/* eslint-disable react/display-name */
import React, { Fragment, useMemo, FunctionComponent } from 'react';

import { styled } from '@storybook/theming';

import { FlexBar, IconButton, Icons, Separator, TabButton, TabBar } from '@storybook/components';
import { Consumer, Combo, API, Story, Group, State, merge } from '@storybook/api';
import { shortcutToHumanString } from '@storybook/api/shortcut';
import { addons, Addon, types } from '@storybook/addons';

import { Location, RenderData } from '@storybook/router';
import { zoomTool } from './tools/zoom';

import * as S from './utils/components';

import { PreviewProps } from './utils/types';
import { copyTool } from './tools/copy';
import { ejectTool } from './tools/eject';
import { menuTool } from './tools/menu';

export const getTools = (getFn: API['getElements']) => Object.values(getFn<Addon>(types.TOOL));

export const getToolsExtra = (getFn: API['getElements']) =>
  Object.values(getFn<Addon>(types.TOOLEXTRA));

const Bar: FunctionComponent<{ shown: boolean } & Record<string, any>> = ({ shown, ...props }) => (
  <FlexBar {...props} />
);

export const Toolbar = styled(Bar)(
  {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    transition: 'transform .2s linear',
  },
  ({ shown }) => ({
    transform: shown ? 'translateY(0px)' : 'translateY(-40px)',
  })
);

const fullScreenMapper = ({ api, state }: Combo) => ({
  toggle: api.toggleFullscreen,
  value: state.layout.isFullscreen,
  shortcut: shortcutToHumanString(api.getShortcutKeys().fullScreen),
});

export const fullScreenTool: Addon = {
  title: 'fullscreen',
  id: 'fullscreen',
  match: (p) => ['story', 'docs'].includes(p.viewMode),
  render: () => (
    <Consumer filter={fullScreenMapper}>
      {({ toggle, value, shortcut }) => (
        <S.DesktopOnly>
          <IconButton
            key="full"
            onClick={toggle as any}
            title={`${value ? 'Exit full screen' : 'Go full screen'} [${shortcut}]`}
          >
            <Icons icon={value ? 'close' : 'expand'} />
          </IconButton>
        </S.DesktopOnly>
      )}
    </Consumer>
  ),
};

const tabsMapper = ({ state }: Combo) => ({
  viewMode: state.docsOnly,
  storyId: state.storyId,
  path: state.path,
  location: state.location,
  refId: state.refId,
});

export const createTabsTool = (tabs: Addon[]): Addon => ({
  title: 'title',
  id: 'title',
  render: () => (
    <Consumer filter={tabsMapper}>
      {(rp) => (
        <Fragment>
          <TabBar key="tabs">
            {tabs
              .filter((p) => !p.hidden)
              .map((t, index) => {
                const to = t.route(rp);
                const isActive = rp.path === to;
                return (
                  <S.UnstyledLink key={t.id || `l${index}`} to={to}>
                    <TabButton disabled={t.disabled} active={isActive}>
                      {t.title}
                    </TabButton>
                  </S.UnstyledLink>
                );
              })}
          </TabBar>
          <Separator />
        </Fragment>
      )}
    </Consumer>
  ),
});

export const defaultTools: Addon[] = [zoomTool];
export const defaultToolsExtra: Addon[] = [fullScreenTool, ejectTool, copyTool];

const useTools = (
  getElements: API['getElements'],
  tabs: Addon[],
  viewMode: PreviewProps['viewMode'],
  story: PreviewProps['story'],
  location: PreviewProps['location'],
  path: PreviewProps['path']
) => {
  const toolsFromConfig = useMemo(() => getTools(getElements), [getElements]);
  const toolsExtraFromConfig = useMemo(() => getToolsExtra(getElements), [getElements]);

  const tools = useMemo(() => [...defaultTools, ...toolsFromConfig], [toolsFromConfig]);
  const toolsExtra = useMemo(() => [...defaultToolsExtra, ...toolsExtraFromConfig], [
    toolsExtraFromConfig,
  ]);

  return useMemo(
    () =>
      story && story.parameters
        ? filterTools(tools, toolsExtra, tabs, { viewMode, story, location, path })
        : { left: tools, right: toolsExtra },
    [viewMode, story, location, path, tools, toolsExtra, tabs]
  );
};

export interface ToolData {
  isShown: boolean;
  tabs: Addon[];
  api: API;
  story: Story | Group;
}

export const ToolRes: FunctionComponent<ToolData & RenderData> = React.memo<ToolData & RenderData>(
  ({ api, story, tabs, isShown, location, path, viewMode }) => {
    const { left, right } = useTools(api.getElements, tabs, viewMode, story, location, path);

    return left || right ? (
      <Toolbar key="toolbar" shown={isShown} border>
        <Tools key="left" list={left} />
        <Tools key="right" list={right} />
      </Toolbar>
    ) : null;
  }
);

export const ToolbarComp = React.memo<ToolData>((props) => (
  <Location>
    {({ location, path, viewMode }) => <ToolRes {...props} {...{ location, path, viewMode }} />}
  </Location>
));

export const Tools = React.memo<{ list: Addon[] }>(({ list }) => (
  <>
    {list.filter(Boolean).map(({ render: Render, id, ...t }, index) => (
      // @ts-ignore
      <Render key={id || t.key || `f-${index}`} />
    ))}
  </>
));

function toolbarItemHasBeenExcluded(item: Partial<Addon>, story: PreviewProps['story']) {
  const toolbarItemsFromStoryParameters =
    'toolbar' in story.parameters ? story.parameters.toolbar : undefined;
  const { toolbar: toolbarItemsFromAddonsConfig } = addons.getConfig();

  const toolbarItems = merge(toolbarItemsFromAddonsConfig, toolbarItemsFromStoryParameters);

  return toolbarItems ? !!toolbarItems[item.id]?.hidden : false;
}

export function filterTools(
  tools: Addon[],
  toolsExtra: Addon[],
  tabs: Addon[],
  {
    viewMode,
    story,
    location,
    path,
  }: {
    viewMode: State['viewMode'];
    story: PreviewProps['story'];
    location: State['location'];
    path: State['path'];
  }
) {
  const toolsLeft = [
    menuTool,
    tabs.filter((p) => !p.hidden).length >= 1 && createTabsTool(tabs),
    ...tools,
  ];
  const toolsRight = [...toolsExtra];

  const filter = (item: Partial<Addon>) =>
    item &&
    (!item.match ||
      item.match({
        storyId: story.id,
        refId: story.refId,
        viewMode,
        location,
        path,
      })) &&
    !toolbarItemHasBeenExcluded(item, story);

  const left = toolsLeft.filter(filter);
  const right = toolsRight.filter(filter);

  return { left, right };
}
