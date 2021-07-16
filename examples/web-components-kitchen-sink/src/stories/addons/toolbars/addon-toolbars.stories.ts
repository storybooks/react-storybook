import { html } from 'lit';
import { Story, Meta } from '@storybook/web-components';

export default {
  title: 'Addons / Toolbars',
} as Meta;

const getCaptionForLocale = (locale: string) => {
  switch (locale) {
    case 'es':
      return 'Hola!';
    case 'fr':
      return 'Bonjour !';
    case 'zh':
      return '你好!';
    case 'kr':
      return '안녕하세요!';
    case 'en':
    default:
      return 'Hello';
  }
};

export const Locale: Story = (args, { globals: { locale } }) =>
  html` <div>Your locale is '${locale}', so I say: ${getCaptionForLocale(locale)}</div> `;
