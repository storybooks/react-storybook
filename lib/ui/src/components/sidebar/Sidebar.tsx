/* eslint-disable react/display-name */
import global from 'global';
import React, { FunctionComponent, useMemo } from 'react';

import { styled } from '@storybook/theming';
import { ScrollArea, Spaced } from '@storybook/components';
import type { StoriesHash, State } from '@storybook/api';

import { Heading } from './Heading';

import { DEFAULT_REF_ID, collapseAllStories, collapseDocsOnlyStories } from './data';
import { Explorer } from './Explorer';
import { Search } from './Search';
import { SearchResults } from './SearchResults';
import { Refs, CombinedDataset, Selection } from './types';
import { useLastViewed } from './useLastViewed';

const { DOCS_MODE } = global;

const Container = styled.nav({
  position: 'absolute',
  zIndex: 1,
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
  width: '100%',
  height: '100%',
});

const StyledSpaced = styled(Spaced)({
  paddingBottom: '2.5rem',
});

const CustomScrollArea = styled(ScrollArea)({
  '&&&&& .os-scrollbar-handle:before': {
    left: -12,
  },
  '&&&&& .os-scrollbar-vertical': {
    right: 5,
  },
  padding: 20,
});

const Swap = React.memo<{ children: React.ReactNode; condition: boolean }>(
  ({ children, condition }) => {
    const [a, b] = React.Children.toArray(children);
    return (
      <>
        <div style={{ display: condition ? 'block' : 'none' }}>{a}</div>
        <div style={{ display: condition ? 'none' : 'block' }}>{b}</div>
      </>
    );
  }
);

const useCombination = (
  stories: StoriesHash,
  ready: boolean,
  error: Error | undefined,
  refs: Refs
): CombinedDataset => {
  const hash = useMemo(
    () => ({
      [DEFAULT_REF_ID]: {
        stories,
        title: null,
        id: DEFAULT_REF_ID,
        url: 'iframe.html',
        ready,
        error,
      },
      ...refs,
    }),
    [error, ready, refs, stories]
  );
  return useMemo(() => ({ hash, entries: Object.entries(hash) }), [hash]);
};

export interface SidebarProps {
  stories: StoriesHash;
  storiesConfigured: boolean;
  storiesFailed?: Error;
  refs: State['refs'];
  menu: any[];
  storyId?: string;
  refId?: string;
  menuHighlighted?: boolean;
  enableShortcuts?: boolean;
}

export const Sidebar: FunctionComponent<SidebarProps> = React.memo(
  ({
    storyId = null,
    refId = DEFAULT_REF_ID,
    stories: storiesHash,
    storiesConfigured,
    storiesFailed,
    menu,
    menuHighlighted = false,
    enableShortcuts = true,
    refs = {},
  }) => {
    const selected: Selection = useMemo(() => storyId && { storyId, refId }, [storyId, refId]);
    const stories = useMemo(
      () => (DOCS_MODE ? collapseAllStories : collapseDocsOnlyStories)(storiesHash),
      [storiesHash]
    );
    const dataset = useCombination(stories, storiesConfigured, storiesFailed, refs);
    const isLoading = !dataset.hash[DEFAULT_REF_ID].ready;
    const lastViewedProps = useLastViewed(selected);

    return (
      <Container className="container sidebar-container">
        <CustomScrollArea vertical>
          <StyledSpaced row={1.6}>
            <Heading className="sidebar-header" menuHighlighted={menuHighlighted} menu={menu} />

            <Search
              dataset={dataset}
              isLoading={isLoading}
              enableShortcuts={enableShortcuts}
              {...lastViewedProps}
            >
              {({
                query,
                results,
                isBrowsing,
                closeMenu,
                getMenuProps,
                getItemProps,
                highlightedIndex,
              }) => (
                <Swap condition={isBrowsing}>
                  <Explorer
                    dataset={dataset}
                    selected={selected}
                    isLoading={isLoading}
                    isBrowsing={isBrowsing}
                  />
                  <SearchResults
                    query={query}
                    results={results}
                    closeMenu={closeMenu}
                    getMenuProps={getMenuProps}
                    getItemProps={getItemProps}
                    highlightedIndex={highlightedIndex}
                    enableShortcuts={enableShortcuts}
                    isLoading={isLoading}
                  />
                </Swap>
              )}
            </Search>
          </StyledSpaced>
        </CustomScrollArea>
      </Container>
    );
  }
);
