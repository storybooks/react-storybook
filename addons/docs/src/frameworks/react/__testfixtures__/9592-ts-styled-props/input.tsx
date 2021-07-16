import React from 'react';
import styled from 'styled-components';

interface HelloProps {
  title: string;
}

const StyledHello = styled.div`
  color: red;
`;

const Hello = ({ title }: HelloProps) => (
  <StyledHello className="hello">Hello Component {title}</StyledHello>
);

export const component = Hello;
