import { createContext } from 'react';

export type AddToMapFn = (id: string) => void;

export type OpenMap = Record<string, boolean>;

interface AccordionContextProps {
  openState: OpenMap;
  addToMap: AddToMapFn;
  onOpen: (id: string) => void;
  onClose: (id: string) => void;
  lined: boolean | undefined;
  bordered: boolean | undefined;
  indentBody: boolean | undefined;
  narrow: boolean | undefined;
  preventToggle: boolean | undefined;
}

export const AccordionContext = createContext<AccordionContextProps | null>(null);
