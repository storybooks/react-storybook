import { Meta } from '@storybook/react';
import React, { useRef } from 'react';
import { useDOMRect } from './useDOMRect';

export default {
  title: 'Lib/Addons/hooks/UseDOMRect',
  parameters: {
    actions: { disable: true },
    controls: { disable: true },
    test: { disable: true },
  },
} as Meta;

export const Default = () => {
  const { ref, rect } = useDOMRect();

  return (
    <div ref={ref} style={{ border: '1px solid #cccccc', padding: 32 }}>
      <h2>Default will return the ref and initial DOMRect</h2>
      <p>You can slide the width of the menu/canvas to change size of div</p>
      <div>{`width: ${rect.width}px`}</div>
      <div>{`height: ${rect.height}px`}</div>
      <div>{`left: ${rect.left}px`}</div>
      <div>{`right: ${rect.right}px`}</div>
      <div>{`top: ${rect.top}px`}</div>
      <div>{`bottom: ${rect.bottom}px`}</div>
      <div>{`x: ${rect.x}px`}</div>
      <div>{`y: ${rect.y}px`}</div>
    </div>
  );
};

export const Live = () => {
  const { ref, rect } = useDOMRect({ live: true });

  return (
    <div ref={ref} style={{ border: '1px solid #cccccc', padding: 32 }}>
      <h2>Set live to true and you will be get an update anytime a value changes</h2>
      <p>You can slide the width of the menu/canvas to change size of div</p>
      <div>{`width: ${rect.width}px`}</div>
      <div>{`height: ${rect.height}px`}</div>
      <div>{`left: ${rect.left}px`}</div>
      <div>{`right: ${rect.right}px`}</div>
      <div>{`top: ${rect.top}px`}</div>
      <div>{`bottom: ${rect.bottom}px`}</div>
      <div>{`x: ${rect.x}px`}</div>
      <div>{`y: ${rect.y}px`}</div>
    </div>
  );
};

export const CustomRef = () => {
  const ref = useRef<HTMLUListElement>(null);
  const { rect } = useDOMRect({ live: true, ref });

  return (
    <ul ref={ref} style={{ border: '1px solid #cccccc', padding: 32 }}>
      <li>{`width: ${rect.width}px`}</li>
      <li>{`height: ${rect.height}px`}</li>
      <li>{`left: ${rect.left}px`}</li>
      <li>{`right: ${rect.right}px`}</li>
      <li>{`top: ${rect.top}px`}</li>
      <li>{`bottom: ${rect.bottom}px`}</li>
      <li>{`x: ${rect.x}px`}</li>
      <li>{`y: ${rect.y}px`}</li>
    </ul>
  );
};

export const SubPixelsDefault = () => {
  const { ref, rect } = useDOMRect<HTMLUListElement>();

  return (
    <ul
      ref={ref}
      style={{
        border: '1px solid #cccccc',
        padding: 32,
        position: 'absolute',
        top: 22.5,
        left: 22.5,
      }}
    >
      <li>{`width: ${rect.width}px`}</li>
      <li>{`height: ${rect.height}px`}</li>
      <li>{`left: ${rect.left}px`}</li>
      <li>{`right: ${rect.right}px`}</li>
      <li>{`top: ${rect.top}px`}</li>
      <li>{`bottom: ${rect.bottom}px`}</li>
      <li>{`x: ${rect.x}px`}</li>
      <li>{`y: ${rect.y}px`}</li>
    </ul>
  );
};

export const SubPixelsRounded = () => {
  const { ref, rect } = useDOMRect<HTMLUListElement>({ rounded: true });

  return (
    <ul
      ref={ref}
      style={{
        border: '1px solid #cccccc',
        padding: 32,
        position: 'absolute',
        top: 22.5,
        left: 22.5,
      }}
    >
      <li>{`width: ${rect.width}px`}</li>
      <li>{`height: ${rect.height}px`}</li>
      <li>{`left: ${rect.left}px`}</li>
      <li>{`right: ${rect.right}px`}</li>
      <li>{`top: ${rect.top}px`}</li>
      <li>{`bottom: ${rect.bottom}px`}</li>
      <li>{`x: ${rect.x}px`}</li>
      <li>{`y: ${rect.y}px`}</li>
    </ul>
  );
};
