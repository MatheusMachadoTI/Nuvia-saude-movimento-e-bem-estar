import Icon from './Icon.jsx';

export default function Button({
  children,
  icon,
  variant = '',
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn ${variant} ${className}`.trim()}
      onClick={onClick}
      {...props}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}
