/* eslint-disable react/display-name */
import { createElement, ElementType } from 'react';
import { components as rawComponents } from './typography/DocumentFormatting';

export { Badge } from './Badge/Badge';

// Typography
export { Link } from './typography/link/link';
export { DocumentWrapper } from './typography/DocumentWrapper';
export type {
  SyntaxHighlighterProps,
  SyntaxHighlighterRendererProps,
} from './syntaxhighlighter/syntaxhighlighter-types';
export { SyntaxHighlighter } from './syntaxhighlighter/lazy-syntaxhighlighter';

// UI
export { ActionBar } from './ActionBar/ActionBar';
export { Spaced } from './spaced/Spaced';
export { Placeholder } from './placeholder/placeholder';
export { ScrollArea } from './ScrollArea/ScrollArea';
export { Zoom } from './Zoom/Zoom';

// Forms
export { Button } from './Button/Button';
export { Form } from './form/index';

// Tooltips
export { WithTooltip, WithTooltipPure } from './tooltip/lazy-WithTooltip';
export { TooltipMessage } from './tooltip/TooltipMessage';
export { TooltipNote } from './tooltip/TooltipNote';
export { TooltipLinkList } from './tooltip/TooltipLinkList';

// Toolbar and subcomponents
export { Tabs, TabsState, TabBar, TabWrapper } from './tabs/tabs';
export { IconButton, TabButton } from './bar/button';
export { Separator, interleaveSeparators } from './bar/separator';
export { Bar, FlexBar } from './bar/bar';
export { AddonPanel } from './addon-panel/addon-panel';

// Graphics
export type { IconsProps } from './icon/icon';
export { Icons, Symbols } from './icon/icon';
export { StorybookLogo } from './brand/StorybookLogo';
export { StorybookIcon } from './brand/StorybookIcon';

// Doc blocks
// FIXME DEPENDENCY CYCLE
// eslint-disable-next-line import/no-cycle
export * from './blocks';
export * from './controls';

// Loader
export { Loader } from './Loader/Loader';

export * from './typography/DocumentFormatting';

const resetComponents: Record<string, ElementType> = {};

Object.keys(rawComponents).forEach((key) => {
  resetComponents[key] = (props: any) => createElement(key, props);
});

export { resetComponents };
