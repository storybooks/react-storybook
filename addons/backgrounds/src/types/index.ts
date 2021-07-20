import { ReactElement } from 'react';

export interface GlobalState {
  name: string | undefined;
  selected: string | undefined;
}

export interface BackgroundSelectorItem {
  id: string;
  title: string;
  onClick: () => void;
  value: string;
  active: boolean;
  right?: ReactElement;
}

export interface Background {
  name: string;
  value: string;
  cssVariables?: {
    [cssVariableName: string]: string;
  };
  cssVariablesAsset?: string;
}

export interface BackgroundsParameter {
  default?: string;
  disable?: boolean;
  values: Background[];
}

export interface BackgroundsConfig {
  backgrounds: Background[] | null;
  selectedBackgroundName: string | null;
  defaultBackgroundName: string | null;
  disable: boolean;
}
