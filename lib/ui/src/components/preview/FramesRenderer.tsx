import React, { Fragment, FunctionComponent, useMemo, useEffect, useState } from 'react';
import { Global, CSSObject } from '@storybook/theming';
import { IFrame } from './iframe';
import { FramesRendererProps } from './utils/types';
import { stringifyQueryParams } from './utils/stringifyQueryParams';

const getActive = (refId: FramesRendererProps['refId']) => {
  if (refId) {
    return `storybook-ref-${refId}`;
  }

  return 'storybook-preview-iframe';
};

export const FramesRenderer: FunctionComponent<FramesRendererProps> = ({
  refs,
  story,
  scale,
  viewMode = 'story',
  refId,
  queryParams = {},
  baseUrl,
  storyId = '*',
}) => {
  const version = refs[refId]?.version;
  const stringifiedQueryParams = stringifyQueryParams({
    ...queryParams,
    ...(version && { version }),
  });
  const active = getActive(refId);

  const styles = useMemo<CSSObject>(
    () => ({
      '[data-is-storybook="false"]': {
        visibility: 'hidden',
      },
      '[data-is-storybook="true"]': {
        visibility: 'visible',
      },
    }),
    []
  );

  const [frames, setFrames] = useState<Record<string, string>>({
    'storybook-preview-iframe': `${baseUrl}?id=${storyId}&viewMode=${viewMode}${stringifiedQueryParams}`,
  });

  useEffect(() => {
    const newFrames = Object.values(refs)
      .filter((r) => {
        if (r.error) {
          return false;
        }
        if (r.type === 'auto-inject') {
          return true;
        }
        if (story && r.id === story.refId) {
          return true;
        }

        return false;
      })
      .reduce(
        (acc, r) => ({
          ...acc,
          [`storybook-ref-${r.id}`]: `${r.url}/iframe.html?id=${storyId}&viewMode=${viewMode}&refId=${r.id}${stringifiedQueryParams}`,
        }),
        frames
      );

    setFrames(newFrames);
  }, [storyId, story, refs, frames, viewMode, stringifiedQueryParams]);

  return (
    <Fragment>
      <Global styles={styles} />
      {Object.entries(frames).map(([id, src]) => (
        <Fragment key={id}>
          <IFrame
            active={id === active}
            key={refs[id] ? refs[id].url : id}
            id={id}
            title={id}
            src={src}
            allowFullScreen
            scale={scale}
          />
        </Fragment>
      ))}
    </Fragment>
  );
};
