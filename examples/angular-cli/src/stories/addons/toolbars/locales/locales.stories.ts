import { DecoratorFunction } from '@storybook/addons';
import { Meta, moduleMetadata } from '@storybook/angular';
import { Story } from '@storybook/angular/types-6-0';

import { TranslatePipe } from './translate.pipe';
import { DEFAULT_LOCALE } from './translate.service';

const withLocaleProvider: DecoratorFunction<unknown> = (storyFunc, context) => {
  const { locale } = context.globals;

  // uses `moduleMetadata` decorator to cleanly add locale provider into module metadata

  // It is also possible to do it directly in story with
  // ```
  // const sotry = storyFunc();
  // sotry.moduleMetadata = {
  //   ...sotry.moduleMetadata,
  //   providers: [
  //     ...(sotry.moduleMetadata?.providers ?? []),
  //     { provide: DEFAULT_LOCALE, useValue: locale },
  //   ],
  // };
  // return sotry;
  // ```
  // but more verbose

  return moduleMetadata({ providers: [{ provide: DEFAULT_LOCALE, useValue: locale }] })(
    storyFunc,
    context
  );
};

export default {
  title: 'Addons / Toolbars / Locales',
  decorators: [withLocaleProvider, moduleMetadata({ declarations: [TranslatePipe] })],
} as Meta;

export const WithAngularService: Story = (_args, { globals: { locale } }) => ({
  template: `
      Your locale is {{ locale }}<br>
      I say: {{ 'hello' | translate }}
    `,
  props: {
    locale,
  },
});
