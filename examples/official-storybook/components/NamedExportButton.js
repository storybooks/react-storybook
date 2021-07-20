import React from 'react';
import PropTypes from 'prop-types';
import BaseButton from './BaseButton';

/** Uses [BaseButton](/docs/addons-a11y-basebutton--default) internally. */
const NamedExportButton = (props) => <BaseButton {...props} />;

NamedExportButton.defaultProps = {
  disabled: false,
  onClick: () => {},
  style: {},
};

NamedExportButton.propTypes = {
  /** Boolean indicating whether the button should render as disabled */
  disabled: PropTypes.bool,
  /** button label. */
  label: PropTypes.string.isRequired,
  /** onClick handler */
  onClick: PropTypes.func,
  /** Custom styles */
  style: PropTypes.shape({}),
};

export { NamedExportButton };
