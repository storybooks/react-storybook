/* eslint-disable react/display-name */
import React, { ComponentProps } from 'react';
import { styled } from '@storybook/theming';
import { icons, IconKey } from './icons';

import Svg from './svg';

const Path = styled.path({
  fill: 'currentColor',
});

export interface IconsProps extends ComponentProps<typeof Svg> {
  icon?: IconKey;
  symbol?: IconKey;
}

// TODO: if we can resize the 1024 to 20, we can remove the size attributes
export const Icons = React.memo<IconsProps>(({ icon, symbol, ...props }) => (
  <Svg viewBox="0 0 1024 1024" {...props}>
    {symbol ? <use xlinkHref={`#icon--${symbol}`} /> : <Path d={icons[icon]} />}
  </Svg>
));

export interface SymbolsProps extends ComponentProps<typeof Svg> {
  icons?: IconKey[];
}

export const Symbols = React.memo<SymbolsProps>(({ icons: keys = Object.keys(icons) }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', width: 0, height: 0 }}
    data-chromatic="ignore"
  >
    {keys.map((key: IconKey) => (
      <symbol id={`icon--${key}`} key={key}>
        <Path d={icons[key]} />
      </symbol>
    ))}
  </svg>
));
