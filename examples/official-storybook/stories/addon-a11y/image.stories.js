/* eslint-disable jsx-a11y/alt-text */
import React from 'react';

const text = 'Testing the a11y addon';
const image = 'http://place-hold.it/350x150';

export default {
  title: 'Addons/A11y/Image',
  parameters: {
    options: { selectedPanel: 'storybook/a11y/panel' },
  },
};

export const WithoutAlt = () => <img src={image} />;
WithoutAlt.storyName = 'Without alt';

export const WithoutAltButUnchecked = () => <img src={image} />;
WithoutAltButUnchecked.storyName = 'Without alt but unchecked';

WithoutAltButUnchecked.parameters = {
  a11y: {
    config: {
      disableOtherRules: true,
      rules: [],
    },
    options: {},
  },
};

export const WithAlt = () => <img src={image} alt={text} />;
WithAlt.storyName = 'With alt';

export const Presentation = () => <img role="presentation" src={image} />;
