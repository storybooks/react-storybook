import React, {
  ClipboardEvent,
  ComponentProps,
  FunctionComponent,
  MouseEvent,
  useState,
} from 'react';
import { logger } from '@storybook/client-logger';
import { styled } from '@storybook/theming';
import global from 'global';
import memoize from 'memoizerific';

// @ts-ignore
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
// @ts-ignore
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
// @ts-ignore
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
// @ts-ignore
import jsExtras from 'react-syntax-highlighter/dist/esm/languages/prism/js-extras';
// @ts-ignore
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
// @ts-ignore
import graphql from 'react-syntax-highlighter/dist/esm/languages/prism/graphql';
// @ts-ignore
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
// @ts-ignore
import md from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
// @ts-ignore
import yml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
// @ts-ignore
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
// @ts-ignore
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';

// @ts-ignore
import ReactSyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';

import { ActionBar } from '../ActionBar/ActionBar';
import { ScrollArea } from '../ScrollArea/ScrollArea';

import { formatter } from './formatter';
import type { SyntaxHighlighterProps } from './syntaxhighlighter-types';

const { navigator, document, window: globalWindow } = global;

ReactSyntaxHighlighter.registerLanguage('jsextra', jsExtras);
ReactSyntaxHighlighter.registerLanguage('jsx', jsx);
ReactSyntaxHighlighter.registerLanguage('json', json);
ReactSyntaxHighlighter.registerLanguage('yml', yml);
ReactSyntaxHighlighter.registerLanguage('md', md);
ReactSyntaxHighlighter.registerLanguage('bash', bash);
ReactSyntaxHighlighter.registerLanguage('css', css);
ReactSyntaxHighlighter.registerLanguage('html', html);
ReactSyntaxHighlighter.registerLanguage('tsx', tsx);
ReactSyntaxHighlighter.registerLanguage('typescript', typescript);
ReactSyntaxHighlighter.registerLanguage('graphql', graphql);

const themedSyntax = memoize(2)((theme) =>
  Object.entries(theme.code || {}).reduce((acc, [key, val]) => ({ ...acc, [`* .${key}`]: val }), {})
);

const copyToClipboard: (text: string) => Promise<void> = createCopyToClipboardFunction();

export function createCopyToClipboardFunction() {
  if (navigator?.clipboard) {
    return (text: string) => navigator.clipboard.writeText(text);
  }
  return async (text: string) => {
    const tmp = document.createElement('TEXTAREA');
    const focus = document.activeElement;

    tmp.value = text;

    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    focus.focus();
  };
}

export interface WrapperProps {
  bordered?: boolean;
  padded?: boolean;
}

const Wrapper = styled.div<WrapperProps>(
  ({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    color: theme.color.defaultText,
  }),
  ({ theme, bordered }) =>
    bordered
      ? {
          border: `1px solid ${theme.appBorderColor}`,
          borderRadius: theme.borderRadius,
          background: theme.background.content,
        }
      : {}
);

const Scroller = styled(({ children, className }) => (
  <ScrollArea horizontal vertical className={className}>
    {children}
  </ScrollArea>
))(
  {
    position: 'relative',
  },
  ({ theme }) => ({
    '& code': {
      paddingRight: theme.layoutMargin,
    },
  }),
  ({ theme }) => themedSyntax(theme)
);

export interface PreProps {
  padded?: boolean;
}

const Pre = styled.pre<PreProps>(({ theme, padded }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  margin: 0,
  padding: padded ? theme.layoutMargin : 0,
}));

const Code = styled.code({
  flex: 1,
  paddingRight: 0,
  opacity: 1,
});

export interface SyntaxHighlighterState {
  copied: boolean;
}

type ReactSyntaxHighlighterProps = ComponentProps<typeof ReactSyntaxHighlighter>;

type Props = SyntaxHighlighterProps & ReactSyntaxHighlighterProps;

export const SyntaxHighlighter: FunctionComponent<Props> = ({
  children,
  language = 'jsx',
  copyable = false,
  bordered = false,
  padded = false,
  format = true,
  className = null,
  showLineNumbers = false,
  ...rest
}) => {
  if (typeof children !== 'string' || !children.trim()) {
    return null;
  }

  const highlightableCode = format ? formatter(children) : children.trim();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [copied, setCopied] = useState(false);

  const onClick = (e: MouseEvent<HTMLButtonElement> | ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const selectedText = globalWindow.getSelection().toString();
    const textToCopy = e.type !== 'click' && selectedText ? selectedText : highlightableCode;

    copyToClipboard(textToCopy)
      .then(() => {
        setCopied(true);
        globalWindow.setTimeout(() => setCopied(false), 1500);
      })
      .catch(logger.error);
  };

  return (
    <Wrapper bordered={bordered} padded={padded} className={className} onCopyCapture={onClick}>
      <Scroller>
        <ReactSyntaxHighlighter
          padded={padded || bordered}
          language={language}
          showLineNumbers={showLineNumbers}
          showInlineLineNumbers={showLineNumbers}
          useInlineStyles={false}
          PreTag={Pre}
          CodeTag={Code}
          lineNumberContainerStyle={{}}
          {...rest}
        >
          {highlightableCode}
        </ReactSyntaxHighlighter>
      </Scroller>

      {copyable ? (
        <ActionBar actionItems={[{ title: copied ? 'Copied' : 'Copy', onClick }]} />
      ) : null}
    </Wrapper>
  );
};

export default SyntaxHighlighter;
