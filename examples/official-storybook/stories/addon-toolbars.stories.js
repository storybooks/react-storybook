import React from 'react';
import { styled } from '@storybook/theming';

export default {
  title: 'Addons/Toolbars',
  parameters: {
    layout: 'centered',
  },
};

const getCaptionForLocale = (locale) => {
  switch (locale) {
    case 'es':
      return 'Hola!';
    case 'fr':
      return 'Bonjour!';
    case 'zh':
      return '你好!';
    case 'kr':
      return '안녕하세요!';
    case 'en':
    default:
      return 'Hello';
  }
};

export const Locale = (_args, { globals: { locale } }) => (
  <Themed>
    <div style={{ fontSize: 30 }}>Your locale is '{locale}', so I say:</div>
    <div style={{ fontSize: 14 }}>note: cycle backwards and forwards with "K" & "L"</div>
    <div style={{ fontSize: 60, fontWeight: 'bold' }}>{getCaptionForLocale(locale)}</div>
  </Themed>
);

const Themed = styled.div(({ theme }) => ({
  color: theme.color.defaultText,
}));
