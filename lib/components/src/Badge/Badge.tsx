import React, { FunctionComponent } from 'react';
import { styled } from '@storybook/theming';

const BadgeWrapper = styled.div<BadgeProps>(
  ({ theme }) => ({
    display: 'inline-block',
    fontSize: 11,
    lineHeight: '12px',
    alignSelf: 'center',
    padding: '4px 12px',
    borderRadius: '3em',
    fontWeight: theme.typography.weight.bold,
  }),
  {
    svg: {
      height: 12,
      width: 12,
      marginRight: 4,
      marginTop: -2,

      path: {
        fill: 'currentColor',
      },
    },
  },
  ({ theme, status }) => {
    switch (status) {
      case 'critical': {
        return {
          color: theme.color.critical,
          background: theme.background.critical,
        };
      }
      case 'negative': {
        return {
          color: theme.color.negative,
          background: theme.background.negative,
        };
      }
      case 'warning': {
        return {
          color: theme.color.warning,
          background: theme.background.warning,
        };
      }
      case 'neutral': {
        return {
          color: theme.color.dark,
          background: theme.color.mediumlight,
        };
      }
      case 'positive': {
        return {
          color: theme.color.positive,
          background: theme.background.positive,
        };
      }
      default: {
        return {};
      }
    }
  }
);

export interface BadgeProps {
  status: 'positive' | 'negative' | 'neutral' | 'warning' | 'critical';
}

export const Badge: FunctionComponent<BadgeProps> = ({ ...props }) => <BadgeWrapper {...props} />;
