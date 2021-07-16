import * as React from 'react';

import { styled } from '@storybook/theming';
import { NodeResult, Result } from 'axe-core';
import { SizeMe } from 'react-sizeme';
import HighlightToggle from './Report/HighlightToggle';
import { RuleType } from '../types';
import { useA11yContext } from './A11yContext';

// TODO: reuse the Tabs component from @storybook/theming instead of re-building identical functionality

const Container = styled.div({
  width: '100%',
  position: 'relative',
  minHeight: '100%',
});

const HighlightToggleLabel = styled.label(({ theme }) => ({
  cursor: 'pointer',
  userSelect: 'none',
  color: theme.color.dark,
}));

const GlobalToggle = styled.div<{ elementWidth: number }>(({ elementWidth, theme }) => {
  const maxWidthBeforeBreak = 450;
  return {
    cursor: 'pointer',
    fontSize: 13,
    lineHeight: '20px',
    padding: elementWidth > maxWidthBeforeBreak ? '10px 15px 10px 0' : '10px 0px 10px 15px',
    height: '40px',
    border: 'none',
    marginTop: elementWidth > maxWidthBeforeBreak ? -40 : 0,
    float: elementWidth > maxWidthBeforeBreak ? 'right' : 'left',
    display: 'flex',
    alignItems: 'center',
    width: elementWidth > maxWidthBeforeBreak ? 'auto' : '100%',
    borderBottom: elementWidth > maxWidthBeforeBreak ? 'none' : `1px solid ${theme.appBorderColor}`,

    input: {
      marginLeft: 10,
      marginRight: 0,
      marginTop: -1,
      marginBottom: 0,
    },
  };
});

const Item = styled.button<{ active?: boolean }>(
  ({ theme }) => ({
    textDecoration: 'none',
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: theme.typography.weight.bold,
    fontSize: theme.typography.size.s2 - 1,
    lineHeight: 1,
    height: 40,
    border: 'none',
    borderTop: '3px solid transparent',
    borderBottom: '3px solid transparent',
    background: 'transparent',

    '&:focus': {
      outline: '0 none',
      borderBottom: `3px solid ${theme.color.secondary}`,
    },
  }),
  ({ active, theme }) =>
    active
      ? {
          opacity: 1,
          borderBottom: `3px solid ${theme.color.secondary}`,
        }
      : {}
);

const TabsWrapper = styled.div({});

const List = styled.div(({ theme }) => ({
  boxShadow: `${theme.appBorderColor} 0 -1px 0 0 inset`,
  background: 'rgba(0, 0, 0, .05)',
  display: 'flex',
  justifyContent: 'space-between',
  whiteSpace: 'nowrap',
}));

interface TabsProps {
  tabs: {
    label: JSX.Element;
    panel: JSX.Element;
    items: Result[];
    type: RuleType;
  }[];
}

function retrieveAllNodesFromResults(items: Result[]): NodeResult[] {
  return items.reduce((acc, item) => acc.concat(item.nodes), [] as NodeResult[]);
}

export const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const { tab: activeTab, setTab } = useA11yContext();

  const handleToggle = React.useCallback(
    (event: React.SyntheticEvent) => {
      setTab(parseInt(event.currentTarget.getAttribute('data-index') || '', 10));
    },
    [setTab]
  );

  const highlightToggleId = `${tabs[activeTab].type}-global-checkbox`;
  const highlightLabel = `Highlight results`;
  return (
    <SizeMe refreshMode="debounce">
      {({ size }) => (
        <Container>
          <List>
            <TabsWrapper>
              {tabs.map((tab, index) => (
                <Item
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={index}
                  data-index={index}
                  active={activeTab === index}
                  onClick={handleToggle}
                >
                  {tab.label}
                </Item>
              ))}
            </TabsWrapper>
          </List>
          {tabs[activeTab].items.length > 0 ? (
            <GlobalToggle elementWidth={size.width || 0}>
              <HighlightToggleLabel htmlFor={highlightToggleId}>
                {highlightLabel}
              </HighlightToggleLabel>
              <HighlightToggle
                toggleId={highlightToggleId}
                elementsToHighlight={retrieveAllNodesFromResults(tabs[activeTab].items)}
              />
            </GlobalToggle>
          ) : null}
          {tabs[activeTab].panel}
        </Container>
      )}
    </SizeMe>
  );
};
