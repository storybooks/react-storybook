import React, { useRef, useEffect, ReactNode } from 'react';

const usePrevious = (value: any) => {
  const ref = useRef();

  useEffect(() => {
    // happens after return
    ref.current = value;
  }, [value]);

  return ref.current;
};

const useUpdate = (update: boolean, value: any) => {
  const previousValue = usePrevious(value);

  return update ? value : previousValue;
};

export interface AddonPanelProps {
  active: boolean;
  children: ReactNode;
}

export const AddonPanel = ({ active, children }: AddonPanelProps) => (
  // the transform is to prevent a bug where the content would be invisible
  // the hidden attribute is an valid html element that's both accessible and works to visually hide content
  <div hidden={!active} style={{ transform: 'translateX(0px)' }}>
    {useUpdate(active, children)}
  </div>
);
