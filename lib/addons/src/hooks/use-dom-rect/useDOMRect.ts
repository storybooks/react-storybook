import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { ResizeObserver } from 'resize-observer';

const initialState = {
  height: 0,
  width: 0,
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
  x: 0,
  y: 0,
};

type UseDOMRectBounds = typeof initialState;

type DOMRectKeys = keyof UseDOMRectBounds;

const isRectDirty = (a: DOMRect, b: DOMRect) => {
  // You can not iterate a DOMRect instance with Object.keys, so we use
  // the initialState mock, which will also steer us clear of .toJSON
  return !Object.keys(initialState).every((k: DOMRectKeys) => a[k] === b[k]);
};

const getRoundedRect = (rect: DOMRect) => {
  const roundedRect = { ...initialState };

  // You can not iterate a DOMRect instance with Object.keys, so we use
  // the initialState mock, which will also steer us clear of .toJSON
  Object.keys(roundedRect).forEach((k: DOMRectKeys) => {
    // `Math.round` is in line with how CSS resolves sub-pixel values
    roundedRect[k] = Math.round(rect[k]);
  });

  return roundedRect as DOMRect;
};

export interface UseDOMRectProps<T extends HTMLElement = HTMLDivElement> {
  rounded?: boolean;
  live?: boolean;
  ref?: MutableRefObject<T>;
}

/**
 * ### @storybook/addons
 * ## useDOMRect
 * #### Hook that returns a DOMRect description of the size/position of a reference, and the reference itself.
 *
 * - Without the option `{ ref: ... }` a ref will be provided and returned by the hook
 * - With the option `{ live: true }` it will update everytime DOMRect changes
 * - With the option `{ rounded: true}` values will be rounded like CSS resolves sub-pixel values
 *
 * Returns `{ ref: MutableRefObject, rect: DOMRect }`
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/DOMRect
 *
 * #### Example:
 * ```
 * const Component = () => {
 *   const { ref, rect } = useDOMRect<HTMLSpanElement>();
 *   return (<span ref={ref}>{`I am ${rect.width}px wide`}</span>)
 * }
 * ```
 *
 */
export const useDOMRect = <T extends HTMLElement = HTMLDivElement>({
  rounded,
  live,
  ref: customRef,
}: UseDOMRectProps<T> = {}) => {
  const hookRef = useRef<T>(null);
  const ref: MutableRefObject<T> = customRef || hookRef;
  const [_rect, setRect] = useState<UseDOMRectBounds>({ ...initialState });
  const rect = _rect as DOMRect;

  useEffect(() => {
    let observer: ResizeObserver;

    if (live) {
      const onResize = ([entry]: { target: Element }[]) => {
        let newRect = entry.target.getBoundingClientRect();

        if (rounded) {
          newRect = getRoundedRect(newRect);
        }

        const isDirty = isRectDirty(rect, newRect);

        if (isDirty) {
          setRect(newRect);
        }
      };

      observer = new ResizeObserver(onResize);
    }

    if (ref && ref.current) {
      if (observer) {
        observer.observe(ref.current);
      }

      let newRect = ref.current.getBoundingClientRect();

      if (rounded) {
        newRect = getRoundedRect(newRect);
      }

      setRect(newRect);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [ref]);

  return { ref, rect: rect as DOMRect };
};
