import React from 'react';

interface AvatarProps {
  /** specify icon="search" or icon={IconComponent} */
  icon: React.ReactNode | string;
}

const Avatar = ({ icon }: AvatarProps) => <div className="hello">Hello Component {icon}</div>;

export const component = Avatar;
