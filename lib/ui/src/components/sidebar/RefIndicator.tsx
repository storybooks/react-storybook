/* eslint-disable react/display-name */
import global from 'global';
import React, { FunctionComponent, useMemo, ComponentProps, useCallback, forwardRef } from 'react';

import { Icons, WithTooltip, Spaced, TooltipLinkList } from '@storybook/components';
import { styled } from '@storybook/theming';
import { transparentize } from 'polished';
import { useStorybookApi } from '@storybook/api';

import { MenuItemIcon } from './Menu';
import { RefType } from './types';
import { getStateType } from './utils';

const { document, window: globalWindow } = global;

export type ClickHandler = ComponentProps<typeof TooltipLinkList>['links'][number]['onClick'];
export interface IndicatorIconProps {
  type: ReturnType<typeof getStateType>;
}
export interface CurrentVersionProps {
  url: string;
  versions: RefType['versions'];
}

const IndicatorPlacement = styled.aside(({ theme }) => ({
  height: 16,

  display: 'flex',
  alignItems: 'center',

  '& > * + *': {
    marginLeft: theme.layoutMargin,
  },
}));

const IndicatorClickTarget = styled.button(({ theme }) => ({
  height: 20,
  width: 20,
  padding: 0,
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  outline: 'none',
  border: '1px solid transparent',
  borderRadius: '100%',
  cursor: 'pointer',
  color:
    theme.base === 'light'
      ? transparentize(0.3, theme.color.defaultText)
      : transparentize(0.6, theme.color.defaultText),

  '&:hover': {
    color: theme.barSelectedColor,
  },
  '&:focus': {
    color: theme.barSelectedColor,
    borderColor: theme.color.secondary,
  },
  svg: {
    height: 10,
    width: 10,
    transition: 'all 150ms ease-out',
    color: 'inherit',
  },
}));

const MessageTitle = styled.span(({ theme }) => ({
  fontWeight: theme.typography.weight.bold,
}));

const Message = styled.a(({ theme }) => ({
  textDecoration: 'none',
  lineHeight: '16px',
  padding: 15,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  color: theme.color.defaultText,
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.appBorderColor}`,
  },
  '&:hover': {
    background: theme.background.hoverable,
    color: theme.color.darker,
  },
  '&:link': {
    color: theme.color.darker,
  },
  '&:active': {
    color: theme.color.darker,
  },
  '&:focus': {
    color: theme.color.darker,
  },
  '& > *': {
    flex: 1,
  },
  '& > svg': {
    marginTop: 3,
    width: 16,
    height: 16,
    marginRight: 10,
    flex: 'unset',
  },
}));

export const MessageWrapper = styled.div({
  width: 280,
  boxSizing: 'border-box',
  borderRadius: 8,
  overflow: 'hidden',
});

const BlueIcon = styled(Icons)(({ theme }) => ({
  color: theme.color.secondary,
}));

const YellowIcon = styled(Icons)(({ theme }) => ({
  color: theme.color.gold,
}));

const RedIcon = styled(Icons)(({ theme }) => ({
  color: theme.color.negative,
}));

const GreenIcon = styled(Icons)(({ theme }) => ({
  color: theme.color.green,
}));

const Version = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: theme.typography.size.s1,
  fontWeight: theme.typography.weight.regular,
  color:
    theme.base === 'light'
      ? transparentize(0.3, theme.color.defaultText)
      : transparentize(0.6, theme.color.defaultText),

  '& > * + *': {
    marginLeft: 4,
  },

  svg: {
    height: 10,
    width: 10,
  },
}));

const CurrentVersion: FunctionComponent<CurrentVersionProps> = ({ url, versions }) => {
  const currentVersionId = useMemo(() => {
    const c = Object.entries(versions).find(([k, v]) => v === url);
    return c && c[0] ? c[0] : 'current';
  }, [url, versions]);

  return (
    <Version>
      <span>{currentVersionId}</span>
      <Icons icon="chevrondown" />
    </Version>
  );
};

export const RefIndicator = React.memo(
  forwardRef<HTMLElement, RefType & { state: ReturnType<typeof getStateType> }>(
    ({ state, ...ref }, forwardedRef) => {
      const api = useStorybookApi();
      const list = useMemo(() => Object.values(ref.stories || {}), [ref.stories]);
      const componentCount = useMemo(() => list.filter((v) => v.isComponent).length, [list]);
      const leafCount = useMemo(() => list.filter((v) => v.isLeaf).length, [list]);

      const changeVersion = useCallback<ClickHandler>(
        (event, item) => {
          event.preventDefault();
          api.changeRefVersion(ref.id, item.href);
        },
        [api, ref.id]
      );

      return (
        <IndicatorPlacement ref={forwardedRef}>
          <WithTooltip
            placement="bottom-start"
            trigger="click"
            tooltip={
              <MessageWrapper>
                <Spaced row={0}>
                  {state === 'loading' && <LoadingMessage url={ref.url} />}
                  {(state === 'error' || state === 'empty') && (
                    <ErrorOccurredMessage url={ref.url} />
                  )}
                  {state === 'ready' && (
                    <ReadyMessage {...{ url: ref.url, componentCount, leafCount }} />
                  )}
                  {state === 'auth' && <LoginRequiredMessage {...ref} />}
                  {ref.type === 'auto-inject' && state !== 'error' && (
                    <PerformanceDegradedMessage />
                  )}
                  {state !== 'loading' && <ReadDocsMessage />}
                </Spaced>
              </MessageWrapper>
            }
          >
            <IndicatorClickTarget data-action="toggle-indicator" aria-label="toggle indicator">
              <Icons icon="globe" />
            </IndicatorClickTarget>
          </WithTooltip>

          {ref.versions && Object.keys(ref.versions).length ? (
            <WithTooltip
              placement="bottom-start"
              trigger="click"
              tooltip={
                <TooltipLinkList
                  links={Object.entries(ref.versions).map(([id, href]) => ({
                    left: href === ref.url ? <MenuItemIcon icon="check" /> : <span />,
                    id,
                    title: id,
                    href,
                    onClick: changeVersion,
                  }))}
                />
              }
            >
              <CurrentVersion url={ref.url} versions={ref.versions} />
            </WithTooltip>
          ) : null}
        </IndicatorPlacement>
      );
    }
  )
);

const ReadyMessage: FunctionComponent<{
  url: string;
  componentCount: number;
  leafCount: number;
}> = ({ url, componentCount, leafCount }) => (
  <Message href={url.replace(/\/?$/, '/index.html')} target="_blank">
    <BlueIcon icon="globe" />
    <div>
      <MessageTitle>View external Storybook</MessageTitle>
      <div>
        Explore {componentCount} components and {leafCount} stories in a new browser tab.
      </div>
    </div>
  </Message>
);

const LoginRequiredMessage: FunctionComponent<RefType> = ({ loginUrl, id }) => {
  const open = useCallback(
    (e) => {
      e.preventDefault();
      const childWindow = globalWindow.open(
        loginUrl,
        `storybook_auth_${id}`,
        'resizable,scrollbars'
      );

      // poll for window to close
      const timer = setInterval(() => {
        if (!childWindow) {
          clearInterval(timer);
        } else if (childWindow.closed) {
          clearInterval(timer);
          document.location.reload();
        }
      }, 1000);
    },
    [id, loginUrl]
  );

  return (
    <Message onClick={open}>
      <YellowIcon icon="lock" />
      <div>
        <MessageTitle>Log in required</MessageTitle>
        <div>You need to authenticate to view this Storybook's components.</div>
      </div>
    </Message>
  );
};

const ReadDocsMessage: FunctionComponent = () => (
  <Message href="https://storybook.js.org" target="_blank">
    <GreenIcon icon="document" />
    <div>
      <MessageTitle>Read Composition docs</MessageTitle>
      <div>Learn how to combine multiple Storybooks into one.</div>
    </div>
  </Message>
);

const ErrorOccurredMessage: FunctionComponent<{ url: string }> = ({ url }) => (
  <Message href={url.replace(/\/?$/, '/index.html')} target="_blank">
    <RedIcon icon="alert" />
    <div>
      <MessageTitle>Something went wrong</MessageTitle>
      <div>This external Storybook didn't load. Debug it in a new tab now.</div>
    </div>
  </Message>
);

const LoadingMessage: FunctionComponent<{ url: string }> = ({ url }) => (
  <Message href={url.replace(/\/?$/, '/index.html')} target="_blank">
    <BlueIcon icon="time" />
    <div>
      <MessageTitle>Please wait</MessageTitle>
      <div>This Storybook is loading.</div>
    </div>
  </Message>
);

const PerformanceDegradedMessage: FunctionComponent = () => (
  <Message href="https://storybook.js.org/docs" target="_blank">
    <YellowIcon icon="lightning" />
    <div>
      <MessageTitle>Reduce lag</MessageTitle>
      <div>Learn how to speed up Composition performance.</div>
    </div>
  </Message>
);
