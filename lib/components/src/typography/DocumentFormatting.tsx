import React, { FunctionComponent, ReactNode } from 'react';
import { styled, CSSObject } from '@storybook/theming';
import { withReset, withMargin, headerCommon, codeCommon } from './shared';
import { StyledSyntaxHighlighter } from '../blocks/Source';

export const H1 = styled.h1<{}>(withReset, headerCommon, ({ theme }) => ({
  fontSize: `${theme.typography.size.l1}px`,
  fontWeight: theme.typography.weight.black,
}));

export const H2 = styled.h2<{}>(withReset, headerCommon, ({ theme }) => ({
  fontSize: `${theme.typography.size.m2}px`,
  paddingBottom: 4,
  borderBottom: `1px solid ${theme.appBorderColor}`,
}));

export const H3 = styled.h3<{}>(withReset, headerCommon, ({ theme }) => ({
  fontSize: `${theme.typography.size.m1}px`,
}));

export const H4 = styled.h4<{}>(withReset, headerCommon, ({ theme }) => ({
  fontSize: `${theme.typography.size.s3}px`,
}));

export const H5 = styled.h5<{}>(withReset, headerCommon, ({ theme }) => ({
  fontSize: `${theme.typography.size.s2}px`,
}));

export const H6 = styled.h6<{}>(withReset, headerCommon, ({ theme }) => ({
  fontSize: `${theme.typography.size.s2}px`,
  color: theme.color.dark,
}));

export const Pre = styled.pre<{}>(withReset, withMargin, ({ theme }) => ({
  // reset
  fontFamily: theme.typography.fonts.mono,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  lineHeight: '18px',
  padding: '11px 1rem',
  whiteSpace: 'pre-wrap',
  color: 'inherit',
  borderRadius: 3,
  margin: '1rem 0',

  '&:not(.prismjs)': {
    background: 'transparent',
    border: 'none',
    borderRadius: 0,
    padding: 0,
    margin: 0,
  },
  '& pre, &.prismjs': {
    padding: 15,
    margin: 0,
    whiteSpace: 'pre-wrap',
    color: 'inherit',
    fontSize: '13px',
    lineHeight: '19px',
    code: {
      color: 'inherit',
      fontSize: 'inherit',
    },
  },
  '& code': {
    whiteSpace: 'pre',
  },
  '& code, & tt': {
    border: 'none',
  },
}));

const Link: FunctionComponent<any> = ({ href: input, children, ...props }) => {
  const isStorybookPath = /^\//.test(input);
  const isAnchorUrl = /^#.*/.test(input);
  const href = isStorybookPath ? `?path=${input}` : input;
  const target = isAnchorUrl ? '_self' : '_top';

  return (
    <a href={href} target={target} {...props}>
      {children}
    </a>
  );
};

export const A = styled(Link)<{}>(withReset, ({ theme }) => ({
  fontSize: 'inherit',
  lineHeight: '24px',

  color: theme.color.secondary,
  textDecoration: 'none',
  '&.absent': {
    color: '#cc0000',
  },
  '&.anchor': {
    display: 'block',
    paddingLeft: 30,
    marginLeft: -30,
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
}));

export const HR = styled.hr<{}>(({ theme }) => ({
  border: '0 none',
  borderTop: `1px solid ${theme.appBorderColor}`,
  height: 4,
  padding: 0,
}));

export const DL = styled.dl<{}>(withReset, {
  ...withMargin,
  padding: 0,
  '& dt': {
    fontSize: '14px',
    fontWeight: 'bold',
    fontStyle: 'italic',
    padding: 0,
    margin: '16px 0 4px',
  },
  '& dt:first-of-type': {
    padding: 0,
  },
  '& dt > :first-of-type': {
    marginTop: 0,
  },

  '& dt > :last-child': {
    marginBottom: 0,
  },

  '& dd': {
    margin: '0 0 16px',
    padding: '0 15px',
  },

  '& dd > :first-of-type': {
    marginTop: 0,
  },

  '& dd > :last-child': {
    marginBottom: 0,
  },
});

export const Blockquote = styled.blockquote<{}>(withReset, withMargin, ({ theme }) => ({
  borderLeft: `4px solid ${theme.color.medium}`,
  padding: '0 15px',
  color: theme.color.dark,
  '& > :first-of-type': {
    marginTop: 0,
  },
  '& > :last-child': {
    marginBottom: 0,
  },
}));

export const Table = styled.table<{}>(withReset, withMargin, ({ theme }) => ({
  fontSize: theme.typography.size.s2,
  lineHeight: '24px',
  padding: 0,
  borderCollapse: 'collapse',
  '& tr': {
    borderTop: `1px solid ${theme.appBorderColor}`,
    backgroundColor: theme.appContentBg,
    margin: 0,
    padding: 0,
  },
  '& tr:nth-of-type(2n)': {
    backgroundColor: theme.base === 'dark' ? theme.color.darker : theme.color.lighter,
  },
  '& tr th': {
    fontWeight: 'bold',
    color: theme.color.defaultText,
    border: `1px solid ${theme.appBorderColor}`,
    margin: 0,
    padding: '6px 13px',
  },
  '& tr td': {
    border: `1px solid ${theme.appBorderColor}`,
    color: theme.color.defaultText,
    margin: 0,
    padding: '6px 13px',
  },
  '& tr th :first-of-type, & tr td :first-of-type': {
    marginTop: 0,
  },
  '& tr th :last-child, & tr td :last-child': {
    marginBottom: 0,
  },
}));

export const Img = styled.img<{}>({
  maxWidth: '100%',
});

export const Div = styled.div<{}>(withReset);

export const Span = styled.span<{}>(withReset, ({ theme }) => ({
  '&.frame': {
    display: 'block',
    overflow: 'hidden',

    '& > span': {
      border: `1px solid ${theme.color.medium}`,
      display: 'block',
      float: 'left',
      overflow: 'hidden',
      margin: '13px 0 0',
      padding: 7,
      width: 'auto',
    },
    '& span img': {
      display: 'block',
      float: 'left',
    },
    '& span span': {
      clear: 'both',
      color: theme.color.darkest,
      display: 'block',
      padding: '5px 0 0',
    },
  },
  '&.align-center': {
    display: 'block',
    overflow: 'hidden',
    clear: 'both',

    '& > span': {
      display: 'block',
      overflow: 'hidden',
      margin: '13px auto 0',
      textAlign: 'center',
    },
    '& span img': {
      margin: '0 auto',
      textAlign: 'center',
    },
  },
  '&.align-right': {
    display: 'block',
    overflow: 'hidden',
    clear: 'both',

    '& > span': {
      display: 'block',
      overflow: 'hidden',
      margin: '13px 0 0',
      textAlign: 'right',
    },
    '& span img': {
      margin: 0,
      textAlign: 'right',
    },
  },
  '&.float-left': {
    display: 'block',
    marginRight: 13,
    overflow: 'hidden',
    float: 'left',
    '& span': {
      margin: '13px 0 0',
    },
  },
  '&.float-right': {
    display: 'block',
    marginLeft: 13,
    overflow: 'hidden',
    float: 'right',

    '& > span': {
      display: 'block',
      overflow: 'hidden',
      margin: '13px auto 0',
      textAlign: 'right',
    },
  },
}));

const listCommon: CSSObject = {
  paddingLeft: 30,
  '& :first-of-type': {
    marginTop: 0,
  },
  '& :last-child': {
    marginBottom: 0,
  },
};

export const LI = styled.li<{}>(withReset, ({ theme }) => ({
  fontSize: theme.typography.size.s2,
  color: theme.color.defaultText,
  lineHeight: '24px',
  '& + li': {
    marginTop: '.25em',
  },
  '& ul, & ol': {
    marginTop: '.25em',
    marginBottom: 0,
  },
  '& code': codeCommon({ theme }),
}));

export const UL = styled.ul<{}>(withReset, withMargin, { ...listCommon, listStyle: 'disc' });

export const OL = styled.ol<{}>(withReset, withMargin, { ...listCommon, listStyle: 'decimal' });

export const P = styled.p<{}>(withReset, withMargin, ({ theme }) => ({
  fontSize: theme.typography.size.s2,
  lineHeight: '24px',
  color: theme.color.defaultText,
  '& code': codeCommon({ theme }),
}));

const DefaultCodeBlock = styled.code<{}>(
  ({ theme }) => ({
    // from reset
    fontFamily: theme.typography.fonts.mono,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    display: 'inline-block',
    paddingLeft: 2,
    paddingRight: 2,
    verticalAlign: 'baseline',
    color: 'inherit',
  }),
  codeCommon
);

const isInlineCodeRegex = /[\n\r]/g;

const isReactChildString = (child: ReactNode): child is string => typeof child === 'string';

export const Code = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DefaultCodeBlock>) => {
  const language = (className || '').match(/lang-(\S+)/);
  const childrenArray = React.Children.toArray(children);
  const isInlineCode = !childrenArray
    .filter(isReactChildString)
    .some((child) => child.match(isInlineCodeRegex));

  if (isInlineCode) {
    return (
      <DefaultCodeBlock {...props} className={className}>
        {childrenArray}
      </DefaultCodeBlock>
    );
  }

  return (
    <StyledSyntaxHighlighter
      bordered
      copyable
      language={language?.[1] ?? 'plaintext'}
      format={false}
      {...props}
    >
      {children}
    </StyledSyntaxHighlighter>
  );
};

export const TT = styled.title<{}>(codeCommon);

/**
 * This is a "local" reset to style subtrees with Storybook styles
 *
 * We can't style individual elements (e.g. h1, h2, etc.) in here
 * because the CSS specificity is too high, so those styles can too
 * easily override child elements that are not expecting it.
 */

export const ResetWrapper = styled.div<{}>(withReset);

const nameSpaceClassNames = ({ ...props }, key: string) => {
  const classes = [props.class, props.className];
  // eslint-disable-next-line no-param-reassign
  delete props.class;

  // eslint-disable-next-line no-param-reassign
  props.className = ['sbdocs', `sbdocs-${key}`, ...classes].filter(Boolean).join(' ');

  return props;
};

export const components = {
  h1: ((props) => <H1 {...nameSpaceClassNames(props, 'h1')} />) as typeof H1,
  h2: ((props) => <H2 {...nameSpaceClassNames(props, 'h2')} />) as typeof H2,
  h3: ((props) => <H3 {...nameSpaceClassNames(props, 'h3')} />) as typeof H3,
  h4: ((props) => <H4 {...nameSpaceClassNames(props, 'h4')} />) as typeof H4,
  h5: ((props) => <H5 {...nameSpaceClassNames(props, 'h5')} />) as typeof H5,
  h6: ((props) => <H6 {...nameSpaceClassNames(props, 'h6')} />) as typeof H6,
  pre: ((props) => <Pre {...nameSpaceClassNames(props, 'pre')} />) as typeof Pre,
  a: ((props) => <A {...nameSpaceClassNames(props, 'a')} />) as typeof A,
  hr: ((props) => <HR {...nameSpaceClassNames(props, 'hr')} />) as typeof HR,
  dl: ((props) => <DL {...nameSpaceClassNames(props, 'dl')} />) as typeof DL,
  blockquote: ((props) => (
    <Blockquote {...nameSpaceClassNames(props, 'blockquote')} />
  )) as typeof Blockquote,
  table: ((props) => <Table {...nameSpaceClassNames(props, 'table')} />) as typeof Table,
  img: ((props) => <Img {...nameSpaceClassNames(props, 'img')} />) as typeof Img,
  div: ((props) => <Div {...nameSpaceClassNames(props, 'div')} />) as typeof Div,
  span: ((props) => <Span {...nameSpaceClassNames(props, 'span')} />) as typeof Span,
  li: ((props) => <LI {...nameSpaceClassNames(props, 'li')} />) as typeof LI,
  ul: ((props) => <UL {...nameSpaceClassNames(props, 'ul')} />) as typeof UL,
  ol: ((props) => <OL {...nameSpaceClassNames(props, 'ol')} />) as typeof OL,
  p: ((props) => <P {...nameSpaceClassNames(props, 'p')} />) as typeof P,
  code: ((props) => <Code {...nameSpaceClassNames(props, 'code')} />) as typeof Code,
  tt: ((props) => <TT {...nameSpaceClassNames(props, 'tt')} />) as typeof TT,
  resetwrapper: ((props) => (
    <ResetWrapper {...nameSpaceClassNames(props, 'resetwrapper')} />
  )) as typeof ResetWrapper,
};
