import { easing, animation } from './animation';

import { color, background, typography } from './base';

export interface ThemeVars {
  base: 'light' | 'dark';

  colorPrimary?: string;
  colorSecondary?: string;

  // UI
  appBg?: string;
  appContentBg?: string;
  appBorderColor?: string;
  appBorderRadius?: number;

  // Typography
  fontBase?: string;
  fontCode?: string;

  // Text colors
  textColor?: string;
  textInverseColor?: string;
  textMutedColor?: string;

  // Toolbar default and active colors
  barTextColor?: string;
  barSelectedColor?: string;
  barBg?: string;

  // Form colors
  inputBg?: string;
  inputBorder?: string;
  inputTextColor?: string;
  inputBorderRadius?: number;

  brandTitle?: string;
  brandUrl?: string;
  brandImage?: string;

  gridCellSize?: number;
}

export type Color = typeof color;
export type Background = typeof background;
export type Typography = typeof typography;
export type Animation = typeof animation;
export type Easing = typeof easing;

export type TextSize = number | string;
export interface Brand {
  title: string | undefined;
  url: string | null | undefined;
  image: string | null | undefined;
}

export interface Theme {
  color: Color;
  background: Background;
  typography: Typography;
  animation: Animation;
  easing: Easing;

  input: {
    border: string;
    background: string;
    color: string;
    borderRadius: number;
  };

  // UI
  layoutMargin: number;
  appBorderColor: string;
  appBorderRadius: number;

  // Toolbar default/active colors
  barTextColor: string;
  barSelectedColor: string;
  barBg: string;

  brand: Brand;

  code: {
    [key: string]: string | Record<string, unknown>;
  };

  [key: string]: any;
}
