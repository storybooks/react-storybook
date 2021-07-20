import React from 'react';

import BaseButton from '../components/BaseButton';

export default {
  title: 'Addons/Backgrounds',
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'white', value: '#ffffff' },
        { name: 'light', value: '#eeeeee' },
        { name: 'gray', value: '#cccccc' },
        { name: 'dark', value: '#222222' },
        { name: 'black', value: '#000000' },
      ],
    },
  },
};

const Template = (args) => <BaseButton style={{ color: 'var(--text-color)' }} {...args} />;

export const Story1 = Template.bind({});
Story1.args = {
  label: 'You should be able to switch backgrounds for this story',
};

export const Story2 = Template.bind({});
Story2.args = {
  label: 'This one too!',
};

export const Overridden = Template.bind({});
Overridden.args = {
  label: 'This one should have different backgrounds',
};
Overridden.parameters = {
  backgrounds: {
    default: 'blue',
    values: [
      { name: 'pink', value: 'hotpink' },
      { name: 'blue', value: 'deepskyblue' },
    ],
  },
};

export const WithGradient = Template.bind({});
WithGradient.args = {
  label: 'This one should have a nice gradient',
};
WithGradient.parameters = {
  backgrounds: {
    default: 'gradient',
    values: [
      {
        name: 'gradient',
        value:
          'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)',
      },
    ],
  },
};

export const WithImage = Template.bind({});
WithImage.args = {
  label: 'This one should have an image background',
};
WithImage.parameters = {
  backgrounds: {
    default: 'space',
    values: [
      {
        name: 'space',
        value: 'url(https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_960_720.jpg)',
      },
    ],
  },
};

export const DisabledBackgrounds = Template.bind({});
DisabledBackgrounds.args = {
  label: 'This one should not use backgrounds',
};
DisabledBackgrounds.parameters = {
  backgrounds: { disable: true },
};

export const DisabledGrid = Template.bind({});
DisabledGrid.args = {
  label: 'This one should not use grid',
};
DisabledGrid.parameters = {
  backgrounds: {
    grid: { disable: true },
  },
};
export const GridCellProperties = Template.bind({});
GridCellProperties.args = {
  label: 'This one should have different grid properties',
};
GridCellProperties.parameters = {
  backgrounds: {
    grid: {
      cellSize: 10,
      cellAmount: 4,
      opacity: 0.2,
    },
  },
};

export const AlignedGridWhenFullScreen = Template.bind({});
AlignedGridWhenFullScreen.args = {
  label: 'Grid should have an offset of 0 when in fullscreen',
};
AlignedGridWhenFullScreen.parameters = {
  layout: 'fullscreen',
};

const CSSVariablesTemplate = (args) => (
  <div style={{ background: 'var(--wrapper-bg-color)', padding: 20 }}>
    <p>
      Wrapper should use css variable color --wrapper-bg-color and button should use --text-color
    </p>
    <BaseButton style={{ color: 'var(--text-color)' }} {...args} />
  </div>
);

export const WithCssVariables = CSSVariablesTemplate.bind({});
WithCssVariables.args = {
  label: 'This text should have a color provided through the CSS variables',
};
WithCssVariables.parameters = {
  backgrounds: {
    default: 'theme-with-css-variables',
    values: [
      {
        name: 'theme-with-css-variables',
        value: 'green',
        cssVariables: {
          '--text-color': 'brown',
          '--wrapper-bg-color': '#a2a2fe',
        },
      },
    ],
  },
};

export const WithCssVariablesFromAsset = CSSVariablesTemplate.bind({});
WithCssVariablesFromAsset.args = {
  label: 'This text should have a color provided through the CSS variables from an asset file',
};
WithCssVariablesFromAsset.parameters = {
  backgrounds: {
    default: 'theme-with-css-variables-from-asset-file',
    values: [
      {
        name: 'theme-with-css-variables-from-asset-file',
        value: 'red',
        cssVariablesAsset: 'assets/sample-theme-variables.css',
      },
    ],
  },
};
