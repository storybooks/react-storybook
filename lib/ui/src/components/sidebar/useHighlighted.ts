import global from 'global';
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { matchesKeyCode, matchesModifiers } from '../../keybinding';

import { CombinedDataset, Highlight, Selection } from './types';
import { cycle, isAncestor, scrollIntoView } from './utils';

const { document, window: globalWindow } = global;

export interface HighlightedProps {
  containerRef: MutableRefObject<HTMLElement>;
  isLoading: boolean;
  isBrowsing: boolean;
  dataset: CombinedDataset;
  selected: Selection;
}

const fromSelection = (selection: Selection): Highlight =>
  selection ? { itemId: selection.storyId, refId: selection.refId } : null;

export const useHighlighted = ({
  containerRef,
  isLoading,
  isBrowsing,
  dataset,
  selected,
}: HighlightedProps): [
  Highlight,
  Dispatch<SetStateAction<Highlight>>,
  MutableRefObject<Highlight>
] => {
  const initialHighlight = fromSelection(selected);
  const highlightedRef = useRef<Highlight>(initialHighlight);
  const [highlighted, setHighlighted] = useState<Highlight>(initialHighlight);

  const updateHighlighted = useCallback(
    (highlight) => {
      highlightedRef.current = highlight;
      setHighlighted(highlight);
    },
    [highlightedRef]
  );

  // Sets the highlighted node and scrolls it into view, using DOM elements as reference
  const highlightElement = useCallback(
    (element: Element, center = false) => {
      const itemId = element.getAttribute('data-item-id');
      const refId = element.getAttribute('data-ref-id');
      if (!itemId || !refId) return;
      updateHighlighted({ itemId, refId });
      scrollIntoView(element, center);
    },
    [updateHighlighted]
  );

  // Highlight and scroll to the selected story whenever the selection or dataset changes
  useEffect(() => {
    const highlight = fromSelection(selected);
    updateHighlighted(highlight);
    if (highlight) {
      const { itemId, refId } = highlight;
      setTimeout(() => {
        scrollIntoView(
          containerRef.current?.querySelector(`[data-item-id="${itemId}"][data-ref-id="${refId}"]`),
          true // make sure it's clearly visible by centering it
        );
      }, 0);
    }
  }, [dataset, highlightedRef, containerRef, selected, updateHighlighted]);

  // Highlight nodes up/down the tree using arrow keys
  useEffect(() => {
    const menuElement = document.getElementById('storybook-explorer-menu');

    let lastRequestId: number;
    const navigateTree = (event: KeyboardEvent) => {
      if (isLoading || !isBrowsing || !containerRef.current) return; // allow event.repeat
      if (!matchesModifiers(false, event)) return;

      const isArrowUp = matchesKeyCode('ArrowUp', event);
      const isArrowDown = matchesKeyCode('ArrowDown', event);
      if (!(isArrowUp || isArrowDown)) return;
      event.preventDefault();

      const requestId = globalWindow.requestAnimationFrame(() => {
        globalWindow.cancelAnimationFrame(lastRequestId);
        lastRequestId = requestId;

        const target = event.target as Element;
        if (!isAncestor(menuElement, target) && !isAncestor(target, menuElement)) return;
        if (target.hasAttribute('data-action')) (target as HTMLButtonElement).blur();

        const highlightable = Array.from(
          containerRef.current.querySelectorAll('[data-highlightable=true]')
        );
        const currentIndex = highlightable.findIndex(
          (el) =>
            el.getAttribute('data-item-id') === highlightedRef.current?.itemId &&
            el.getAttribute('data-ref-id') === highlightedRef.current?.refId
        );
        const nextIndex = cycle(highlightable, currentIndex, isArrowUp ? -1 : 1);
        const didRunAround = isArrowUp ? nextIndex === highlightable.length - 1 : nextIndex === 0;
        highlightElement(highlightable[nextIndex], didRunAround);
      });
    };

    document.addEventListener('keydown', navigateTree);
    return () => document.removeEventListener('keydown', navigateTree);
  }, [isLoading, isBrowsing, highlightedRef, highlightElement, containerRef]);

  return [highlighted, updateHighlighted, highlightedRef];
};
