import { Component, Input } from '@angular/core';
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { Story, Meta } from '@storybook/angular/types-6-0';

@Component({
  selector: 'sb-button',
  template: `<button [style.background-color]="color"><ng-content></ng-content></button>`,
  styles: [
    `
      button {
        padding: 4px;
      }
    `,
  ],
})
class SbButtonComponent {
  @Input()
  color = '#5eadf5';
}

export default {
  title: 'Basics / Component / With ng-content / Button with different contents',
  // Implicitly declares the component to Angular
  // This will be the component described by the addon docs
  component: SbButtonComponent,
  decorators: [
    // Wrap all stories with this template
    componentWrapperDecorator(
      (story) => `<sb-button [color]="propsColor">${story}</sb-button>`,
      ({ args }) => ({ propsColor: args.color })
    ),
  ],
  argTypes: {
    color: { control: 'color' },
  },
} as Meta;

// By default storybook uses the default export component if no template or component is defined in the story
// So Storybook nests the component twice because it is first added by the componentWrapperDecorator.
export const AlwaysDefineTemplateOrComponent: Story = () => ({});

export const EmptyButton: Story = () => ({
  template: '',
});

export const WithDynamicContentAndArgs: Story = (args) => ({
  template: `${args.content}`,
});
WithDynamicContentAndArgs.argTypes = {
  content: { control: 'text' },
};
WithDynamicContentAndArgs.args = { content: 'My button text' };

export const InH1: Story = () => ({
  template: 'My button in h1',
});
InH1.decorators = [componentWrapperDecorator((story) => `<h1>${story}</h1>`)];
InH1.storyName = 'In <h1>';

@Component({
  selector: 'sb-emoji',
  template: `{{ emoji }}`,
  styles: [
    `
      :host {
        padding-right: 4px;
      }
    `,
  ],
})
class SbEmojiComponent {
  @Input()
  emoji = '👾';
}

export const WithComponent: Story = () => ({});
WithComponent.parameters = {
  // Override the default component
  // It is therefore necessary to manually declare the parent component with moduleMetadata
  component: SbEmojiComponent,
};
WithComponent.decorators = [
  moduleMetadata({
    declarations: [SbButtonComponent],
  }),
];

export const WithComponentAndArgs: Story = (args) => ({
  props: args,
});
WithComponentAndArgs.parameters = {
  component: SbEmojiComponent,
};
WithComponentAndArgs.decorators = [
  moduleMetadata({
    declarations: [SbButtonComponent],
  }),
];
WithComponentAndArgs.argTypes = {
  emoji: { control: 'text' },
};
WithComponentAndArgs.args = { emoji: '🌵' };
