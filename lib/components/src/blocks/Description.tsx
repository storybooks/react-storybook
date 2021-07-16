import React, { FunctionComponent } from 'react';
import Markdown from 'markdown-to-jsx';
import { ResetWrapper } from '../typography/DocumentFormatting';
// eslint-disable-next-line import/no-cycle
import { components } from '..';

export interface DescriptionProps {
  markdown: string;
}

/**
 * A markdown description for a component, typically used to show the
 * components docgen docs.
 */
export const Description: FunctionComponent<DescriptionProps> = ({ markdown }) => (
  <ResetWrapper>
    <Markdown options={{ forceBlock: true, overrides: components }}>{markdown}</Markdown>
  </ResetWrapper>
);
