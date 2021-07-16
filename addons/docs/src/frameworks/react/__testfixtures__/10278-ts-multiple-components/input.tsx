import React from 'react';

interface IAProps {
  aProperty: any;
}

interface IBProps {
  bProperty: any;
}

/**
 * A component
 */
const A = (props: IAProps): JSX.Element => <>Hi {props.aProperty}</>;

/**
 * B component
 */
const B = (props: IBProps): JSX.Element => <>Hi {props.bProperty}</>;

export { A, B };
export const component = A;
