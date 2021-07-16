/* eslint-disable react/display-name */
import React, { forwardRef, FunctionComponent, ComponentProps } from 'react';
import { styled } from '@storybook/theming';
import { darken, lighten, rgba, transparentize } from 'polished';

export interface ButtonProps {
  isLink?: boolean;
  primary?: boolean;
  secondary?: boolean;
  tertiary?: boolean;
  gray?: boolean;
  inForm?: boolean;
  disabled?: boolean;
  small?: boolean;
  outline?: boolean;
  containsIcon?: boolean;
  children?: React.ReactNode;
}

type ButtonWrapperProps = ButtonProps;

const ButtonWrapper = styled.button<ButtonWrapperProps>(
  ({ small, theme }) => ({
    border: 0,
    borderRadius: '3em',
    cursor: 'pointer',
    display: 'inline-block',
    overflow: 'hidden',
    padding: small ? '8px 16px' : '13px 20px',
    position: 'relative',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 150ms ease-out',
    transform: 'translate3d(0,0,0)',
    verticalAlign: 'top',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    opacity: 1,
    margin: 0,
    background: 'transparent',

    fontSize: `${small ? theme.typography.size.s1 : theme.typography.size.s2 - 1}px`,
    fontWeight: theme.typography.weight.bold,
    lineHeight: '1',

    svg: {
      display: 'inline-block',
      height: small ? 14 : 16,
      width: small ? 14 : 16,

      verticalAlign: 'top',
      marginRight: small ? 4 : 6,
      marginTop: small ? -1 : -2,
      marginBottom: small ? -1 : -2,

      /* Necessary for js mouse events to not glitch out when hovering on svgs */
      pointerEvents: 'none',

      path: {
        fill: 'currentColor',
      },
    },
  }),
  ({ disabled }) =>
    disabled
      ? {
          cursor: 'not-allowed !important',
          opacity: 0.5,
          '&:hover': {
            transform: 'none',
          },
        }
      : {},
  ({ containsIcon, small }) =>
    containsIcon
      ? {
          svg: {
            display: 'block',
            margin: 0,
          },
          ...(small ? { padding: 9 } : { padding: 12 }),
        }
      : {},
  ({ theme, primary, secondary, gray }) => {
    let color;

    if (gray) {
      color = theme.color.medium;
    } else if (secondary) {
      color = theme.color.secondary;
    } else if (primary) {
      color = theme.color.primary;
    }

    return color
      ? {
          background: color,
          color: gray ? theme.color.darkest : theme.color.lightest,

          '&:hover': {
            background: darken(0.05, color),
          },
          '&:active': {
            boxShadow: 'rgba(0, 0, 0, 0.1) 0 0 0 3em inset',
          },
          '&:focus': {
            boxShadow: `${rgba(color, 1)} 0 1px 9px 2px`,
            outline: 'none',
          },
          '&:focus:hover': {
            boxShadow: `${rgba(color, 0.2)} 0 8px 18px 0px`,
          },
        }
      : {};
  },
  ({ theme, tertiary, inForm, small }) =>
    tertiary
      ? {
          background:
            theme.base === 'light'
              ? darken(0.02, theme.input.background)
              : lighten(0.02, theme.input.background),
          color: theme.input.color,
          boxShadow: `${theme.input.border} 0 0 0 1px inset`,
          borderRadius: theme.input.borderRadius,

          ...(inForm && small ? { padding: '10px 16px' } : {}),

          '&:hover': {
            background:
              theme.base === 'light'
                ? darken(0.05, theme.input.background)
                : lighten(0.05, theme.input.background),
            ...(inForm
              ? {}
              : {
                  boxShadow: 'rgba(0,0,0,.2) 0 2px 6px 0, rgba(0,0,0,.1) 0 0 0 1px inset',
                }),
          },
          '&:active': {
            background: theme.input.background,
          },
          '&:focus': {
            boxShadow: `${rgba(theme.color.secondary, 1)} 0 0 0 1px inset`,
            outline: 'none',
          },
        }
      : {},
  ({ theme, outline }) =>
    outline
      ? {
          boxShadow: `${transparentize(0.8, theme.color.defaultText)} 0 0 0 1px inset`,
          color: transparentize(0.3, theme.color.defaultText),
          background: 'transparent',

          '&:hover, &:focus': {
            boxShadow: `${transparentize(0.5, theme.color.defaultText)} 0 0 0 1px inset`,
            outline: 'none',
          },

          '&:active': {
            boxShadow: `${transparentize(0.5, theme.color.defaultText)} 0 0 0 2px inset`,
            color: transparentize(0, theme.color.defaultText),
          },
        }
      : {},
  ({ theme, outline, primary }) => {
    const color = theme.color.primary;

    return outline && primary
      ? {
          boxShadow: `${color} 0 0 0 1px inset`,
          color,

          'svg path': {
            fill: color,
          },

          '&:hover': {
            boxShadow: `${color} 0 0 0 1px inset`,
            background: 'transparent',
          },

          '&:active': {
            background: color,
            boxShadow: `${color} 0 0 0 1px inset`,
            color: theme.color.tertiary,
          },
          '&:focus': {
            boxShadow: `${color} 0 0 0 1px inset, ${rgba(color, 0.4)} 0 1px 9px 2px`,
            outline: 'none',
          },
          '&:focus:hover': {
            boxShadow: `${color} 0 0 0 1px inset, ${rgba(color, 0.2)} 0 8px 18px 0px`,
          },
        }
      : {};
  },
  ({ theme, outline, primary, secondary }) => {
    let color;

    if (secondary) {
      color = theme.color.secondary;
    } else if (primary) {
      color = theme.color.primary;
    }

    return outline && color
      ? {
          boxShadow: `${color} 0 0 0 1px inset`,
          color,

          'svg path': {
            fill: color,
          },

          '&:hover': {
            boxShadow: `${color} 0 0 0 1px inset`,
            background: 'transparent',
          },

          '&:active': {
            background: color,
            boxShadow: `${color} 0 0 0 1px inset`,
            color: theme.color.tertiary,
          },
          '&:focus': {
            boxShadow: `${color} 0 0 0 1px inset, ${rgba(color, 0.4)} 0 1px 9px 2px`,
            outline: 'none',
          },
          '&:focus:hover': {
            boxShadow: `${color} 0 0 0 1px inset, ${rgba(color, 0.2)} 0 8px 18px 0px`,
          },
        }
      : {};
  }
);

const ButtonLink = ButtonWrapper.withComponent('a');

export const Button: FunctionComponent<ComponentProps<typeof ButtonWrapper>> = Object.assign(
  forwardRef<any, ButtonProps>(({ isLink, children, ...props }, ref) => {
    if (isLink) {
      return (
        <ButtonLink {...props} ref={ref}>
          {children}
        </ButtonLink>
      );
    }
    return (
      <ButtonWrapper {...props} ref={ref}>
        {children}
      </ButtonWrapper>
    );
  }),
  {
    defaultProps: {
      isLink: false,
    },
  }
);
