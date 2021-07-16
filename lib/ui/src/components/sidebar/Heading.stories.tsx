/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { ThemeProvider, useTheme, Theme } from '@storybook/theming';
import { action } from '@storybook/addon-actions';

import { Heading } from './Heading';

export default {
  component: Heading,
  title: 'UI/Sidebar/Heading',
  excludeStories: /.*Data$/,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (storyFn: any) => <div style={{ padding: '0 20px', maxWidth: '230px' }}>{storyFn()}</div>,
  ],
};

const menuItems = [
  { title: 'Menu Item 1', onClick: action('onActivateMenuItem'), id: '1' },
  { title: 'Menu Item 2', onClick: action('onActivateMenuItem'), id: '2' },
  { title: 'Menu Item 3', onClick: action('onActivateMenuItem'), id: '3' },
];

export const menuHighlighted = () => <Heading menuHighlighted menu={menuItems} />;

export const standardData = { menu: menuItems };

export const standard = () => {
  const theme = useTheme() as Theme;
  return (
    <ThemeProvider
      theme={{
        ...theme,
        brand: {
          title: undefined,
          url: undefined,
          image: undefined,
        },
      }}
    >
      <Heading menu={menuItems} />
    </ThemeProvider>
  );
};

export const standardNoLink = () => {
  const theme = useTheme() as Theme;
  return (
    <ThemeProvider
      theme={{
        ...theme,
        brand: {
          title: undefined,
          url: null,
          image: undefined,
        },
      }}
    >
      <Heading menu={menuItems} />
    </ThemeProvider>
  );
};

export const linkAndText = () => {
  const theme = useTheme() as Theme;
  return (
    <ThemeProvider
      theme={{
        ...theme,
        brand: {
          title: 'My title',
          url: 'https://example.com',
          image: null,
        },
      }}
    >
      <Heading menu={menuItems} />
    </ThemeProvider>
  );
};

export const onlyText = () => {
  const theme = useTheme() as Theme;
  return (
    <ThemeProvider
      theme={{
        ...theme,
        brand: {
          title: 'My title',
          url: null,
          image: null,
        },
      }}
    >
      <Heading menu={menuItems} />
    </ThemeProvider>
  );
};

export const longText = () => {
  const theme = useTheme() as Theme;
  return (
    <ThemeProvider
      theme={{
        ...theme,
        brand: {
          title: 'My title is way to long to actually fit',
          url: null,
          image: null,
        },
      }}
    >
      <Heading menu={menuItems} />
    </ThemeProvider>
  );
};

export const customBrandImage = () => {
  const theme = useTheme() as Theme;
  return (
    <ThemeProvider
      theme={{
        ...theme,
        brand: {
          title: 'My Title',
          url: 'https://example.com',
          image: 'https://via.placeholder.com/150x22',
        },
      }}
    >
      <Heading menu={menuItems} />
    </ThemeProvider>
  );
};

export const customBrandImageTall = () => {
  const theme = useTheme() as Theme;
  return (
    <ThemeProvider
      theme={{
        ...theme,
        brand: {
          title: 'My Title',
          url: 'https://example.com',
          image: 'https://via.placeholder.com/100x150',
        },
      }}
    >
      <Heading menu={menuItems} />
    </ThemeProvider>
  );
};

export const customBrandImageUnsizedSVG = () => {
  const theme = useTheme() as Theme;
  return (
    <ThemeProvider
      theme={{
        ...theme,
        brand: {
          title: 'My Title',
          url: 'https://example.com',
          image: 'https://s.cdpn.io/91525/potofgold.svg',
        },
      }}
    >
      <Heading menu={menuItems} />
    </ThemeProvider>
  );
};

export const noBrand = () => {
  const theme = useTheme() as Theme;
  return (
    <ThemeProvider
      theme={{
        ...theme,
        brand: {
          title: null,
          url: null,
          image: null,
        },
      }}
    >
      <Heading menu={menuItems} />
    </ThemeProvider>
  );
};
