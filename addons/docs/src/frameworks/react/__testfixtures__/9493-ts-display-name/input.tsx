/* eslint-disable @typescript-eslint/ban-types */
import styled from '@emotion/styled';
import React from 'react';

const Wrapper = styled('div')<{}>(({ theme }) => ({
  backgroundColor: 'tomato',
  color: 'white',
  padding: 10,
}));

type AlertCode = 'Code Red' | 'Code Yellow' | 'Code Green';

export interface EmpireAlertProps {
  /**
   * A title that brings attention to the alert.
   */
  title: AlertCode;
  /**
   * A message alerting about Empire activities.
   */
  message: string;
}

/**
 * This message should show up in the Docs panel if everything works fine.
 */
export const EmpireAlert: React.FC<EmpireAlertProps> = ({
  title = 'Code Yellow',
  message,
}: EmpireAlertProps) => (
  <Wrapper>
    <h1>{title}</h1>
    <p>{message}</p>
  </Wrapper>
);
EmpireAlert.displayName = 'SomeOtherDisplayName';

export const component = EmpireAlert;
