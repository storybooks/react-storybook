import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Input,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { componentWrapperDecorator, moduleMetadata, Story, Meta } from '@storybook/angular';

import { WithoutSelectorComponent } from './without-selector.component';

export default {
  title: 'Basics / Component / without selector / Custom wrapper ComponentFactoryResolver',
  component: WithoutSelectorComponent,
  decorators: [
    moduleMetadata({
      entryComponents: [WithoutSelectorComponent],
    }),
  ],
} as Meta;

// Advanced example with custom ComponentFactoryResolver

@Component({ selector: 'component-factory-wrapper', template: '' })
class ComponentFactoryWrapperComponent implements AfterViewInit {
  @ViewChild('dynamicInsert', { read: ViewContainerRef }) dynamicInsert;

  @Input()
  componentOutlet: Type<unknown>;

  @Input()
  args: any;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngAfterViewInit() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      this.componentOutlet
    );
    const containerRef = this.viewContainerRef;
    containerRef.clear();
    const dynamicComponent = containerRef.createComponent(componentFactory);
    Object.assign(dynamicComponent.instance, this.args);
  }
}

// Live changing of args by controls does not work at the moment. When changing args storybook does not fully
// reload and therefore does not take into account the change of provider.
export const WithComponentFactoryResolver: Story = (args) => ({
  props: args,
});
WithComponentFactoryResolver.storyName = 'Custom wrapper ComponentFactoryResolver';
WithComponentFactoryResolver.argTypes = {
  name: { control: 'text' },
  color: { control: 'color' },
};
WithComponentFactoryResolver.args = { name: 'Dixie Normous', color: 'chartreuse' };
WithComponentFactoryResolver.decorators = [
  moduleMetadata({
    declarations: [ComponentFactoryWrapperComponent],
  }),
  componentWrapperDecorator(ComponentFactoryWrapperComponent, ({ args }) => ({
    args,
    componentOutlet: WithoutSelectorComponent,
  })),
];
