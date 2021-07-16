/* eslint-disable jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid, jsx-a11y/control-has-associated-label, jsx-a11y/heading-has-content */
import React, { Fragment } from 'react';

const text = 'Testing the a11y addon';
const href = 'http://example.com';

export default {
  title: 'Addons/A11y/Typography',
  parameters: {
    options: { selectedPanel: 'storybook/a11y/panel' },
  },
};

export const Correct = () => (
  <Fragment>
    <h1>{text}</h1>
    <p>{text}</p>
    <a href={href}>{`${text}...`}</a>
  </Fragment>
);

export const EmptyHeading = () => <h1 />;

EmptyHeading.storyName = 'Empty Heading';

export const EmptyParagraph = () => <p />;

EmptyParagraph.storyName = 'Empty Paragraph';

export const EmptyLink = () => <a href={href} />;

EmptyLink.storyName = 'Empty Link';

export const LinkWithoutHref = () => <a>{`${text}...`}</a>;

LinkWithoutHref.storyName = 'Link without href';

export const Manual = () => <p>I'm a manual run</p>;
Manual.parameters = {
  a11y: {
    manual: true,
    config: {
      disableOtherRules: true,
      rules: [],
    },
    options: {},
  },
};
