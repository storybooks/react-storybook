/* eslint-disable react/default-props-match-prop-types */
import React, { Fragment } from 'react';
import { styled, themes, convert } from '@storybook/theming';
import { ScrollArea, TabsState, Link, Placeholder } from '@storybook/components';
import { SizeMe } from 'react-sizeme';
import { Result } from './Result';
import provideJestResult, { Test } from '../hoc/provideJestResult';

const StatusTypes = {
  PASSED_TYPE: 'passed',
  FAILED_TYPE: 'failed',
  PENDING_TYPE: 'pending',
  TODO_TYPE: 'todo',
};

const List = styled.ul({
  listStyle: 'none',
  fontSize: 14,
  padding: 0,
  margin: 0,
});

const Item = styled.li({
  display: 'block',
  padding: 0,
});

const ProgressWrapper = styled.div({
  position: 'relative',
  height: 10,
  width: 30,
  display: 'flex',
  top: -2,
});

const SuiteHead = styled.div({
  display: 'flex',
  alignItems: 'baseline',
  position: 'absolute',
  zIndex: 2,
  right: 20,
  marginTop: 15,
});

const SuiteTotals = styled(({ result, className, width }) => (
  <div className={className}>
    <Fragment>
      {width > 325 && result.assertionResults ? (
        <div>
          {result.assertionResults.length} {result.assertionResults.length > 1 ? `tests` : `test`}
        </div>
      ) : null}
      {width > 280 && result.endTime && result.startTime ? (
        <div>
          {result.endTime - result.startTime}
          ms
        </div>
      ) : null}
    </Fragment>
  </div>
))(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.color.dark,
  fontSize: '14px',
  marginTop: -5,
  '& > *': {
    marginRight: 10,
  },
}));

const SuiteProgressPortion = styled.div<{ color: any; progressPercent: number }>(
  ({ theme, color, progressPercent }) => ({
    height: 6,
    top: 3,
    width: `${progressPercent}%`,
    backgroundColor: color,
  })
);

interface ContentProps {
  tests: Test[];
  className?: string;
}

const getTestsByTypeMap = (result: any) => {
  const testsByType: Map<string, any> = new Map();
  result.assertionResults.forEach((assertion: any) => {
    testsByType.set(
      assertion.status,
      testsByType.get(assertion.status)
        ? testsByType.get(assertion.status).concat(assertion)
        : [assertion]
    );
  });
  return testsByType;
};

const getColorByType = (type: string) => {
  // using switch to allow for new types to be added
  switch (type) {
    case StatusTypes.PASSED_TYPE:
      return convert(themes.normal).color.positive;
    case StatusTypes.FAILED_TYPE:
      return convert(themes.normal).color.negative;
    case StatusTypes.PENDING_TYPE:
      return convert(themes.normal).color.warning;
    case StatusTypes.TODO_TYPE:
      return convert(themes.normal).color.purple;
    default:
      return null;
  }
};

const Content = styled(({ tests, className }: ContentProps) => (
  <div className={className}>
    {tests.map(({ name, result }) => {
      if (!result || !result.assertionResults) {
        return (
          <Placeholder key={name}>
            This story has tests configured, but no file was found
          </Placeholder>
        );
      }

      const testsByType: Map<string, any> = getTestsByTypeMap(result);
      const entries: any = testsByType.entries();
      const sortedTestsByCount = [...entries].sort((a, b) => a[1].length - b[1].length);

      return (
        <SizeMe refreshMode="debounce" key={name}>
          {({ size }: { size: any }) => {
            const { width } = size;
            return (
              <section>
                <SuiteHead>
                  <SuiteTotals {...{ result, width }} />
                  {width > 240 ? (
                    <ProgressWrapper>
                      {sortedTestsByCount.map((entry: any) => (
                        <SuiteProgressPortion
                          key={`progress-portion-${entry[0]}`}
                          color={getColorByType(entry[0])}
                          progressPercent={
                            entry[1] ? (entry[1].length / result.assertionResults.length) * 100 : 0
                          }
                        />
                      ))}
                    </ProgressWrapper>
                  ) : null}
                </SuiteHead>
                <TabsState
                  initial="failing-tests"
                  backgroundColor={convert(themes.normal).background.hoverable}
                >
                  <div
                    id="failing-tests"
                    title={`${
                      testsByType.get(StatusTypes.FAILED_TYPE)
                        ? testsByType.get(StatusTypes.FAILED_TYPE).length
                        : 0
                    } Failed`}
                    color={getColorByType(StatusTypes.FAILED_TYPE)}
                  >
                    <List>
                      {testsByType.get(StatusTypes.FAILED_TYPE) ? (
                        testsByType.get(StatusTypes.FAILED_TYPE).map((res: any) => (
                          <Item key={res.fullName || res.title}>
                            <Result {...res} />
                          </Item>
                        ))
                      ) : (
                        <Placeholder key={`no-tests-${StatusTypes.FAILED_TYPE}`}>
                          This story has no failing tests.
                        </Placeholder>
                      )}
                    </List>
                  </div>
                  <div
                    id="passing-tests"
                    title={`${
                      testsByType.get(StatusTypes.PASSED_TYPE)
                        ? testsByType.get(StatusTypes.PASSED_TYPE).length
                        : 0
                    } Passed`}
                    color={getColorByType(StatusTypes.PASSED_TYPE)}
                  >
                    <List>
                      {testsByType.get(StatusTypes.PASSED_TYPE) ? (
                        testsByType.get(StatusTypes.PASSED_TYPE).map((res: any) => (
                          <Item key={res.fullName || res.title}>
                            <Result {...res} />
                          </Item>
                        ))
                      ) : (
                        <Placeholder key={`no-tests-${StatusTypes.PASSED_TYPE}`}>
                          This story has no passing tests.
                        </Placeholder>
                      )}
                    </List>
                  </div>
                  <div
                    id="pending-tests"
                    title={`${
                      testsByType.get(StatusTypes.PENDING_TYPE)
                        ? testsByType.get(StatusTypes.PENDING_TYPE).length
                        : 0
                    } Pending`}
                    color={getColorByType(StatusTypes.PENDING_TYPE)}
                  >
                    <List>
                      {testsByType.get(StatusTypes.PENDING_TYPE) ? (
                        testsByType.get(StatusTypes.PENDING_TYPE).map((res: any) => (
                          <Item key={res.fullName || res.title}>
                            <Result {...res} />
                          </Item>
                        ))
                      ) : (
                        <Placeholder key={`no-tests-${StatusTypes.PENDING_TYPE}`}>
                          This story has no pending tests.
                        </Placeholder>
                      )}
                    </List>
                  </div>
                  <div
                    id="todo-tests"
                    title={`${
                      testsByType.get(StatusTypes.TODO_TYPE)
                        ? testsByType.get(StatusTypes.TODO_TYPE).length
                        : 0
                    } Todo`}
                    color={getColorByType(StatusTypes.TODO_TYPE)}
                  >
                    <List>
                      {testsByType.get(StatusTypes.TODO_TYPE) ? (
                        testsByType.get(StatusTypes.TODO_TYPE).map((res: any) => (
                          <Item key={res.fullName || res.title}>
                            <Result {...res} />
                          </Item>
                        ))
                      ) : (
                        <Placeholder key={`no-tests-${StatusTypes.TODO_TYPE}`}>
                          This story has no tests todo.
                        </Placeholder>
                      )}
                    </List>
                  </div>
                </TabsState>
              </section>
            );
          }}
        </SizeMe>
      );
    })}
  </div>
))({
  flex: '1 1 0%',
});

interface PanelProps {
  tests: null | Test[];
}

const Panel = ({ tests }: PanelProps) => (
  <ScrollArea vertical>
    {tests ? (
      <Content tests={tests} />
    ) : (
      <Placeholder>
        <Fragment>No tests found</Fragment>
        <Fragment>
          Learn how to&nbsp;
          <Link
            href="https://github.com/storybookjs/storybook/tree/master/addons/jest"
            target="_blank"
            withArrow
          >
            add Jest test results to your story
          </Link>
        </Fragment>
      </Placeholder>
    )}
  </ScrollArea>
);

Panel.defaultProps = {
  tests: null,
};

export default provideJestResult(Panel);
