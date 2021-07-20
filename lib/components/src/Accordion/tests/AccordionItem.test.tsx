import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { ThemeProvider, themes, convert } from '@storybook/theming';
import { AccordionItem } from '../AccordionItem';
import { AccordionHeader } from '../AccordionHeader';
import { AccordionBody } from '../AccordionBody';

afterEach(cleanup);

describe('<AccordionItem />', () => {
  it('can perform an shallow render', () => {
    const { findByTestId } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionItem data-test-id="accordion-item" />
      </ThemeProvider>
    );

    expect(findByTestId('accordion-item')).toBeDefined();
  });

  it('can perform an shallow render with empty children', () => {
    const { findByTestId } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionItem data-test-id="accordion-item">
          <AccordionHeader />
          <AccordionBody />
        </AccordionItem>
      </ThemeProvider>
    );

    expect(findByTestId('accordion-item')).toBeDefined();
    expect(findByTestId('accordion-item-child')).toBeDefined();
  });

  it('will rotate expander 0deg when not open', () => {
    const { container, findByTestId } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionItem data-test-id="accordion-item">
          <AccordionHeader />
          <AccordionBody />
        </AccordionItem>
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
        <AccordionItem>
          <AccordionHeader />
          <AccordionBody />
        </AccordionItem>
      </ThemeProvider>
    );

    const expander = container.querySelector('[data-sb-accordion-expander=""]');

    expect(findByTestId('accordion-header')).toBeDefined();
    expect(expander).toBeDefined();
    expect(expander).toHaveStyle('transform: rotate(0deg)');
  });

  it('body will have height "auto" if open', () => {
    const { container } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionItem open>
          <AccordionHeader />
          <AccordionBody>
            <div style={{ height: 200 }}>Hello</div>
          </AccordionBody>
        </AccordionItem>
      </ThemeProvider>
    );

    const bodyInner = container.querySelector('[data-sb-accordion-body-inner=""]');

    expect(container).toBeDefined();
    expect(bodyInner).toHaveStyle('height: auto');
  });

  it('body will have height "0" if not open', () => {
    const { container } = render(
      <ThemeProvider theme={convert(themes.light)}>
        <AccordionItem>
          <AccordionHeader />
          <AccordionBody>
            <div style={{ height: 200 }}>Hello</div>
          </AccordionBody>
        </AccordionItem>
      </ThemeProvider>
    );

    const bodyInner = container.querySelector('[data-sb-accordion-body-inner=""]');

    expect(container).toBeDefined();
    expect(bodyInner).toHaveStyle('height: 0');
  });
});
