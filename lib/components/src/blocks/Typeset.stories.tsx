import React from 'react';
import { Typeset } from './Typeset';

export default {
  title: 'Docs/Typeset',
  component: Typeset,
};

const letterSpacing = '0.15px';
const lineHeight = '48px';
const fontSizes = ['12px', '14px', '16px', '20px', '24px', '32px', '40px', '48px'];
const fontWeight = 900;
const fontFamily = 'monospace';

export const withFontSizes = () => <Typeset fontSizes={fontSizes} />;
export const withLetterSpacing = () => <Typeset fontSizes={fontSizes} letterSpacing={letterSpacing} />;
export const withLineHeight = () => <Typeset fontSizes={fontSizes} lineHeight={lineHeight} />;
export const withFontWeight = () => <Typeset fontSizes={fontSizes} fontWeight={fontWeight} />;
export const withFontFamily = () => <Typeset fontSizes={fontSizes} fontFamily={fontFamily} />;
export const withWeightText = () => (
  <Typeset fontSizes={fontSizes} fontWeight={fontWeight} sampleText="Heading" />
);
