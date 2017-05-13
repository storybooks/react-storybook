import PropTypes from 'prop-types';
import React from 'react';
import { baseFonts } from '../theme';

const wrapperStyle = {
  background: '#F7F7F7',
  marginBottom: 10,
};

const headingStyle = {
  ...baseFonts,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  fontSize: '12px',
  fontWeight: 'bolder',
  color: '#828282',
  border: '1px solid #C1C1C1',
  textAlign: 'center',
  borderRadius: '2px',
  padding: '5px',
  cursor: 'pointer',
  margin: 0,
  float: 'none',
  overflow: 'hidden',
};

const linkStyle = {
  textDecoration: 'none',
};

const Header = ({ name, url }) => (
  <div style={wrapperStyle}>
    <a style={linkStyle} href={url} target="_blank" rel="noopener noreferrer">
      <h3 style={headingStyle}>{name}</h3>
    </a>
  </div>
);

Header.propTypes = {
  name: PropTypes.string,
  url: PropTypes.string,
};

export default Header;
