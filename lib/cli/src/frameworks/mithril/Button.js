/* eslint-disable react/display-name */
/** @jsx m */

import m from 'mithril';
import './button.css';

export const Button = {
  view: ({ children, attrs }) => {
    const mode = attrs.primary ? 'storybook-button--primary' : 'storybook-button--secondary';
    const size = attrs.size || 'medium';

    return (
      <button
        type="button"
        class={['storybook-button', `storybook-button--${size}`, mode].join(' ')}
        style={attrs.backgroundColor && { backgroundColor: attrs.backgroundColor }}
        onclick={attrs.onClick}
      >
        {children}
      </button>
    );
  },
};
