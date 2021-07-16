import React, { FC, Context, createContext, useEffect, useState, useCallback } from 'react';
import deepEqual from 'fast-deep-equal';
import { addons } from '@storybook/addons';
import { StoryId } from '@storybook/api';
import { SNIPPET_RENDERED } from '../shared';

export type SourceItem = string;
export type StorySources = Record<StoryId, SourceItem>;

export interface SourceContextProps {
  sources: StorySources;
  setSource?: (id: StoryId, item: SourceItem) => void;
}

export const SourceContext: Context<SourceContextProps> = createContext({ sources: {} });

export const SourceContainer: FC = ({ children }) => {
  const [sources, setSources] = useState<StorySources>({});
  const channel = addons.getChannel();

  const sourcesRef = React.useRef<StorySources>();
  const handleSnippetRendered = useCallback(
    (id: StoryId, newItem: SourceItem) => {
      if (newItem !== sources[id]) {
        const newSources = { ...sourcesRef.current, [id]: newItem };
        sourcesRef.current = newSources;
      }
    },
    [sources]
  );

  // Bind this early (instead of inside `useEffect`), because the `SNIPPET_RENDERED` event
  // is triggered *during* the rendering process, not after. We have to use the ref
  // to ensure we don't end up calling setState outside the effect though.
  channel.on(SNIPPET_RENDERED, handleSnippetRendered);

  useEffect(() => {
    const current = sourcesRef.current || {};
    if (!deepEqual(sources, current)) {
      setSources(current);
    }

    return () => channel.off(SNIPPET_RENDERED, handleSnippetRendered);
  }, [sources, channel, handleSnippetRendered]);

  return <SourceContext.Provider value={{ sources }}>{children}</SourceContext.Provider>;
};
