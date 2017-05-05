import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import DesktopLayout from './desktop';
import MobileLayout from './mobile';

const Layout = props => (
  <Media query="(max-width: 650px)">
    {matches => (matches ? <MobileLayout {...props} /> : <DesktopLayout {...props} />)}
  </Media>
);

Layout.propTypes = {
  showLeftPanel: PropTypes.bool.isRequired,
  showDownPanel: PropTypes.bool.isRequired,
  goFullScreen: PropTypes.bool.isRequired,
  leftPanel: PropTypes.func.isRequired,
  preview: PropTypes.func.isRequired,
  downPanel: PropTypes.func.isRequired,
  downPanelInRight: PropTypes.bool.isRequired,
};

export default Layout;
