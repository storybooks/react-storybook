import { styled, Color, Theme } from '@storybook/theming';
import { Icons } from '@storybook/components';
import global from 'global';
import { transparentize } from 'polished';
import React, { FunctionComponent, ComponentProps } from 'react';

const { DOCS_MODE } = global;

export const CollapseIcon = styled.span<{ isExpanded: boolean }>(({ theme, isExpanded }) => ({
  display: 'inline-block',
  width: 0,
  height: 0,
  marginTop: 6,
  marginLeft: 8,
  marginRight: 6,
  color: transparentize(0.4, theme.color.mediumdark),
  borderTop: '3px solid transparent',
  borderBottom: '3px solid transparent',
  borderLeft: `3px solid`,
  transform: isExpanded ? 'rotateZ(90deg)' : 'none',
  transition: 'transform .1s ease-out',
}));

const iconColors = {
  light: {
    document: DOCS_MODE ? 'secondary' : '#ff8300',
    bookmarkhollow: 'seafoam',
    component: 'secondary',
    folder: 'ultraviolet',
  },
  dark: {
    document: DOCS_MODE ? 'secondary' : 'gold',
    bookmarkhollow: 'seafoam',
    component: 'secondary',
    folder: 'primary',
  },
};
const isColor = (theme: Theme, color: string): color is keyof Color => color in theme.color;
const TypeIcon = styled(Icons)(
  {
    width: 11,
    height: 11,
    marginTop: 3,
    marginRight: 6,
    flex: '0 0 auto',
  },
  ({ theme, icon, symbol = icon }) => {
    const colors = theme.base === 'dark' ? iconColors.dark : iconColors.light;
    const color = colors[symbol as keyof typeof colors];
    return { color: isColor(theme, color) ? theme.color[color] : color };
  }
);

const BranchNode = styled.button<{
  depth?: number;
  isExpandable?: boolean;
  isExpanded?: boolean;
  isComponent?: boolean;
}>(({ theme, depth = 0, isExpandable = false }) => ({
  width: '100%',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'start',
  textAlign: 'left',
  padding: 3,
  paddingLeft: `${(isExpandable ? 2 : 18) + depth * 16}px`,
  minHeight: '23px',
  color: 'inherit',
  fontSize: `${theme.typography.size.s2 - 1}px`,
  background: 'transparent',
  '&:hover, &:focus': {
    background: theme.background.hoverable,
    outline: 'none',
  },
}));

const LeafNode = styled.a<{ depth?: number }>(({ theme, depth = 0 }) => ({
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'start',
  padding: 3,
  paddingLeft: `${18 + depth * 16}px`,
  minHeight: '23px',
  fontSize: `${theme.typography.size.s2 - 1}px`,
  textDecoration: 'none',
  color: theme.color.defaultText,
  background: 'transparent',
  '&:hover, &:focus': {
    outline: 'none',
    background: theme.background.hoverable,
  },
  '&[data-selected="true"]': {
    color: theme.color.lightest,
    background: theme.color.secondary,
    fontWeight: theme.typography.weight.bold,
    '&:hover, &:focus': {
      background: theme.color.secondary,
    },
    svg: { color: theme.color.lightest },
  },
}));

export const Path = styled.span(({ theme }) => ({
  display: 'grid',
  justifyContent: 'start',
  gridAutoColumns: 'auto',
  gridAutoFlow: 'column',
  color: theme.textMutedColor,
  fontSize: `${theme.typography.size.s1 - 1}px`,
  '& > span': {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '& > span + span': {
    position: 'relative',
    marginLeft: 4,
    paddingLeft: 7,
    '&:before': {
      content: "'/'",
      position: 'absolute',
      left: 0,
    },
  },
}));

export const RootNode = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  marginTop: 16,
  marginBottom: 4,
  fontSize: `${theme.typography.size.s1 - 1}px`,
  fontWeight: theme.typography.weight.black,
  lineHeight: '16px',
  minHeight: 20,
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  color: theme.color.mediumdark,
}));

export const GroupNode: FunctionComponent<
  ComponentProps<typeof BranchNode> & { isExpanded?: boolean; isExpandable?: boolean }
> = React.memo(({ children, isExpanded = false, isExpandable = false, ...props }) => (
  <BranchNode isExpandable={isExpandable} tabIndex={-1} {...props}>
    {isExpandable ? <CollapseIcon isExpanded={isExpanded} /> : null}
    <TypeIcon symbol="folder" color="primary" />
    {children}
  </BranchNode>
));

export const ComponentNode: FunctionComponent<ComponentProps<typeof BranchNode>> = React.memo(
  ({ theme, children, isExpanded, isExpandable, ...props }) => (
    <BranchNode isExpandable={isExpandable} tabIndex={-1} {...props}>
      {isExpandable && <CollapseIcon isExpanded={isExpanded} />}
      <TypeIcon symbol="component" color="secondary" />
      {children}
    </BranchNode>
  )
);

export const DocumentNode: FunctionComponent<ComponentProps<typeof LeafNode>> = React.memo(
  ({ theme, children, ...props }) => (
    <LeafNode tabIndex={-1} {...props}>
      <TypeIcon symbol="document" />
      {children}
    </LeafNode>
  )
);

export const StoryNode: FunctionComponent<ComponentProps<typeof LeafNode>> = React.memo(
  ({ theme, children, ...props }) => (
    <LeafNode tabIndex={-1} {...props}>
      <TypeIcon symbol="bookmarkhollow" />
      {children}
    </LeafNode>
  )
);
