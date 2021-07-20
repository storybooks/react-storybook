export const highlightStyle = (color: string) => `
  outline: 2px dashed ${color};
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(255,255,255,0.6);
`;

export const highlightObject = (color: string) => ({
  outline: `2px dashed ${color}`,
  outlineOffset: 2,
  boxShadow: '0 0 0 6px rgba(255,255,255,0.6)',
});
