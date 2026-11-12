import Icon from './Icon.jsx';

export default function Empty({ icon, children, action }) {
  return (
    <div className="empty">
      <Icon name={icon} size={34} />
      <p>{children}</p>
      {action}
    </div>
  );
}
