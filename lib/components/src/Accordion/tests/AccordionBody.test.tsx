import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { ThemeProvider, themes, convert } from '@storybook/theming';
import { AccordionBody } from '../AccordionBody';

afterEach(cleanup);

describe('<AccordionBody />', () => {
  it('can perform an empty shallow render', () => {
    const { findByTestId } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionBody data-test-id="accordion-body" />
      </ThemeProvider>
    );

    expect(findByTestId('accordion-body')).toBeDefined();
  });

  it('will render given children', () => {
    const { findByTestId } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionBody data-test-id="accordion-body">
          <div data-test-id="accordion-body-child">Hello</div>
        </AccordionBody>
      </ThemeProvider>
    );

    expect(findByTestId('accordion-body')).toBeDefined();
    expect(findByTestId('accordion-body-child')).toBeDefined();
  });

  it('will have height "auto" if open', () => {
    const { container } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionBody open>
          <div style={{ height: 200 }}>Hello</div>
        </AccordionBody>
      </ThemeProvider>
    );

    const inner = container.querySelector('[data-sb-accordion-body-inner=""]');

    expect(container).toBeDefined();
    expect(inner).toHaveStyle('height: auto');
  });

  it('will have height "0" if not open', () => {
    const { container } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionBody>
          <div style={{ height: 200 }}>Hello</div>
        </AccordionBody>
      </ThemeProvider>
    );

    const inner = container.querySelector('[data-sb-accordion-body-inner=""]');

    expect(container).toBeDefined();
    expect(inner).toHaveStyle('height: 0');
  });
});
