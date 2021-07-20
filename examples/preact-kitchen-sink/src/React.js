import React from 'react';
import PropTypes from 'prop-types';

export const ReactFunctionalComponent = ({ label }) => {
  const [clicks, setValue] = React.useState(0);
  return (
    <div
      tabIndex={0}
      onClick={() => setValue(clicks + 1)}
      style={{ cursor: 'pointer' }}
      onKeyDown={() => undefined}
      role="button"
    >
      <div style={{ color: 'red' }}>{label}</div>
      <div>Clicked {clicks} times.</div>
    </div>
  );
};

ReactFunctionalComponent.propTypes = {
  label: PropTypes.string.isRequired,
};

export class ReactClassComponent extends React.Component {
  state = {
    clicks: 0,
  };

  render() {
    const { label } = this.props;
    const { clicks } = this.state;
    return (
      <div
        tabIndex={0}
        onClick={() => this.setState({ clicks: clicks + 1 })}
        onKeyDown={() => undefined}
        style={{ cursor: 'pointer' }}
        role="button"
      >
        <div style={{ color: 'green' }}>{label}</div>
        <div>Clicked {clicks} times.</div>
      </div>
    );
  }
}

ReactClassComponent.propTypes = {
  label: PropTypes.string.isRequired,
};
