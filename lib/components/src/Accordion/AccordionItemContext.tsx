import { createContext } from 'react';

interface AccordionItemContextProps {
  id: string;
  onOpen: () => void;
  onClose: () => void;
  /**
   * Carries down to AccordionItem children and is used by AccordionHeader
   */
  preventOpen: boolean | undefined;
  /**
   * Carries down to AccordionItem children and ise used by AccordionHeader
   */
  preventToggle: boolean | undefined;
  /**
   * Used by AccordionHeader and AccordionBody for state control by AccordionItem's parent
   * or self control
   */
  open: boolean | undefined;
}

export const AccordionItemContext = createContext<AccordionItemContextProps | null>(null);
