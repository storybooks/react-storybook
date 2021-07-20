import React, { AnchorHTMLAttributes } from 'react';
import { render, screen } from '@testing-library/react';
import { convert, ThemeProvider, themes } from '@storybook/theming';
import { A } from './DocumentFormatting';
import { LinkProps } from './link/link';

function ThemedLink(props: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <ThemeProvider theme={convert(themes.light)}>
      <A {...props} />
    </ThemeProvider>
  );
}

describe('Link', () => {
  describe('events', () => {
    it('absolute hrefs should not be changed', () => {
      render(<ThemedLink href="/test">Content</ThemedLink>);

      const anchor = screen.getByText('Content');
      expect(anchor.getAttribute('href')).toBe('/test');
    });

    it('anchor hrefs should have target=_self', () => {
      render(<ThemedLink href="#test">Content</ThemedLink>);

      const anchor = screen.getByText('Content');
      expect(anchor.getAttribute('href')).toBe('#test');
      expect(anchor.getAttribute('target')).toBe('_self');
    });
  });
});
