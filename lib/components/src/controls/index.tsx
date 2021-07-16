import React, { Suspense } from 'react';

export * from '../types';

export * from './Array';
export * from './Boolean';
export type { ColorProps } from './Color';

const LazyColorControl = React.lazy(() => import('./Color'));

export const ColorControl = (props: React.ComponentProps<typeof LazyColorControl>) => (
  <Suspense fallback={<div />}>
    <LazyColorControl {...props} />
  </Suspense>
);

export * from './Date';
export * from './Number';
export * from './options';
export * from './Object';
export * from './Range';
export * from './Text';
export * from './Files';
