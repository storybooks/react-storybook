/* eslint-disable react/display-name */
import { styled } from '@storybook/theming';
import { Icons } from '@storybook/components';
import global from 'global';
import React, {
  FunctionComponent,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import { ControllerStateAndHelpers } from 'downshift';
import { transparentize } from 'polished';

import { ComponentNode, DocumentNode, Path, RootNode, StoryNode } from './TreeNode';
import {
  Match,
  DownshiftItem,
  isCloseType,
  isClearType,
  isExpandType,
  SearchResult,
} from './types';
import { getLink } from './utils';
import { matchesKeyCode, matchesModifiers } from '../../keybinding';

const { document, DOCS_MODE } = global;

const ResultsList = styled.ol({
  listStyle: 'none',
  margin: 0,
  marginLeft: -20,
  marginRight: -20,
  padding: 0,
});

const ResultRow = styled.li<{ isHighlighted: boolean }>(({ theme, isHighlighted }) => ({
  display: 'block',
  margin: 0,
  padding: 0,
  background: isHighlighted ? transparentize(0.9, theme.color.secondary) : 'transparent',
  cursor: 'pointer',
  'a:hover, button:hover': {
    background: 'transparent',
  },
}));

const NoResults = styled.div(({ theme }) => ({
  marginTop: 20,
  textAlign: 'center',
  fontSize: `${theme.typography.size.s2 - 1}px`,
  lineHeight: `18px`,
  color: theme.color.defaultText,
  small: {
    color: theme.barTextColor,
    fontSize: `${theme.typography.size.s1}px`,
  },
}));

const Mark = styled.mark(({ theme }) => ({
  background: 'transparent',
  color: theme.color.secondary,
}));

const ActionRow = styled(ResultRow)({
  display: 'flex',
  padding: '6px 19px',
  alignItems: 'center',
});

const BackActionRow = styled(ActionRow)({
  marginTop: 8,
});

const ActionLabel = styled.span(({ theme }) => ({
  flexGrow: 1,
  color: theme.color.mediumdark,
  fontSize: `${theme.typography.size.s1}px`,
}));

const ActionIcon = styled(Icons)(({ theme }) => ({
  display: 'inline-block',
  width: 10,
  height: 10,
  marginRight: 6,
  color: theme.color.mediumdark,
}));

const ActionKey = styled.code(({ theme }) => ({
  minWidth: 16,
  height: 16,
  lineHeight: '17px',
  textAlign: 'center',
  fontSize: '11px',
  background: 'rgba(0,0,0,0.1)',
  color: theme.textMutedColor,
  borderRadius: 2,
  userSelect: 'none',
  pointerEvents: 'none',
}));

const Highlight: FunctionComponent<{ match?: Match }> = React.memo(({ children, match }) => {
  if (!match) return <>{children}</>;
  const { value, indices } = match;
  const { nodes: result } = indices.reduce<{ cursor: number; nodes: ReactNode[] }>(
    ({ cursor, nodes }, [start, end], index, { length }) => {
      /* eslint-disable react/no-array-index-key */
      nodes.push(<span key={`${index}-0`}>{value.slice(cursor, start)}</span>);
      nodes.push(<Mark key={`${index}-1`}>{value.slice(start, end + 1)}</Mark>);
      if (index === length - 1) {
        nodes.push(<span key={`${index}-2`}>{value.slice(end + 1)}</span>);
      }
      /* eslint-enable react/no-array-index-key */
      return { cursor: end + 1, nodes };
    },
    { cursor: 0, nodes: [] }
  );
  return <>{result}</>;
});

const Result: FunctionComponent<
  SearchResult & { icon: string; isHighlighted: boolean; onClick: MouseEventHandler }
> = React.memo(({ item, matches, icon, onClick, ...props }) => {
  const click: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      onClick(event);
    },
    [onClick]
  );

  const nameMatch = matches.find((match: Match) => match.key === 'name');
  const pathMatches = matches.filter((match: Match) => match.key === 'path');
  const label = (
    <div className="search-result-item--label">
      <strong>
        <Highlight match={nameMatch}>{item.name}</Highlight>
      </strong>
      <Path>
        {item.path.map((group, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={index}>
            <Highlight match={pathMatches.find((match: Match) => match.arrayIndex === index)}>
              {group}
            </Highlight>
          </span>
        ))}
      </Path>
    </div>
  );
  const title = `${item.path.join(' / ')} / ${item.name}`;

  if (DOCS_MODE) {
    return (
      <ResultRow {...props}>
        <DocumentNode depth={0} onClick={click} href={getLink(item.id, item.refId)} title={title}>
          {label}
        </DocumentNode>
      </ResultRow>
    );
  }

  const TreeNode = item.isComponent ? ComponentNode : StoryNode;
  return (
    <ResultRow {...props}>
      <TreeNode isExpanded={false} depth={0} onClick={onClick} title={title}>
        {label}
      </TreeNode>
    </ResultRow>
  );
});

export const SearchResults: FunctionComponent<{
  query: string;
  results: DownshiftItem[];
  closeMenu: (cb?: () => void) => void;
  getMenuProps: ControllerStateAndHelpers<DownshiftItem>['getMenuProps'];
  getItemProps: ControllerStateAndHelpers<DownshiftItem>['getItemProps'];
  highlightedIndex: number | null;
  isLoading?: boolean;
  enableShortcuts?: boolean;
}> = React.memo(
  ({
    query,
    results,
    closeMenu,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    isLoading = false,
    enableShortcuts = true,
  }) => {
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (!enableShortcuts || isLoading || event.repeat) return;
        if (matchesModifiers(false, event) && matchesKeyCode('Escape', event)) {
          const target = event.target as Element;
          if (target?.id === 'storybook-explorer-searchfield') return; // handled by downshift
          event.preventDefault();
          closeMenu();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [enableShortcuts, isLoading]);

    return (
      <ResultsList {...getMenuProps()}>
        {results.length > 0 && !query && (
          <li>
            <RootNode className="search-result-recentlyOpened">Recently opened</RootNode>
          </li>
        )}
        {results.length === 0 && query && (
          <li>
            <NoResults>
              <strong>No components found</strong>
              <br />
              <small>Find components by name or path.</small>
            </NoResults>
          </li>
        )}
        {results.map((result: DownshiftItem, index) => {
          if (isCloseType(result)) {
            return (
              <BackActionRow
                {...result}
                {...getItemProps({ key: index, index, item: result })}
                isHighlighted={highlightedIndex === index}
                className="search-result-back"
              >
                <ActionIcon icon="arrowleft" />
                <ActionLabel>Back to components</ActionLabel>
                <ActionKey>ESC</ActionKey>
              </BackActionRow>
            );
          }
          if (isClearType(result)) {
            return (
              <ActionRow
                {...result}
                {...getItemProps({ key: index, index, item: result })}
                isHighlighted={highlightedIndex === index}
                className="search-result-clearHistory"
              >
                <ActionIcon icon="trash" />
                <ActionLabel>Clear history</ActionLabel>
              </ActionRow>
            );
          }
          if (isExpandType(result)) {
            return (
              <ActionRow
                {...result}
                {...getItemProps({ key: index, index, item: result })}
                isHighlighted={highlightedIndex === index}
                className="search-result-more"
              >
                <ActionIcon icon="plus" />
                <ActionLabel>Show {result.moreCount} more results</ActionLabel>
              </ActionRow>
            );
          }

          const { item } = result;
          const key = `${item.refId}::${item.id}`;
          return (
            <Result
              key={key}
              {...result}
              {...getItemProps({ key, index, item: result })}
              isHighlighted={highlightedIndex === index}
              className="search-result-item"
            />
          );
        })}
      </ResultsList>
    );
  }
);
