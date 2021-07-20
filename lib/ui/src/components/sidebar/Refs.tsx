import React, {
  FunctionComponent,
  useMemo,
  useState,
  useRef,
  useCallback,
  MutableRefObject,
} from 'react';
import { useStorybookApi } from '@storybook/api';
import { styled } from '@storybook/theming';
import { transparentize } from 'polished';

import { AuthBlock, ErrorBlock, LoaderBlock, EmptyBlock } from './RefBlocks';
import { RefIndicator } from './RefIndicator';
import { Tree } from './Tree';
import { CollapseIcon } from './TreeNode';
import { DEFAULT_REF_ID } from './data';
import { Highlight, RefType } from './types';
import { getStateType } from './utils';

export interface RefProps {
  isLoading: boolean;
  isBrowsing: boolean;
  selectedStoryId: string | null;
  highlightedRef: MutableRefObject<Highlight>;
  setHighlighted: (highlight: Highlight) => void;
}

const Wrapper = styled.div<{ isMain: boolean }>(({ isMain }) => ({
  position: 'relative',
  marginLeft: -20,
  marginRight: -20,
  marginTop: isMain ? undefined : 0,
}));

const RefHead = styled.div(({ theme }) => ({
  fontWeight: theme.typography.weight.black,
  fontSize: theme.typography.size.s2 - 1,

  // Similar to ListItem.tsx
  textDecoration: 'none',
  lineHeight: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'transparent',

  width: '100%',
  marginTop: 20,
  paddingTop: 16,
  borderTop: `1px solid ${theme.appBorderColor}`,

  color:
    theme.base === 'light' ? theme.color.defaultText : transparentize(0.2, theme.color.defaultText),
}));

const RefTitle = styled.span(({ theme }) => ({
  display: 'block',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
  overflow: 'hidden',
  marginLeft: 2,
}));

const CollapseButton = styled.button(({ theme }) => ({
  // Reset button
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: 26,
  outline: 'none',
  boxSizing: 'content-box',
  cursor: 'pointer',
  position: 'relative',
  textAlign: 'left',
  lineHeight: 'normal',
  font: 'inherit',
  color: 'inherit',

  display: 'flex',
  padding: 3,
  paddingLeft: 1,
  paddingRight: 12,
  margin: 0,
  marginLeft: -20,
  overflow: 'hidden',

  'span:first-of-type': {
    marginTop: 5,
  },

  '&:focus': {
    borderColor: theme.color.secondary,
    'span:first-of-type': {
      borderLeftColor: theme.color.secondary,
    },
  },
}));

export const Ref: FunctionComponent<RefType & RefProps> = React.memo((props) => {
  const api = useStorybookApi();
  const {
    stories,
    id: refId,
    title = refId,
    isLoading: isLoadingMain,
    isBrowsing,
    selectedStoryId,
    highlightedRef,
    setHighlighted,
    loginUrl,
    type,
    expanded = true,
    ready,
    error,
  } = props;
  const length = useMemo(() => (stories ? Object.keys(stories).length : 0), [stories]);
  const indicatorRef = useRef<HTMLElement>(null);

  const isMain = refId === DEFAULT_REF_ID;
  const isLoadingInjected = type === 'auto-inject' && !ready;
  const isLoading = isLoadingMain || isLoadingInjected || type === 'unknown';
  const isError = !!error;
  const isEmpty = !isLoading && length === 0;
  const isAuthRequired = !!loginUrl && length === 0;

  const state = getStateType(isLoading, isAuthRequired, isError, isEmpty);
  const [isExpanded, setExpanded] = useState<boolean>(expanded);
  const handleClick = useCallback(() => setExpanded((value) => !value), [setExpanded]);

  const setHighlightedItemId = useCallback((itemId: string) => setHighlighted({ itemId, refId }), [
    setHighlighted,
  ]);

  const onSelectStoryId = useCallback(
    (storyId: string) => api && api.selectStory(storyId, undefined, { ref: !isMain && refId }),
    [api, isMain, refId]
  );
  return (
    <>
      {isMain || (
        <RefHead
          aria-label={`${isExpanded ? 'Hide' : 'Show'} ${title} stories`}
          aria-expanded={isExpanded}
        >
          <CollapseButton data-action="collapse-ref" onClick={handleClick}>
            <CollapseIcon isExpanded={isExpanded} />
            <RefTitle title={title}>{title}</RefTitle>
          </CollapseButton>
          <RefIndicator {...props} state={state} ref={indicatorRef} />
        </RefHead>
      )}
      {isExpanded && (
        <Wrapper data-title={title} isMain={isMain}>
          {state === 'auth' && <AuthBlock id={refId} loginUrl={loginUrl} />}
          {state === 'error' && <ErrorBlock error={error} />}
          {state === 'loading' && <LoaderBlock isMain={isMain} />}
          {state === 'empty' && <EmptyBlock isMain={isMain} />}
          {state === 'ready' && (
            <Tree
              isBrowsing={isBrowsing}
              isMain={isMain}
              refId={refId}
              data={stories}
              selectedStoryId={selectedStoryId}
              onSelectStoryId={onSelectStoryId}
              highlightedRef={highlightedRef}
              setHighlightedItemId={setHighlightedItemId}
            />
          )}
        </Wrapper>
      )}
    </>
  );
});
