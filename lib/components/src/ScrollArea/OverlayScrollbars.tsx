import React from 'react';
import OverlayScrollbars from 'overlayscrollbars';

interface OverlayScrollbarsComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  options?: OverlayScrollbars.Options;
  extensions?: OverlayScrollbars.Extensions;
}

/**
 * Using overlayscrollbars-react component results use the esm modules
 * which doesn't go through babel leading to IE 11 uncompatibility
 * A PR is submitted that may fix this:
 * https://github.com/KingSora/OverlayScrollbars/pull/218
 * */

export const OverlayScrollbarsComponent: React.FC<OverlayScrollbarsComponentProps> = ({
  options = {},
  extensions,
  className,
  children,
  ...rest
}) => {
  const osTargetRef = React.useRef<HTMLDivElement>();
  const osInstance = React.useRef<OverlayScrollbars>();

  React.useEffect(() => {
    osInstance.current = OverlayScrollbars(osTargetRef.current, options, extensions);
    mergeHostClassNames(osInstance.current, className);
    return () => {
      if (OverlayScrollbars.valid(osInstance.current)) {
        osInstance.current.destroy();
        osInstance.current = null;
      }
    };
  }, [className, extensions, options]);

  React.useEffect(() => {
    if (OverlayScrollbars.valid(osInstance.current)) {
      osInstance.current.options(options);
    }
  }, [options]);

  React.useEffect(() => {
    if (OverlayScrollbars.valid(osInstance.current)) {
      mergeHostClassNames(osInstance.current, className);
    }
  }, [className]);

  return (
    <div className="os-host" {...rest} ref={osTargetRef}>
      <div className="os-resize-observer-host" />
      <div className="os-padding">
        <div className="os-viewport">
          <div className="os-content">{children}</div>
        </div>
      </div>
      <div className="os-scrollbar os-scrollbar-horizontal ">
        <div className="os-scrollbar-track">
          <div className="os-scrollbar-handle" />
        </div>
      </div>
      <div className="os-scrollbar os-scrollbar-vertical">
        <div className="os-scrollbar-track">
          <div className="os-scrollbar-handle" />
        </div>
      </div>
      <div className="os-scrollbar-corner" />
    </div>
  );
};

function mergeHostClassNames(osInstance: OverlayScrollbars, className: string) {
  if (OverlayScrollbars.valid(osInstance)) {
    const { host } = osInstance.getElements();
    const regex = new RegExp(
      `(^os-host([-_].+|)$)|${osInstance.options().className.replace(/\s/g, '$|')}$`,
      'g'
    );
    const osClassNames = host.className
      .split(' ')
      .filter((name) => name.match(regex))
      .join(' ');

    host.className = `${osClassNames} ${className || ''}`;
  }
}

export default OverlayScrollbarsComponent;
