import React, { createElement, ElementType, FunctionComponent, Fragment } from 'react';

import type { Parameters } from '@storybook/api';

import { IFrame } from './IFrame';
import { EmptyBlock } from './EmptyBlock';
import { ZoomContext } from './ZoomContext';

const BASE_URL = 'iframe.html';

export enum StoryError {
  NO_STORY = 'No component or story to display',
}

/** error message for Story with null storyFn
 * if the story id exists, it must be pointing to a non-existing story
 *  if there is assigned story id, the story must be empty
 */
const MISSING_STORY = (id?: string) => (id ? `Story "${id}" doesn't exist.` : StoryError.NO_STORY);

interface CommonProps {
  title: string;
  height?: string;
  id: string;
}

interface InlineStoryProps extends CommonProps {
  parameters: Parameters;
  storyFn: ElementType;
}

type IFrameStoryProps = CommonProps;

type StoryProps = InlineStoryProps | IFrameStoryProps;

const InlineStory: FunctionComponent<InlineStoryProps> = ({ storyFn, height, id }) => (
  <Fragment>
    {height ? (
      <style>{`#story--${id} { min-height: ${height}; transform: translateZ(0); overflow: auto }`}</style>
    ) : null}
    <Fragment>
      {storyFn ? createElement(storyFn) : <EmptyBlock>{MISSING_STORY(id)}</EmptyBlock>}
    </Fragment>
  </Fragment>
);

const IFrameStory: FunctionComponent<IFrameStoryProps> = ({ id, title, height = '500px' }) => (
  <div style={{ width: '100%', height }}>
    <ZoomContext.Consumer>
      {({ scale }) => (
        <IFrame
          key="iframe"
          id={`iframe--${id}`}
          title={title}
          src={`${BASE_URL}?id=${id}&viewMode=story`}
          allowFullScreen
          scale={scale}
          style={{
            width: '100%',
            height: '100%',
            border: '0 none',
          }}
        />
      )}
    </ZoomContext.Consumer>
  </div>
);

/**
 * A story element, either rendered inline or in an iframe,
 * with configurable height.
 */
const Story: FunctionComponent<StoryProps & { inline: boolean; error?: StoryError }> = ({
  children,
  error,
  inline,
  ...props
}) => {
  const { id, title, height } = props;

  if (error) {
    return <EmptyBlock>{error}</EmptyBlock>;
  }
  return inline ? (
    <InlineStory {...(props as InlineStoryProps)} />
  ) : (
    <IFrameStory id={id} title={title} height={height} />
  );
};

export { Story };
