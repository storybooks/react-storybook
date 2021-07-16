import { useStorybookApi } from '@storybook/api';
import { styled } from '@storybook/theming';
import { Icons } from '@storybook/components';
import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import Fuse, { FuseOptions } from 'fuse.js';
import global from 'global';
import { transparentize } from 'polished';
import React, { useMemo, useRef, useState, useCallback } from 'react';

import { DEFAULT_REF_ID } from './data';
import {
  CombinedDataset,
  SearchItem,
  SearchResult,
  DownshiftItem,
  SearchChildrenFn,
  Selection,
  isSearchResult,
  isExpandType,
  isClearType,
  isCloseType,
} from './types';
import { searchItem } from './utils';

const { document } = global;

const DEFAULT_MAX_SEARCH_RESULTS = 50;

const options = {
  shouldSort: true,
  tokenize: true,
  findAllMatches: true,
  includeScore: true,
  includeMatches: true,
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'path', weight: 0.3 },
  ],
} as FuseOptions<SearchItem>;

const ScreenReaderLabel = styled.label({
  position: 'absolute',
  left: -10000,
  top: 'auto',
  width: 1,
  height: 1,
  overflow: 'hidden',
});

const SearchIcon = styled(Icons)(({ theme }) => ({
  width: 12,
  height: 12,
  position: 'absolute',
  top: 8,
  left: 10,
  zIndex: 1,
  pointerEvents: 'none',
  color: theme.textMutedColor,
}));

const SearchField = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '&:focus-within svg': {
    color: theme.color.defaultText,
  },
}));

const Input = styled.input(({ theme }) => ({
  appearance: 'none',
  height: 28,
  paddingLeft: 28,
  paddingRight: 28,
  border: `1px solid ${transparentize(0.6, theme.color.mediumdark)}`,
  background: 'transparent',
  borderRadius: 28,
  fontSize: `${theme.typography.size.s1}px`,
  fontFamily: 'inherit',
  transition: 'all 150ms',
  color: theme.color.defaultText,
  '&:focus, &:active': {
    outline: 0,
    borderColor: theme.color.secondary,
    background: theme.background.app,
  },
  '&::placeholder': {
    color: theme.textMutedColor,
  },
  '&:valid ~ code, &:focus ~ code': {
    display: 'none',
  },
  '&:invalid ~ svg': {
    display: 'none',
  },
  '&:valid ~ svg': {
    display: 'block',
  },
  '&::-ms-clear': {
    display: 'none',
  },
  '&::-webkit-search-decoration, &::-webkit-search-cancel-button, &::-webkit-search-results-button, &::-webkit-search-results-decoration': {
    display: 'none',
  },
}));

const FocusKey = styled.code(({ theme }) => ({
  position: 'absolute',
  top: 6,
  right: 12,
  width: 16,
  height: 16,
  zIndex: 1,
  lineHeight: '17px',
  textAlign: 'center',
  fontSize: '11px',
  background: 'rgba(0,0,0,0.1)',
  color: theme.textMutedColor,
  borderRadius: 2,
  userSelect: 'none',
  pointerEvents: 'none',
}));

const ClearIcon = styled(Icons)(({ theme }) => ({
  width: 16,
  height: 16,
  padding: 4,
  position: 'absolute',
  top: 6,
  right: 8,
  zIndex: 1,
  background: 'rgba(0,0,0,0.1)',
  borderRadius: 16,
  color: theme.color.defaultText,
  cursor: 'pointer',
}));

const FocusContainer = styled.div({ outline: 0 });

export const Search = React.memo<{
  children: SearchChildrenFn;
  dataset: CombinedDataset;
  isLoading?: boolean;
  enableShortcuts?: boolean;
  getLastViewed: () => Selection[];
  clearLastViewed: () => void;
  initialQuery?: string;
}>(
  ({
    children,
    dataset,
    isLoading = false,
    enableShortcuts = true,
    getLastViewed,
    clearLastViewed,
    initialQuery = '',
  }) => {
    const api = useStorybookApi();
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputPlaceholder, setPlaceholder] = useState('Find components');
    const [allComponents, showAllComponents] = useState(false);

    const selectStory = useCallback(
      (id: string, refId: string) => {
        if (api) api.selectStory(id, undefined, { ref: refId !== DEFAULT_REF_ID && refId });
        inputRef.current.blur();
        showAllComponents(false);
      },
      [api, inputRef, showAllComponents]
    );

    const list: SearchItem[] = useMemo(
      () =>
        dataset.entries.reduce((acc: SearchItem[], [refId, { stories }]) => {
          if (stories) {
            acc.push(
              ...Object.values(stories).map((item) => searchItem(item, dataset.hash[refId]))
            );
          }
          return acc;
        }, []),
      [dataset]
    );

    const fuse = useMemo(() => new Fuse(list, options), [list]);

    const getResults = useCallback(
      (input: string) => {
        if (!input) return [];

        let results: DownshiftItem[] = [];
        const resultIds: Set<string> = new Set();
        const distinctResults = (fuse.search(input) as SearchResult[]).filter(({ item }) => {
          if (!(item.isComponent || item.isLeaf) || resultIds.has(item.parent)) return false;
          resultIds.add(item.id);
          return true;
        });

        if (distinctResults.length) {
          results = distinctResults.slice(0, allComponents ? 1000 : DEFAULT_MAX_SEARCH_RESULTS);
          if (distinctResults.length > DEFAULT_MAX_SEARCH_RESULTS && !allComponents) {
            results.push({
              showAll: () => showAllComponents(true),
              totalCount: distinctResults.length,
              moreCount: distinctResults.length - DEFAULT_MAX_SEARCH_RESULTS,
            });
          }
        }

        return results;
      },
      [allComponents, fuse]
    );

    const stateReducer = useCallback(
      (state: DownshiftState<DownshiftItem>, changes: StateChangeOptions<DownshiftItem>) => {
        switch (changes.type) {
          case Downshift.stateChangeTypes.blurInput: {
            return {
              ...changes,
              // Prevent clearing the input on blur
              inputValue: state.inputValue,
              // Return to the tree view after selecting an item
              isOpen: state.inputValue && !state.selectedItem,
              selectedItem: null,
            };
          }

          case Downshift.stateChangeTypes.mouseUp: {
            // Prevent clearing the input on refocus
            return {};
          }

          case Downshift.stateChangeTypes.keyDownEscape: {
            if (state.inputValue) {
              // Clear the inputValue, but don't return to the tree view
              return { ...changes, inputValue: '', isOpen: true, selectedItem: null };
            }
            // When pressing escape a second time, blur the input and return to the tree view
            inputRef.current.blur();
            return { ...changes, isOpen: false, selectedItem: null };
          }

          case Downshift.stateChangeTypes.clickItem:
          case Downshift.stateChangeTypes.keyDownEnter: {
            if (isSearchResult(changes.selectedItem)) {
              const { id, refId } = changes.selectedItem.item;
              selectStory(id, refId);
              // Return to the tree view, but keep the input value
              return { ...changes, inputValue: state.inputValue, isOpen: false };
            }
            if (isExpandType(changes.selectedItem)) {
              changes.selectedItem.showAll();
              // Downshift should completely ignore this
              return {};
            }
            if (isClearType(changes.selectedItem)) {
              changes.selectedItem.clearLastViewed();
              inputRef.current.blur();
              // Nothing to see anymore, so return to the tree view
              return { isOpen: false };
            }
            if (isCloseType(changes.selectedItem)) {
              inputRef.current.blur();
              // Return to the tree view
              return { isOpen: false };
            }
            return changes;
          }

          case Downshift.stateChangeTypes.changeInput: {
            // Reset the "show more" state whenever the input changes
            showAllComponents(false);
            return changes;
          }

          default:
            return changes;
        }
      },
      [inputRef, selectStory, showAllComponents]
    );

    return (
      <Downshift<DownshiftItem>
        initialInputValue={initialQuery}
        stateReducer={stateReducer}
        // @ts-ignore
        itemToString={(result) => result?.item?.name || ''}
      >
        {({
          isOpen,
          openMenu,
          closeMenu,
          inputValue,
          clearSelection,
          getInputProps,
          getItemProps,
          getLabelProps,
          getMenuProps,
          getRootProps,
          highlightedIndex,
        }) => {
          const input = inputValue ? inputValue.trim() : '';
          let results: DownshiftItem[] = input ? getResults(input) : [];

          const lastViewed = !input && getLastViewed();
          if (lastViewed && lastViewed.length) {
            results = lastViewed.reduce((acc, { storyId, refId }) => {
              const data = dataset.hash[refId];
              if (data && data.stories && data.stories[storyId]) {
                const story = data.stories[storyId];
                const item =
                  story.isLeaf && !story.isComponent && !story.isRoot
                    ? data.stories[story.parent]
                    : story;
                // prevent duplicates
                if (!acc.some((res) => res.item.refId === refId && res.item.id === item.id)) {
                  acc.push({ item: searchItem(item, dataset.hash[refId]), matches: [], score: 0 });
                }
              }
              return acc;
            }, []);
            results.push({ closeMenu });
            if (results.length > 0) {
              results.push({ clearLastViewed });
            }
          }

          const inputProps = getInputProps({
            id: 'storybook-explorer-searchfield',
            ref: inputRef,
            required: true,
            type: 'search',
            placeholder: inputPlaceholder,
            onFocus: () => {
              openMenu();
              setPlaceholder('Type to find...');
            },
            onBlur: () => setPlaceholder('Find components'),
          });

          return (
            <>
              <ScreenReaderLabel {...getLabelProps()}>Search for components</ScreenReaderLabel>
              <SearchField
                {...getRootProps({ refKey: '' }, { suppressRefError: true })}
                className="search-field"
              >
                <SearchIcon icon="search" />
                <Input {...inputProps} />
                {enableShortcuts && <FocusKey>/</FocusKey>}
                <ClearIcon icon="cross" onClick={() => clearSelection()} />
              </SearchField>
              <FocusContainer tabIndex={0} id="storybook-explorer-menu">
                {children({
                  query: input,
                  results,
                  isBrowsing: !isOpen && document.activeElement !== inputRef.current,
                  closeMenu,
                  getMenuProps,
                  getItemProps,
                  highlightedIndex,
                })}
              </FocusContainer>
            </>
          );
        }}
      </Downshift>
    );
  }
);
