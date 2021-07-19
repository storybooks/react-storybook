import React, { FunctionComponent, KeyboardEventHandler } from 'react';
import memoize from 'memoizerific';

import { styled, Color, lighten, darken } from '@storybook/theming';

const match = memoize(1000)((requests, actual, value, fallback = 0) =>
  actual.split('-')[0] === requests ? value : fallback
);

const ArrowSpacing = 8;

export interface ArrowProps {
  color: keyof Color;
  placement: string;
}

const Arrow = styled.div<ArrowProps>(
  {
    position: 'absolute',
    borderStyle: 'solid',
  },
  ({ placement }) => {
    let x = 0;
    let y = 0;

    switch (true) {
      case placement.startsWith('left') || placement.startsWith('right'): {
        y = 8;
        break;
      }
      case placement.startsWith('top') || placement.startsWith('bottom'): {
        x = 8;
        break;
      }
      default: {
        //
      }
    }

    const transform = `translate3d(${x}px, ${y}px, 0px)`;
    return { transform };
  },
  ({ theme, color, placement }) => ({
    bottom: `${match('top', placement, ArrowSpacing * -1, 'auto')}px`,
    top: `${match('bottom', placement, ArrowSpacing * -1, 'auto')}px`,
    right: `${match('left', placement, ArrowSpacing * -1, 'auto')}px`,
    left: `${match('right', placement, ArrowSpacing * -1, 'auto')}px`,

    borderBottomWidth: `${match('top', placement, '0', ArrowSpacing)}px`,
    borderTopWidth: `${match('bottom', placement, '0', ArrowSpacing)}px`,
    borderRightWidth: `${match('left', placement, '0', ArrowSpacing)}px`,
    borderLeftWidth: `${match('right', placement, '0', ArrowSpacing)}px`,

    borderTopColor: match(
      'top',
      placement,
      theme.color[color] || color || theme.base === 'light'
        ? lighten(theme.background.app)
        : darken(theme.background.app),
      'transparent'
    ),
    borderBottomColor: match(
      'bottom',
      placement,
      theme.color[color] || color || theme.base === 'light'
        ? lighten(theme.background.app)
        : darken(theme.background.app),
      'transparent'
    ),
    borderLeftColor: match(
      'left',
      placement,
      theme.color[color] || color || theme.base === 'light'
        ? lighten(theme.background.app)
        : darken(theme.background.app),
      'transparent'
    ),
    borderRightColor: match(
      'right',
      placement,
      theme.color[color] || color || theme.base === 'light'
        ? lighten(theme.background.app)
        : darken(theme.background.app),
      'transparent'
    ),
  })
);

export interface WrapperProps {
  color: keyof Color;
  placement: string;
  hidden?: boolean;
  hasChrome: boolean;
}

const Wrapper = styled.div<WrapperProps>(
  ({ hidden }) => ({
    display: hidden ? 'none' : 'inline-block',
    zIndex: 2147483647,
  }),
  ({ theme, color, hasChrome }) =>
    hasChrome
      ? {
          background:
            theme.color[color] || color || theme.base === 'light'
              ? lighten(theme.background.app)
              : darken(theme.background.app),
          filter: `
            drop-shadow(0px 5px 5px rgba(0,0,0,0.05))
            drop-shadow(0 1px 3px rgba(0,0,0,0.1))
          `,
          borderRadius: theme.appBorderRadius * 2,
          fontSize: theme.typography.size.s1,
        }
      : {}
);

export interface TooltipProps {
  arrowRef?: any;
  tooltipRef?: any;
  hasChrome?: boolean;
  arrowProps?: any;
  placement?: string;
  color?: keyof Color;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
}

export const Tooltip: FunctionComponent<TooltipProps> = ({
  placement,
  hasChrome,
  children,
  arrowProps,
  tooltipRef,
  arrowRef,
  color,
  ...props
}) => {
  return (
    <Wrapper hasChrome={hasChrome} placement={placement} ref={tooltipRef} {...props} color={color}>
      {hasChrome && <Arrow placement={placement} ref={arrowRef} {...arrowProps} color={color} />}
      {children}
    </Wrapper>
  );
};

Tooltip.defaultProps = {
  color: undefined,
  arrowRef: undefined,
  tooltipRef: undefined,
  hasChrome: true,
  placement: 'top',
  arrowProps: {},
};
