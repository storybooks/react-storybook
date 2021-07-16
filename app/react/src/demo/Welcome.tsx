import React, {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  FunctionComponent,
  HTMLAttributes,
} from 'react';

type MainProps = Omit<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>, 'style'>;
const Main: FunctionComponent<MainProps> = (props) => (
  <article
    {...props}
    style={{
      padding: 15,
      lineHeight: 1.4,
      fontFamily: '"Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif',
      backgroundColor: '#fff',
      color: '#000',
    }}
  />
);

type TitleProps = DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
const Title: FunctionComponent<TitleProps> = ({ children, ...props }) => (
  <h1 {...props}>{children}</h1>
);

type NoteProps = Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>,
  'style'
>;
const Note: FunctionComponent<NoteProps> = (props) => (
  <p
    {...props}
    style={{
      opacity: 0.5,
    }}
  />
);

type InlineCodeProps = Omit<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>, 'style'>;
const InlineCode: FunctionComponent<InlineCodeProps> = (props) => (
  <code
    {...props}
    style={{
      fontSize: 15,
      fontWeight: 600,
      padding: '2px 5px',
      border: '1px solid #eae9e9',
      borderRadius: 4,
      backgroundColor: '#f3f2f2',
      color: '#3a3a3a',
    }}
  />
);

type LinkProps = Omit<
  DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>,
  'style'
> & {
  href: string;
  target: string;
  rel: string;
};
const Link: FunctionComponent<LinkProps> = ({ children, href, target, rel, ...props }) => (
  <a
    href={href}
    {...props}
    target={target}
    rel={rel}
    style={{
      color: '#1474f3',
      textDecoration: 'none',
      borderBottom: '1px solid #1474f3',
      paddingBottom: 2,
    }}
  >
    {children}
  </a>
);

type NavButtonProps = Omit<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
  'style' | 'type'
> &
  Record<string, any>;
const NavButton: FunctionComponent<NavButtonProps> = ({ children, onClick, ...props }) => (
  <button
    {...props}
    type="button"
    onClick={onClick}
    style={{
      color: '#1474f3',
      textDecoration: 'none',
      borderBottom: '1px solid #1474f3',
      paddingBottom: 2,
      borderTop: 'none',
      borderRight: 'none',
      borderLeft: 'none',
      backgroundColor: 'transparent',
      padding: 0,
      cursor: 'pointer',
      font: 'inherit',
    }}
  >
    {children}
  </button>
);

interface WelcomeProps {
  showApp: () => void;
}
const Welcome: FunctionComponent<WelcomeProps> = ({ showApp }) => (
  <Main>
    <Title>Welcome to storybook</Title>
    <p>This is a UI component dev environment for your app.</p>
    <p>
      We've added some basic stories inside the <InlineCode>src/stories</InlineCode> directory.
      <br />A story is a single state of one or more UI components. You can have as many stories as
      you want.
      <br />
      (Basically a story is like a visual test case.)
    </p>
    <p>
      See these sample <NavButton onClick={showApp}>stories</NavButton> for a component called&nbsp;
      <InlineCode>Button</InlineCode>.
    </p>
    <p>
      Just like that, you can add your own components as stories.
      <br />
      You can also edit those components and see changes right away.
      <br />
      (Try editing the <InlineCode>Button</InlineCode> stories located at&nbsp;
      <InlineCode>src/stories/1-Button.stories.js</InlineCode>
      .)
    </p>
    <p>
      Usually we create stories with smaller UI components in the app.
      <br />
      Have a look at the&nbsp;
      <Link
        href="https://storybook.js.org/basics/writing-stories"
        target="_blank"
        rel="noopener noreferrer"
      >
        Writing Stories
      </Link>
      &nbsp;section in our documentation.
    </p>
    <Note>
      <b>NOTE:</b>
      <br />
      Have a look at the <InlineCode>.storybook/webpack.config.js</InlineCode> to add webpack
      loaders and plugins you are using in this project.
    </Note>
  </Main>
);
Welcome.displayName = 'Welcome';

export { Welcome as default };
