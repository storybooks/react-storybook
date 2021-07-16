/* eslint-disable react/display-name */
import React, { Fragment, FunctionComponent } from 'react';
import { ApplyWrappersProps, Wrapper } from './utils/types';
import { IframeWrapper } from './utils/components';

export const ApplyWrappers: FunctionComponent<ApplyWrappersProps> = ({
  wrappers,
  id,
  storyId,
  active,
  children,
}) => (
  <Fragment>
    {wrappers.reduceRight(
      (acc, wrapper, index) => wrapper.render({ index, children: acc, id, storyId, active }),
      children
    )}
  </Fragment>
);

export const defaultWrappers = [
  {
    render: ({ children, active }) => (
      <IframeWrapper id="storybook-preview-wrapper" hidden={!active}>
        {children}
      </IframeWrapper>
    ),
  } as Wrapper,
];
