import React, { FC, ReactElement, ReactNode, ReactNodeArray, useContext } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { toId, storyNameFromExport } from '@storybook/csf';
import {
  resetComponents,
  Preview as PurePreview,
  PreviewProps as PurePreviewProps,
} from '@storybook/components';
import { DocsContext, DocsContextProps } from './DocsContext';
import { SourceContext, SourceContextProps } from './SourceContainer';
import { getSourceProps, SourceState } from './Source';

type CanvasProps = PurePreviewProps & {
  withSource?: SourceState;
  mdxSource?: string;
};

const getPreviewProps = (
  { withSource, mdxSource, children, ...props }: CanvasProps & { children?: ReactNode },
  docsContext: DocsContextProps,
  sourceContext: SourceContextProps
): PurePreviewProps => {
  const { mdxComponentMeta, mdxStoryNameToKey } = docsContext;
  let sourceState = withSource;
  if (sourceState === SourceState.NONE) {
    return props;
  }
  if (mdxSource) {
    return {
      ...props,
      withSource: getSourceProps({ code: decodeURI(mdxSource) }, docsContext, sourceContext),
    };
  }
  const childArray: ReactNodeArray = Array.isArray(children) ? children : [children];
  const stories = childArray.filter(
    (c: ReactElement) => c.props && (c.props.id || c.props.name)
  ) as ReactElement[];
  const targetIds = stories.map(
    (s) =>
      s.props.id ||
      toId(
        mdxComponentMeta.id || mdxComponentMeta.title,
        storyNameFromExport(mdxStoryNameToKey[s.props.name])
      )
  );
  const sourceProps = getSourceProps({ ids: targetIds }, docsContext, sourceContext);
  if (!sourceState) sourceState = sourceProps.state;

  return {
    ...props, // pass through columns etc.
    withSource: sourceProps,
    isExpanded: sourceState === SourceState.OPEN,
  };
};

export const Canvas: FC<CanvasProps> = (props) => {
  const docsContext = useContext(DocsContext);
  const sourceContext = useContext(SourceContext);
  const previewProps = getPreviewProps(props, docsContext, sourceContext);
  const { children } = props;
  return (
    <MDXProvider components={resetComponents}>
      <PurePreview {...previewProps}>{children}</PurePreview>
    </MDXProvider>
  );
};
