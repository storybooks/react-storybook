import * as React from 'react';
import { AxeResults } from 'axe-core';
import { render, act } from '@testing-library/react';
import * as api from '@storybook/api';
import { STORY_CHANGED } from '@storybook/core-events';

import { A11yContextProvider, useA11yContext } from './A11yContext';
import { EVENTS } from '../constants';

jest.mock('@storybook/api');
const mockedApi = api as jest.Mocked<typeof api>;

const storyId = 'jest';
const axeResult: Partial<AxeResults> = {
  incomplete: [
    {
      id: 'color-contrast',
      impact: 'serious',
      tags: [],
      description:
        'Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds',
      help: 'Elements must have sufficient color contrast',
      helpUrl: 'https://dequeuniversity.com/rules/axe/3.2/color-contrast?application=axeAPI',
      nodes: [],
    },
  ],
  passes: [
    {
      id: 'aria-allowed-attr',
      impact: undefined,
      tags: [],
      description: "Ensures ARIA attributes are allowed for an element's role",
      help: 'Elements must only use allowed ARIA attributes',
      helpUrl: 'https://dequeuniversity.com/rules/axe/3.2/aria-allowed-attr?application=axeAPI',
      nodes: [],
    },
  ],
  violations: [
    {
      id: 'color-contrast',
      impact: 'serious',
      tags: [],
      description:
        'Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds',
      help: 'Elements must have sufficient color contrast',
      helpUrl: 'https://dequeuniversity.com/rules/axe/3.2/color-contrast?application=axeAPI',
      nodes: [],
    },
  ],
};

describe('A11YPanel', () => {
  beforeEach(() => {
    mockedApi.useChannel.mockReset();
    mockedApi.useStorybookState.mockReset();

    mockedApi.useChannel.mockReturnValue(jest.fn());
    const state: Partial<api.State> = { storyId };
    // Lazy to mock entire state
    mockedApi.useStorybookState.mockReturnValue(state as any);
  });

  it('should render children', () => {
    const { getByTestId } = render(
      <A11yContextProvider active>
        <div data-testid="child" />
      </A11yContextProvider>
    );
    expect(getByTestId('child')).toBeTruthy();
  });

  it('should not render when inactive', () => {
    const emit = jest.fn();
    mockedApi.useChannel.mockReturnValue(emit);
    const { queryByTestId } = render(
      <A11yContextProvider active={false}>
        <div data-testid="child" />
      </A11yContextProvider>
    );
    expect(queryByTestId('child')).toBeFalsy();
    expect(emit).not.toHaveBeenCalledWith(EVENTS.REQUEST);
  });

  it('should emit request when moving from inactive to active', () => {
    const emit = jest.fn();
    mockedApi.useChannel.mockReturnValue(emit);
    const { rerender } = render(<A11yContextProvider active={false} />);
    rerender(<A11yContextProvider active />);
    expect(emit).toHaveBeenLastCalledWith(EVENTS.REQUEST, storyId);
  });

  it('should emit highlight with no values when inactive', () => {
    const emit = jest.fn();
    mockedApi.useChannel.mockReturnValue(emit);
    const { rerender } = render(<A11yContextProvider active />);
    rerender(<A11yContextProvider active={false} />);
    expect(emit).toHaveBeenLastCalledWith(
      EVENTS.HIGHLIGHT,
      expect.objectContaining({
        color: expect.any(String),
        elements: [],
      })
    );
  });

  it('should emit highlight with no values when story changed', () => {
    const Component = () => {
      const { results, setResults } = useA11yContext();
      // As any because of unit tests...
      React.useEffect(() => setResults(axeResult as any), [setResults]);
      return (
        <>
          {!!results.passes.length && <div data-testid="anyPassesResults" />}
          {!!results.incomplete.length && <div data-testid="anyIncompleteResults" />}
          {!!results.violations.length && <div data-testid="anyViolationsResults" />}
        </>
      );
    };
    const { queryByTestId } = render(
      <A11yContextProvider active>
        <Component />
      </A11yContextProvider>
    );
    expect(queryByTestId('anyPassesResults')).toBeTruthy();
    expect(queryByTestId('anyIncompleteResults')).toBeTruthy();
    expect(queryByTestId('anyViolationsResults')).toBeTruthy();
    const useChannelArgs = mockedApi.useChannel.mock.calls[0][0];
    act(() => useChannelArgs[STORY_CHANGED]());
    expect(queryByTestId('anyPassesResults')).toBeFalsy();
    expect(queryByTestId('anyIncompleteResults')).toBeFalsy();
    expect(queryByTestId('anyViolationsResults')).toBeFalsy();
  });
});
