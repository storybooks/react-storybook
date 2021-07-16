/* eslint-disable react/display-name */
import React, { Fragment, useMemo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';

import { API, Consumer, Combo, merge } from '@storybook/api';
import { SET_CURRENT_STORY } from '@storybook/core-events';
import { addons, types, Addon } from '@storybook/addons';

import { Loader } from '@storybook/components';
import { Location } from '@storybook/router';

import * as S from './utils/components';
import { ZoomProvider, ZoomConsumer } from './tools/zoom';
import { defaultWrappers, ApplyWrappers } from './wrappers';
import { ToolbarComp } from './toolbar';
import { FramesRenderer } from './FramesRenderer';

import { PreviewProps } from './utils/types';

const getWrappers = (getFn: API['getElements']) => Object.values(getFn<Addon>(types.PREVIEW));
const getTabs = (getFn: API['getElements']) => Object.values(getFn<Addon>(types.TAB));

const canvasMapper = ({ state, api }: Combo) => ({
  storyId: state.storyId,
  refId: state.refId,
  viewMode: state.viewMode,
  customCanvas: api.renderPreview,
  queryParams: state.customQueryParams,
  getElements: api.getElements,
  story: api.getData(state.storyId, state.refId),
  storiesConfigured: state.storiesConfigured,
  storiesFailed: state.storiesFailed,
  refs: state.refs,
  active: !!(state.viewMode && state.viewMode.match(/^(story|docs)$/)),
});

const createCanvas = (id: string, baseUrl = 'iframe.html', withLoader = true): Addon => ({
  id: 'canvas',
  title: 'Canvas',
  route: ({ storyId, refId }) => (refId ? `/story/${refId}_${storyId}` : `/story/${storyId}`),
  match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
  render: () => (
    <Consumer filter={canvasMapper}>
      {({
        story,
        refs,
        customCanvas,
        storyId,
        refId,
        viewMode,
        queryParams,
        getElements,
        storiesConfigured,
        storiesFailed,
        active,
      }) => {
        const wrappers = useMemo(() => [...defaultWrappers, ...getWrappers(getElements)], [
          getElements,
          ...defaultWrappers,
        ]);

        const isLoading = story
          ? !!refs[refId] && !refs[refId].ready
          : !storiesFailed && !storiesConfigured;

        return (
          <ZoomConsumer>
            {({ value: scale }) => (
              <>
                {withLoader && isLoading && (
                  <S.LoaderWrapper>
                    <Loader id="preview-loader" role="progressbar" />
                  </S.LoaderWrapper>
                )}
                <ApplyWrappers
                  id={id}
                  storyId={storyId}
                  viewMode={viewMode}
                  active={active}
                  wrappers={wrappers}
                >
                  {customCanvas ? (
                    customCanvas(storyId, viewMode, id, baseUrl, scale, queryParams)
                  ) : (
                    <FramesRenderer
                      baseUrl={baseUrl}
                      refs={refs}
                      scale={scale}
                      story={story}
                      viewMode={viewMode}
                      refId={refId}
                      queryParams={queryParams}
                      storyId={storyId}
                    />
                  )}
                </ApplyWrappers>
              </>
            )}
          </ZoomConsumer>
        );
      }}
    </Consumer>
  ),
});

const useTabs = (
  id: PreviewProps['id'],
  baseUrl: PreviewProps['baseUrl'],
  withLoader: PreviewProps['withLoader'],
  getElements: API['getElements'],
  story: PreviewProps['story']
) => {
  const canvas = useMemo(() => createCanvas(id, baseUrl, withLoader), [id, baseUrl, withLoader]);

  const tabsFromConfig = useMemo(() => getTabs(getElements), [getElements]);

  return useMemo(() => {
    if (story?.parameters) {
      return filterTabs([canvas, ...tabsFromConfig], story.parameters);
    }

    return [canvas, ...tabsFromConfig];
  }, [story?.parameters, canvas, tabsFromConfig]);
};

const Preview = React.memo<PreviewProps>((props) => {
  const {
    api,
    id: previewId,
    options,
    viewMode,
    storyId,
    story = undefined,
    description,
    baseUrl,
    withLoader = true,
  } = props;
  const { getElements } = api;

  const tabs = useTabs(previewId, baseUrl, withLoader, getElements, story);

  const shouldScale = viewMode === 'story';
  const { isToolshown } = options;

  const previousStoryId = useRef(storyId);
  const previousViewMode = useRef(viewMode);

  useEffect(() => {
    if (story && viewMode) {
      // Don't emit the event on first ("real") render, only when story or mode changes
      if (storyId !== previousStoryId.current || viewMode !== previousViewMode.current) {
        previousStoryId.current = storyId;
        previousViewMode.current = viewMode;

        if (viewMode.match(/docs|story/)) {
          const { refId, id } = story;
          api.emit(SET_CURRENT_STORY, {
            storyId: id,
            viewMode,
            options: {
              target: refId ? `storybook-ref-${refId}` : 'storybook-preview-iframe',
            },
          });
        }
      }
    }
  }, [api, story, storyId, viewMode]);

  return (
    <Fragment>
      {previewId === 'main' && (
        <Helmet key="description">
          <title>{description}</title>
        </Helmet>
      )}
      <ZoomProvider shouldScale={shouldScale}>
        <ToolbarComp key="tools" story={story} api={api} isShown={isToolshown} tabs={tabs} />
        <S.FrameWrap key="frame" offset={isToolshown ? 40 : 0}>
          {tabs.map(({ render: Render, match, ...t }, i) => {
            // @ts-ignore
            const key = t.id || t.key || i;
            return (
              <Fragment key={key}>
                <Location>{(lp) => <Render active={match(lp)} />}</Location>
              </Fragment>
            );
          })}
        </S.FrameWrap>
      </ZoomProvider>
    </Fragment>
  );
});

export { Preview };

function filterTabs(panels: Addon[], parameters: Record<string, any>) {
  const { previewTabs } = addons.getConfig();
  const parametersTabs = parameters ? parameters.previewTabs : undefined;

  if (previewTabs || parametersTabs) {
    // deep merge global and local settings
    const tabs = merge(previewTabs, parametersTabs);
    const arrTabs = Object.keys(tabs).map((key, index) => ({
      index,
      ...(typeof tabs[key] === 'string' ? { title: tabs[key] } : tabs[key]),
      id: key,
    }));
    return panels
      .filter((panel) => {
        const t = arrTabs.find((tab) => tab.id === panel.id);
        return t === undefined || t.id === 'canvas' || !t.hidden;
      })
      .map((panel, index) => ({ ...panel, index } as Addon))
      .sort((p1, p2) => {
        const tab1 = arrTabs.find((tab) => tab.id === p1.id);
        // @ts-ignore
        const index1 = tab1 ? tab1.index : arrTabs.length + p1.index;
        const tab2 = arrTabs.find((tab) => tab.id === p2.id);
        // @ts-ignore
        const index2 = tab2 ? tab2.index : arrTabs.length + p2.index;
        return index1 - index2;
      })
      .map((panel) => {
        const t = arrTabs.find((tab) => tab.id === panel.id);
        if (t) {
          return {
            ...panel,
            title: t.title || panel.title,
            disabled: t.disabled,
            hidden: t.hidden,
          } as Addon;
        }
        return panel;
      });
  }
  return panels;
}
