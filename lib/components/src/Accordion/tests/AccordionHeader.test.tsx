import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { ThemeProvider, themes, convert } from '@storybook/theming';
import { AccordionHeader } from '../AccordionHeader';

afterEach(cleanup);

describe('<AccordionHeader />', () => {
  it('can perform an empty shallow render', () => {
    const { findByTestId } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionHeader data-test-id="accordion-header" />
      </ThemeProvider>
    );

    expect(findByTestId('accordion-header')).toBeDefined();
  });

  it('will render given children', () => {
    const { findByTestId } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionHeader data-test-id="accordion-header">
          <div data-test-id="accordion-header-child">Hello</div>
        </AccordionHeader>
      </ThemeProvider>
    );

    expect(findByTestId('accordion-header')).toBeDefined();
    expect(findByTestId('accordion-header-child')).toBeDefined();
  });

  it('will render icon', () => {
    const { findByTestId, findByRole } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionHeader data-test-id="accordion-header">
          <div data-test-id="accordion-header-child">Hello</div>
        </AccordionHeader>
      </ThemeProvider>
    );

    expect(findByTestId('accordion-header')).toBeDefined();
    expect(findByRole('img')).toBeDefined();
  });

  it('will rotate expander 0deg when not open', () => {
    const { container, findByTestId } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionHeader data-test-id="accordion-header">
          <div data-test-id="accordion-header-child">Hello</div>
        </AccordionHeader>
      </ThemeProvider>
    );

    const expander = container.querySelector('[data-sb-accordion-expander=""]');

    expect(findByTestId('accordion-header')).toBeDefined();
    expect(expander).toBeDefined();
    expect(expander).toHaveStyle('transform: rotate(0deg)');
  });

  it('will rotate expander 90deg when open', () => {
    const { container, findByTestId } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionHeader open data-test-id="accordion-header">
          <div data-test-id="accordion-header-child">Hello</div>
        </AccordionHeader>
      </ThemeProvider>
    );

    const expander = container.querySelector('[data-sb-accordion-expander=""]');

    expect(findByTestId('accordion-header')).toBeDefined();
    expect(expander).toBeDefined();
    expect(expander).toHaveStyle('transform: rotate(90deg)');
  });
});
