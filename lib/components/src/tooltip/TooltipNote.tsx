import React, { FunctionComponent } from 'react';
import { styled } from '@storybook/theming';

const Note = styled.div(({ theme }) => ({
  padding: '2px 6px',
  lineHeight: '16px',
  fontSize: 10,
  fontWeight: theme.typography.weight.bold,
  color: theme.color.lightest,
  boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.3)',
  borderRadius: 4,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  zIndex: -1,
  background: 'rgba(0, 0, 0, 0.4)',
  margin: 6,
}));

export interface TooltipNoteProps {
  note: string;
}

export const TooltipNote: FunctionComponent<TooltipNoteProps> = ({ note, ...props }) => (
  <Note {...props}>{note}</Note>
);
