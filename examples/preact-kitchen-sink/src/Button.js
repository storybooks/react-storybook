/**
 * The button component will render a clickable button
 */
const Button = ({ children, href, ...props }) => {
  const TagName = href ? 'a' : 'button';

  return (
    <TagName class="button" href={href} {...props}>
      {children}
    </TagName>
  );
};

Button.defaultProps = {
  href: undefined,
};

export default Button;
